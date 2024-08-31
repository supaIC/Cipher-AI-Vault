import React, { useState, useEffect, useRef } from "react";
import { getEmbedding, EmbeddingIndex, initializeModel } from "../hooks/client-vector-search/src/index";

interface SearchResult {
  input: string;
  distance: number;
  object: {
    name: string;
    description: string;
  };
}

const DatabaseAdmin: React.FC = () => {
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [progressItems, setProgressItems] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [tps, setTps] = useState<number | null>(null);
  const [numTokens, setNumTokens] = useState<number | null>(null);
  const [index, setIndex] = useState<EmbeddingIndex | null>(null);

  const worker = useRef<Worker | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const log = (message: string) => {
    console.log(`[Client Log] ${message}`);
  };

  const initializeDB = async () => {
    if (isRunning) return; // Prevent multiple initializations

    setIsRunning(true);
    try {
      console.log("Initializing database...");
      setStatusMessage("Initializing database...");

      const response = await fetch("https://zks6t-giaaa-aaaap-qb7fa-cai.raw.icp0.io/zvahu-nf2zh-rqszo-mwqxb-rly67-dsmdf-xau5z-6khv7-5ch5e-a2tlw-nqe/data-store/data1.json");
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const initialObjects = await response.json();

      if (!Array.isArray(initialObjects)) {
        throw new Error("The fetched data is not an array");
      }

      console.log("Initializing the model...");
      await initializeModel();
      console.log("Model initialized successfully.");

      for (const obj of initialObjects) {
        if (obj.description) {
          obj.embedding = await getEmbedding(obj.description);
        } else {
          console.warn(`Object with id ${obj.id} has no description, skipping embedding.`);
        }
      }

      console.log("Embeddings created successfully.");

      const newIndex = new EmbeddingIndex(initialObjects);
      await newIndex.saveIndex("indexedDB");
      setIndex(newIndex);

      console.log("Database initialized successfully.");
      setStatusMessage("Database initialized successfully.");
    } catch (error) {
      console.log("Error initializing database.");
      setStatusMessage("Error initializing database.");

      if (error instanceof Error) {
        console.error("Error initializing the database:", error.message);
      } else {
        console.error("Unknown error occurred during database initialization:", error);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleSearch = async (searchQuery: string): Promise<SearchResult[]> => {
    if (isRunning || !index) return []; // Prevent search if already running or index not ready

    setIsRunning(true);
    try {
      setSearchResult([]);
      log(`Initiating search for: "${searchQuery}"...`);
      setStatusMessage(`Searching for: "${searchQuery}"...`);

      const queryEmbedding = await getEmbedding(searchQuery);
      // @ts-ignore
      const results: SearchResult[] = await index.search(queryEmbedding, { topK: 3, useStorage: "indexedDB" });

      setSearchResult(results || []);
      log(`Search completed for: "${searchQuery}".`);
      setStatusMessage(`Search completed for: "${searchQuery}".`);

      return results;
    } catch (error) {
      log("Error performing search.");
      setStatusMessage("Error performing search.");

      if (error instanceof Error) {
        console.error("Error performing search:", error.message);
      } else {
        console.error("Unknown error occurred:", error);
      }
      return [];
    } finally {
      setIsRunning(false);
    }
  };

  const performRandomTestSearch = async () => {
    log("Performing a random test search...");
    setStatusMessage("Performing a random test search...");
    const testQueries = [
      "Cipher Proxy",
      "Dfinity",
      "Supernova",
      "Internet Computer",
      "Grant",
    ];

    const randomQuery = testQueries[Math.floor(Math.random() * testQueries.length)];
    await handleSearch(randomQuery);
  };

  const clearDatabase = async () => {
    if (isRunning) return; // Prevent clearing if already running

    setIsRunning(true);
    try {
      if (index) {
        await index.deleteIndexedDB();
        setIndex(null);
        setSearchResult([]);
        setStatusMessage("Database cleared successfully.");
        console.log("Database cleared successfully.");
      } else {
        setStatusMessage("No database to clear.");
        console.log("No database to clear.");
      }
    } catch (error) {
      setStatusMessage("Error clearing database.");
      console.error("Error clearing the database:", error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('../hooks/modelManager/llm.js', import.meta.url), { type: 'module' });
    }

    const onMessageReceived = (e: MessageEvent) => {
      switch (e.data.status) {
        case 'loading':
          setStatus('loading');
          setLoadingMessage(e.data.data);
          break;

        case 'initiate':
          setProgressItems(prev => [...prev, e.data]);
          break;

        case 'progress':
          setProgressItems(prev => prev.map(item => {
            if (item.file === e.data.file) {
              return { ...item, ...e.data };
            }
            return item;
          }));
          break;

        case 'done':
          setProgressItems(prev => prev.filter(item => item.file !== e.data.file));
          break;

        case 'ready':
          setStatus('ready');
          break;

        case 'start':
          setMessages(prev => [...prev, { "role": "assistant", "content": "" }]);
          break;

        case 'update':
          const { output, tps, numTokens } = e.data;
          setTps(tps);
          setNumTokens(numTokens);
          setMessages(prev => {
            const cloned = [...prev];
            const last = cloned.at(-1);
            cloned[cloned.length - 1] = { ...last, content: last.content + output };
            return cloned;
          });
          break;

        case 'complete':
          setIsRunning(false);
          break;

        default:
          console.error(`Unknown message status: ${e.data.status}`);
      }
    };

    worker.current.addEventListener('message', onMessageReceived);

    return () => {
      if (worker.current) {
        worker.current.removeEventListener('message', onMessageReceived);
        worker.current.terminate();
      }
    };
  }, []);

  useEffect(() => {
    if (messages.filter(x => x.role === 'user').length === 0) return;
    if (messages.at(-1).role === 'assistant') return;
    setTps(null);
    worker.current?.postMessage({ type: 'generate', data: messages });
  }, [messages]);

  useEffect(() => {
    if (!chatContainerRef.current || !isRunning) return;
    const element = chatContainerRef.current;
    if (element.scrollHeight - element.scrollTop - element.clientHeight < 120) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, isRunning]);

  const onEnter = async (message: string) => {
    if (isRunning) return; // Prevent new input if already processing

    setIsRunning(true);
    try {
      const results = await handleSearch(message);

      let fullMessage = message;

      if (results.length > 0) {
        // Add the relevant search results to the context of the message
        const contextMessage = `Here’s some relevant information I found that might help: ${results
          .map(result => `${result.object.name} is ${result.object.description.toLowerCase()}`)
          .join('. ')}.\n\n`;

        fullMessage = `${contextMessage}Now, to continue our conversation: ${message}`;
      } else {
        fullMessage = `I couldn't find relevant information, but let's continue: ${message}`;
      }

      // Add the message with context to the messages array
      setMessages(prev => [...prev, { role: "user", content: fullMessage }]);
    } catch (error) {
      console.error("Error during processing:", error);
    } finally {
      setIsRunning(true);
      setInput('');
    }
  };

  const onInterrupt = () => {
    if (isRunning) {
      worker.current?.postMessage({ type: 'interrupt' });
      setIsRunning(false);
    }
  };

  const resizeInput = () => {
    if (!textareaRef.current) return;
    const target = textareaRef.current;
    target.style.height = 'auto';
    const newHeight = Math.min(Math.max(target.scrollHeight, 24), 200);
    target.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    resizeInput();
  }, [input]);

  return (
    <div className="app-container">
      <div className="content-container">
        <div className="status-results-wrapper">
          <div className="status-section">
            <h2>Status:</h2>
            <p>{statusMessage || "No actions performed yet."}</p>
          </div>

          <div className="results-section">
            <h2>Search Results:</h2>
            {searchResult.length > 0 ? (
              searchResult.map((result, index) => (
                <div key={index}>
                  <p>
                    <strong>Metadata:</strong> {JSON.stringify(result.object)}
                  </p>
                </div>
              ))
            ) : (
              <p>No results found</p>
            )}
          </div>
        </div>

        <div className="actions-wrapper">
          <h2>Initialization</h2>
          <div className="button-group">
            <button onClick={initializeDB} disabled={status === "loading"}>
              Initialize Database
            </button>
            <button onClick={clearDatabase} disabled={status === "loading"}>
              Clear Database
            </button>
            <button onClick={performRandomTestSearch} disabled={status === "loading"}>
              Test Search
            </button>
          </div>
        </div>

        {status === null && messages.length === 0 && (
          <div className="model-load-wrapper">
            <div className="model-info-section">
              <h1 className="model-title-text">Phi-3 WebGPU</h1>
              <h2 className="model-subtitle-text">
                A private and powerful AI chatbot that runs locally in your browser.
              </h2>
            </div>
            <div className="model-description-section">
              <p>
                You are about to load{" "}
                <a
                  href="https://huggingface.co/Xenova/Phi-3-mini-4k-instruct"
                  target="_blank"
                  rel="noreferrer"
                  className="external-link"
                >
                  Phi-3-mini-4k-instruct
                </a>
                , a 3.82 billion parameter LLM optimized for inference on the web. Once downloaded, the model (2.3&nbsp;GB) will be cached and reused when you revisit the page.
              </p>
              <button
                className="model-load-button"
                onClick={() => {
                  worker.current?.postMessage({ type: "load" });
                  setStatus("loading");
                }}
                disabled={status !== null}
              >
                Load model
              </button>
            </div>
          </div>
        )}

        {status === "loading" && (
          <div className="loading-wrapper">
            <p className="loading-text">{loadingMessage}</p>
            {progressItems.map(({ file, progress, total }, i) => (
              <div key={i} className="progress-item-wrapper">
                <p>{file}</p>
                <progress value={progress} max={total}></progress>
              </div>
            ))}
          </div>
        )}

        {status === "ready" && (
          <div ref={chatContainerRef} className="chat-section-wrapper">
            {messages.length === 0 ? (
              <div className="welcome-message-wrapper">
                <h2>Welcome to CipherVault IC!</h2>
                <p>
                  The model has successfully loaded. You can now start interacting with the AI.
                  Type a message in the box below to begin!
                </p>
              </div>
            ) : (
              <div className="chat-messages-wrapper">
                {messages.map((msg, index) => (
                  <p key={index}>
                    <strong>{msg.role}:</strong> {msg.content}
                  </p>
                ))}
              </div>
            )}
            <p className="chat-info-text">
              {tps && messages.length > 0 && (
                <>
                  {!isRunning && (
                    <span>
                      Generated {numTokens} tokens in {(numTokens! / tps!).toFixed(2)} seconds&nbsp;&#40;
                    </span>
                  )}
                  <>
                    <span className="tps-info-text">{tps!.toFixed(2)}</span>
                    <span> tokens/second</span>
                  </>
                  {!isRunning && (
                    <>
                      <span>&#41;.</span>
                      <button
                        className="reset-button"
                        onClick={() => {
                          worker.current?.postMessage({ type: "reset" });
                          setMessages([]);
                        }}
                      >
                        Reset
                      </button>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        )}

        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-input-box"
            placeholder="Type your message..."
            value={input}
            disabled={status !== "ready"}
            onKeyDown={(e) => {
              if (input.length > 0 && !isRunning && e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onEnter(input);
              }
            }}
            onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          />
          {isRunning ? (
            <button className="input-button-stop" onClick={onInterrupt}>
              Stop
            </button>
          ) : (
            <button className="input-button-send" onClick={() => onEnter(input)} disabled={input.length === 0}>
              Send
            </button>
          )}
        </div>

        <p className="disclaimer-text">Disclaimer: Generated content may be inaccurate or false.</p>
      </div>
    </div>
  );

};

export default DatabaseAdmin;