import * as express from "express";
import * as cors from "cors";
import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------

/**
 * @description Initializes the Firebase Admin SDK, allowing access to Firestore and other Firebase services.
 */
initializeApp();

/**
 * @constant {express.Application} app
 * @description Express application instance for handling HTTP requests.
 */
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies from incoming requests.
app.use(cors({ origin: true })); // Enable Cross-Origin Resource Sharing (CORS) for all origins.

// -----------------------------------------------------------------------------
// Configuration Constants
// -----------------------------------------------------------------------------

/**
 * @constant {string} openaiKey
 * @description The OpenAI API key, retrieved from Firebase functions configuration.
 * 
 * Note: The API key should be securely stored and not hardcoded. It is accessed here via 
 * Firebase Functions configuration, which can be set using the CLI:
 * `$ firebase functions:config:set openai.key="YOUR_OPENAI_API_KEY"`
 */
const openaiKey: string = functions.config().openai.key;

/**
 * @constant {string} apiUrl
 * @description Base URL for the OpenAI API.
 */
const apiUrl = "https://api.openai.com";

/**
 * @constant {object} runtimeOpts
 * @description Configuration options for the Firebase Cloud Function runtime.
 * 
 * @property {number} timeoutSeconds - The timeout for the function in seconds.
 */
const runtimeOpts = {
  timeoutSeconds: 300,
};

// -----------------------------------------------------------------------------
// Firestore Helper Functions
// -----------------------------------------------------------------------------

/**
 * @function readQuery
 * @description Reads a query document from the Firestore database.
 * 
 * @param {string} key - The document key to retrieve.
 * @returns {Promise<Query | undefined>} The query document or undefined if it does not exist.
 */
const readQuery = async (key: string): Promise<Query | undefined> => {
  return await read({ key, collection: "query" });
};

/**
 * @function readCachedResponse
 * @description Reads a cached response from the Firestore database.
 * 
 * @param {string} key - The document key to retrieve.
 * @returns {Promise<unknown | undefined>} The cached response or undefined if it does not exist.
 */
const readCachedResponse = async (key: string): Promise<unknown | undefined> => {
  return await read({ key, collection: "cache" });
};

/**
 * @function read
 * @description Generic function to read a document from Firestore.
 * 
 * @template T
 * @param {object} params - Parameters for the read operation.
 * @param {string} params.key - The document key to retrieve.
 * @param {"cache" | "query"} params.collection - The Firestore collection to read from.
 * @returns {Promise<T | undefined>} The document data cast to type T or undefined if it does not exist.
 */
const read = async <T>({ key, collection }: { key: string; collection: "cache" | "query"; }): Promise<T | undefined> => {
  const doc = await getFirestore().collection(collection).doc(key).get();
  
  if (!doc.exists) {
    return undefined;
  }

  return doc.data() as T;
};

/**
 * @function writeCacheResponse
 * @description Writes a response to the cache in Firestore.
 * 
 * @param {object} params - Parameters for the write operation.
 * @param {string} params.key - The document key under which the response will be stored.
 * @param {object} params.data - The response data to cache.
 * @returns {Promise<void>} A promise that resolves when the write is complete.
 */
const writeCacheResponse = async ({ key, data }: { key: string; data: object; }) => {
  await getFirestore().collection("cache").doc(key).set(data);
};

// -----------------------------------------------------------------------------
// Query Management Functions
// -----------------------------------------------------------------------------

/**
 * @interface Query
 * @description Interface representing the structure of a query document in Firestore.
 * 
 * @property {"pending" | "success" | "error"} status - The status of the query.
 * @property {string} [error] - Optional error message if the query failed.
 */
interface Query {
  status: "pending" | "success" | "error";
  error?: string;
}

/**
 * @function updateQuery
 * @description Updates the status of a query document in Firestore.
 * 
 * @param {object} params - Parameters for the update operation.
 * @param {string} params.key - The document key of the query to update.
 * @param {"pending" | "success" | "error"} params.status - The new status of the query.
 * @param {string} [params.error] - Optional error message if updating to "error" status.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
const updateQuery = async ({ key, status, error }: { key: string; status: "pending" | "success" | "error"; error?: string; }) => {
  await getFirestore().collection("query").doc(key).update({ status, ...(error !== undefined && { error }) });
};

/**
 * @function initPendingQuery
 * @description Initializes a new query document in Firestore with a "pending" status.
 * 
 * @param {object} params - Parameters for the initialization operation.
 * @param {string} params.key - The document key for the new query.
 * @returns {Promise<{ success: boolean }>} An object indicating whether the initialization was successful.
 */
const initPendingQuery = async ({ key }: { key: string; }): Promise<{ success: boolean }> => {
  const db = getFirestore();
  const ref = db.collection("query").doc(key);

  try {
    await db.runTransaction(async (t) => {
      const doc = await t.get(ref);

      if (doc.exists) {
        throw new Error("Document already exists.");
      }

      t.set(ref, { status: "pending" });
    });

    return { success: true };
  } catch (_err: unknown) {
    return { success: false };
  }
};

// -----------------------------------------------------------------------------
// Proxy Request Handling
// -----------------------------------------------------------------------------

/**
 * @function proxyOpenAi
 * @description Proxies requests to the OpenAI API, utilizing Firestore for caching and idempotency.
 * 
 * @param {object} params - Parameters for the proxy operation.
 * @param {express.Request} params.req - The incoming request object.
 * @param {express.Response} params.res - The outgoing response object.
 * @param {"images/generations" | "chat/completions"} params.api - The OpenAI API endpoint to call.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
const proxyOpenAi = async ({ req, res, api }: { req: express.Request; res: express.Response; api: "images/generations" | "chat/completions"; }) => {
  const key = req.get("idempotency-key");

  if (key === undefined) {
    res.status(500).send("An idempotency key is mandatory to provide the same result no matter how many times it's applied.");
    return;
  }

  const query = await readQuery(key);

  if (query !== undefined) {
    await pollCachedResponse({ key, res });
    return;
  }

  const { success } = await initPendingQuery({ key });

  if (!success) {
    await pollCachedResponse({ key, res });
    return;
  }

  try {
    const data = await fetchOpenAi({ req, api });

    await Promise.all([
      writeCacheResponse({ key, data }),
      updateQuery({ key, status: "success" }),
    ]);

    res.json(data);
  } catch (err: Error | unknown) {
    const error = err instanceof Error && err.message !== undefined ? err.message : "An unexpected error was thrown while calling OpenAI.";

    await updateQuery({ key, status: "error", error });

    // Note: Given that we do not always return the same error from the function, the smart contract will display an error indicating it cannot replicate the response.
    // Again, this is just a demo app.
    res.status(500).send(err);
  }
};

// -----------------------------------------------------------------------------
// Polling Cached Responses
// -----------------------------------------------------------------------------

/**
 * @function waitOneSecond
 * @description Simple helper function to wait for one second.
 * 
 * @returns {Promise<void>} A promise that resolves after a one-second delay.
 */
const waitOneSecond = (): Promise<void> => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 1000);
  });
};

/**
 * @function pollCachedResponse
 * @description Polls the cache for a response, returning it if found, or retrying until a timeout occurs.
 * 
 * @param {object} params - Parameters for the polling operation.
 * @param {string} params.key - The document key of the cached response.
 * @param {express.Response} params.res - The outgoing response object.
 * @param {number} [params.attempt=1] - The current attempt number, defaults to 1.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
const pollCachedResponse = async ({ key, res, attempt = 1 }: { key: string; res: express.Response; attempt?: number; }): Promise<void> => {
  const cache = await readCachedResponse(key);

  if (cache !== undefined) {
    res.json(cache);
    return;
  }

  const query = await readQuery(key);
  if (query?.error !== undefined) {
    res.status(500).send("The fetch to OpenAI failed.");
    return;
  }

  if (attempt < 30) {
    await waitOneSecond();
    return await pollCachedResponse({ key, res, attempt: attempt + 1 });
  }

  res.status(500).send("No cached response found after 30 seconds.");
};

// -----------------------------------------------------------------------------
// Fetching from OpenAI
// -----------------------------------------------------------------------------

/**
 * @function fetchOpenAi
 * @description Sends a POST request to the OpenAI API and returns the response data.
 * 
 * @param {object} params - Parameters for the fetch operation.
 * @param {express.Request} params.req - The incoming request object.
 * @param {"images/generations" | "chat/completions"} params.api - The OpenAI API endpoint to call.
 * @returns {Promise<object>} The response data from the OpenAI API.
 * @throws Will throw an error if the response is not OK (status code outside 200-299 range).
 */
const fetchOpenAi = async ({ req, api }: { req: express.Request; api: "images/generations" | "chat/completions"; }): Promise<object> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openaiKey}`,
  };

  const response = await fetch(`${apiUrl}/v1/${api}`, {
    method: "POST",
    headers,
    body: JSON.stringify(req.body),
  });

  if (!response.ok) {
    throw new Error(`Response not ok. Status ${response.status}. Message ${response.statusText}.`);
  }

  return await response.json();
};

// -----------------------------------------------------------------------------
// Express Routes
// -----------------------------------------------------------------------------

/**
 * @route POST /images/generations
 * @description Route handler for generating images via the OpenAI API.
 */
app.post("/images/generations", async (req, res) => {
  await proxyOpenAi({ req, res, api: "images/generations" });
});

/**
 * @route POST /chat/completions
 * @description Route handler for generating chat completions via the OpenAI API.
 */
app.post("/chat/completions", async (req, res) => {
  await proxyOpenAi({ req, res, api: "chat/completions" });
});

// -----------------------------------------------------------------------------
// Firebase Cloud Function Export
// -----------------------------------------------------------------------------

/**
 * @function exports.openai
 * @description Exports the Express app as a Firebase Cloud Function with specified runtime options.
 */
exports.openai = functions.runWith(runtimeOpts).https.onRequest(app);
