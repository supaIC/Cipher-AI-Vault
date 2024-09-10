import React, { useState, useEffect, useRef } from "react";
import { getEmbedding, EmbeddingIndex, initializeModel } from "../../hooks/client-vector-search/src/index";
import * as data from "../../hooks/dataManager/dataManager";

interface SearchResult {
  input: string;
  distance: number;
  object: {
    name: string;
    description: string;
  };
}

interface Asset {
  key: string;
  url: string;
}

interface DatabaseAdminProps {
  assets: Array<Asset>;
  privateData: data.FullDataQuery | null;
}

const DatabaseAdmin: React.FC<DatabaseAdminProps> = ({ assets, privateData }) => {
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
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<'public' | 'private'>('public');

  const worker = useRef<Worker | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const log = (message: string) => {
    console.log(`[Client Log] ${message}`);
  };

  // Filter JSON file names from the provided assets (public files)
  const publicJsonAssets = assets.filter((asset) => asset.key.includes("/data-store/"));

  // Extract private files from privateData
  const privateJsonAssets = privateData ? 
    privateData.flatMap(userDataMap => 
      Array.isArray(userDataMap) ? userDataMap[1].allFiles : []
    ) : [];

  const initializeDB = async () => {
    if (isRunning || !selectedFile) return;

    setIsRunning(true);
    try {
      console.log("Initializing database...");
      setStatusMessage("Initializing database...");

      let initialObjects;

      if (selectedFileType === 'public') {
        const selectedAsset = publicJsonAssets.find((asset) => asset.key.endsWith(selectedFile));
        if (!selectedAsset) {
          throw new Error(`Selected public file not found: ${selectedFile}`);
        }
        const response = await fetch(selectedAsset.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch public data: ${response.statusText}`);
        }
        initialObjects = await response.json();
      } else {
        const selectedPrivateFile = privateJsonAssets.find(file => file.fileName === selectedFile);
        if (!selectedPrivateFile) {
          throw new Error(`Selected private file not found: ${selectedFile}`);
        }
        initialObjects = selectedPrivateFile.fileData;
      }

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

    let randomQuery;
    do {
      randomQuery = testQueries[Math.floor(Math.random() * testQueries.length)];
    } while (randomQuery === lastQuery);

    setLastQuery(randomQuery);  // Update lastQuery with the new query

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
      worker.current = new Worker(new URL('../../hooks/modelManager/llm.js', import.meta.url), { type: 'module' });
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
        const contextMessage = `Here's some relevant information I found that might help: ${results
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
          <div className="file-selection">
            <label htmlFor="fileTypeSelect">Select File Type: </label>
            <select
              id="fileTypeSelect"
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value as 'public' | 'private')}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            
            <label htmlFor="fileSelect">Select Data File: </label>
            <select
              id="fileSelect"
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
            >
              <option value="">--Select a file--</option>
              {selectedFileType === 'public' 
                ? publicJsonAssets.map((asset, index) => (
                    <option key={index} value={asset.key.split("/").pop()}>
                      {asset.key.split("/").pop()}
                    </option>
                  ))
                : privateJsonAssets.map((file, index) => (
                    <option key={index} value={file.fileName}>
                      {file.fileName}
                    </option>
                  ))
              }
            </select>
          </div>
          <div className="button-group">
            <button onClick={initializeDB} disabled={status === "loading" || !selectedFile}>
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
              <h1 className="model-title-text">WebGPU AI Chatbot with Memory</h1>
              <h2 className="model-subtitle-text">
                Experience a powerful and private AI chatbot that operates entirely within your browser, hosted 100% in an Internet Computer canister smart contract.
              </h2>
            </div>
            <div className="model-description-section">
              <p>
                You're about to load {" "}
                <a
                  href="https://huggingface.co/Xenova/Phi-3-mini-4k-instruct"
                  target="_blank"
                  rel="noreferrer"
                  className="external-link"
                >
                  Phi-3-mini-4k-instruct
                </a>
                , a large language model (3.82 billion parameters) optimized for web-based inference. Once downloaded (2.3 GB), the model will be cached for quicker access in future sessions. Loading times will be faster in WebGPU-enabled browsers.
              </p>
              <p>
                Before loading the model, you have the option to load a data file from your data store to initialize the vector database. This will enable the chatbot to provide answers based on your specific data.
              </p>
              <button
                className="model-load-button"
                onClick={() => {
                  worker.current?.postMessage({ type: "load" });
                  setStatus("loading");
                }}
                disabled={status !== null}
              >
                Load Model
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
                <h2>Welcome to CipherAI Vault IC!</h2>
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