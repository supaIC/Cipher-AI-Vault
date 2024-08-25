import { ic, query, Server } from 'azle';
import { HttpTransformArgs, HttpResponse } from 'azle/canisters/management';
import express from 'express';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/**
 * @constant {string} PROXY_URL
 * @description URL of the proxy service that forwards requests to the OpenAI API.
 * 
 * The proxy is essential for managing requests from the Internet Computer (IC) to
 * external services like OpenAI. This specific proxy ensures that requests
 * are handled in an idempotent manner, meaning that the same request sent multiple
 * times will produce the same result. This is crucial for consistency and reliability
 * in distributed systems, where network issues or retries can lead to duplicate requests.
 * 
 * An idempotent proxy helps prevent issues such as:
 * - **Duplicate API calls:** Ensuring that repeated calls due to network retries do not result in multiple operations.
 * - **Unintended side effects:** Protecting against side effects that could occur if an operation is mistakenly performed more than once.
 * 
 * Additionally, the proxy is necessary for **IPv6 compatibility**. The Internet Computer 
 * (IC) operates using IPv6, while many external services, such as OpenAI, only support IPv4. 
 * The proxy effectively handles this by translating the requests from IPv6 to IPv4, ensuring 
 * seamless communication between the IC and the external API.
 * 
 * The idempotency key, set in the request headers, helps the proxy recognize
 * and manage duplicate requests effectively.
 */
const PROXY_URL = 'https://us-central1-openai-proxy-ea66c.cloudfunctions.net/openai/chat/completions';

// -----------------------------------------------------------------------------
// Current Issues
// -----------------------------------------------------------------------------

/**
 * @section Current Issues
 * 
 * Despite the implementation of the idempotent proxy and the setup of the server,
 * there are still some ongoing issues:
 * 
 * 1. **500 Internal Server Error:**
 *    - When using the proxy through this server setup, we sometimes receive a 500 error
 *      from the OpenAI API. This suggests an issue with how the requests are being handled,
 *      either by the proxy or by the API itself.
 *    - Potential causes:
 *      - **Proxy Configuration:** There might be a misconfiguration in how the proxy is handling
 *        the requests or translating them from IPv6 to IPv4.
 *      - **Request Formatting:** The format of the request payload sent to the proxy might not be
 *        fully compatible with the expectations of the OpenAI API.
 *      - **Timeouts or Resource Limits:** The proxy or the API might be hitting timeouts or resource
 *        limits, leading to a 500 error.
 *    - **Next Steps:**
 *      - **Detailed Logging:** Implement more detailed logging within the proxy and the server
 *        to trace where the error is originating.
 *      - **Request Validation:** Double-check the structure and content of the requests being
 *        sent to the proxy to ensure they match the expected format.
 *      - **Proxy Review:** Review and possibly update the proxy configuration to ensure it properly
 *        handles the requests coming from the IC.
 */

// -----------------------------------------------------------------------------
// Server Setup
// -----------------------------------------------------------------------------

/**
 * @function
 * @name Server
 * @description Initializes and exports the main server function using Azle's Server utility.
 * 
 * The server handles incoming HTTP requests, forwards them to the OpenAI API via a proxy,
 * and returns the response. It uses Express for routing and middleware.
 */
export default Server(
    () => {
        /**
         * @constant {object} app
         * @description An instance of an Express application.
         */
        const app = express();

        /**
         * @function use
         * @description Middleware to parse incoming JSON requests.
         */
        app.use(express.json());

        // ---------------------------------------------------------------------
        // Chat Endpoint
        // ---------------------------------------------------------------------

        /**
         * @route POST /chat
         * @description Handles chat requests by forwarding them to the OpenAI API via a proxy.
         * 
         * @param {Request} req - The incoming request object containing the chat parameters.
         * @param {Response} res - The outgoing response object to be sent back to the client.
         */
        app.post('/chat', async (req, res) => {
            // Destructure necessary parameters from the request body
            const { prompt, model, max_tokens, temperature } = req.body;

            try {
                /**
                 * @function setOutgoingHttpOptions
                 * @description Sets the outgoing HTTP options, specifically allocating cycles for the request.
                 */
                ic.setOutgoingHttpOptions({
                    cycles: 30000000000n // Allocating 30 billion cycles for the outgoing HTTP request
                });

                /**
                 * @constant {object} response
                 * @description Sends the request to the OpenAI API via the proxy URL.
                 */
                const response = await fetch(PROXY_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'idempotency-key': req.get('idempotency-key') || 'default-key', // Optionally set an idempotency key to ensure repeatable requests
                    },
                    body: JSON.stringify({
                        model,
                        messages: [{ role: 'user', content: prompt }], // Structure the prompt as a message object
                        max_tokens,
                        temperature,
                    }),
                });

                console.log(response); // Log the entire response object for debugging purposes

                // -----------------------------------------------------------------
                // Error Handling
                // -----------------------------------------------------------------

                /**
                 * @description If the response from the OpenAI API is not OK, log the details and return an error response.
                 */
                if (!response.ok) {
                    const errorText = await response.text(); // Get the response body as text
                    console.error('OpenAI API error:', response.status, response.statusText, errorText); // Log status and error details
                    res.status(response.status).json({ error: 'OpenAI API error', details: errorText }); // Send error response to client
                    return;
                }

                // -----------------------------------------------------------------
                // Successful Response Handling
                // -----------------------------------------------------------------

                /**
                 * @constant {object} responseJson
                 * @description Parse the successful response from the OpenAI API as JSON.
                 */
                const responseJson = await response.json();
                console.log('OpenAI API response JSON:', responseJson); // Log the parsed JSON response for debugging
                res.json(responseJson); // Send the JSON response back to the client

            } catch (error) {
                // -----------------------------------------------------------------
                // Generic Error Handling
                // -----------------------------------------------------------------

                /**
                 * @description If any errors occur during the process, log the error and return a generic error response.
                 */
                console.error('Error:', error);
                res.status(500).json({ error: 'An error occurred while processing the request.' }); // Send a 500 Internal Server Error response
            }
        });

        // ---------------------------------------------------------------------
        // Static Files Handling
        // ---------------------------------------------------------------------

        /**
         * @function use
         * @description Serve static files from the /dist directory, typically the frontend build output.
         */
        app.use(express.static('/dist'));

        /**
         * @function listen
         * @description Start the Express server and return the instance.
         * 
         * @returns {object} The server instance.
         */
        return app.listen();
    },
    {
        // ---------------------------------------------------------------------
        // HTTP Response Transformation
        // ---------------------------------------------------------------------

        /**
         * @function transform
         * @description Transform function to modify the HTTP response before it's sent to the client.
         * 
         * @param {HttpTransformArgs} httpTransformArgs - Arguments provided for the HTTP transformation.
         * @returns {HttpResponse} Modified HTTP response object.
         */
        transform: query(
            [HttpTransformArgs], // Accepts HTTP transform arguments
            HttpResponse, // Returns an HTTP response object
            (httpTransformArgs) => {
                return {
                    ...httpTransformArgs.response, // Spread the original response object
                    headers: [], // Optionally modify headers (here we clear them)
                    body: httpTransformArgs.context, // Replace the body with the context if necessary
                };
            }
        ),
    }
);
