import { useState, useCallback, useEffect, MutableRefObject } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatOptions {
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  selectedModel: string;
  worker: MutableRefObject<Worker | null>;
  log: (message: string) => void;
  handleSearch: (query: string) => Promise<any[]>;
  isMounted: MutableRefObject<boolean>;
  setStatus: React.Dispatch<React.SetStateAction<string | null>>;
  setStatusMessage: React.Dispatch<React.SetStateAction<string>>;
}

const useChat = ({
  isRunning,
  setIsRunning,
  selectedModel,
  worker,
  log,
  handleSearch,
  isMounted,
  setStatus,
  setStatusMessage,
}: UseChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [tps, setTps] = useState<number | null>(null);
  const [numTokens, setNumTokens] = useState<number | null>(null);

  const onEnter = useCallback(
    async (message: string) => {
      if (isRunning) return;

      setIsRunning(true);
      try {
        const results = await handleSearch(message);

        let fullMessage = message;

        if (results.length > 0) {
          const contextMessage = `Here's some relevant information I found that might help: ${results
            .map((result) => `${result.object.name} is ${result.object.description.toLowerCase()}`)
            .join('. ')}.\n\n`;

          fullMessage = `${contextMessage}Now, to continue our conversation: ${message}`;
        } else {
          fullMessage = `I couldn't find relevant information, but let's continue: ${message}`;
        }

        if (isMounted.current) {
          setMessages((prev) => [...prev, { role: 'user', content: fullMessage }]);
        }
      } catch (error) {
        console.error('Error during processing:', error);
      } finally {
        if (isMounted.current) {
          setIsRunning(false);
          setInput('');
        }
      }
    },
    [handleSearch, isMounted, isRunning, setIsRunning]
  );

  const onInterrupt = useCallback(() => {
    if (isRunning) {
      worker.current?.postMessage({ type: 'interrupt' });
      log('Client: Sent interrupt request.');
    }
  }, [isRunning, worker, log]);

  useEffect(() => {
    if (messages.filter((x) => x.role === 'user').length === 0) return;
    if (messages.at(-1)?.role === 'assistant') return;
    setTps(null);

    if (!selectedModel) {
      console.warn('No model selected. Cannot send generate request.');
      return;
    }

    worker.current?.postMessage({
      type: 'generate',
      data: messages,
      modelId: selectedModel,
    });
    log(`Client: Sent generate request for model ID "${selectedModel}"`);
  }, [messages, selectedModel, worker, log]);

  const handleWorkerMessage = useCallback(
    (e: MessageEvent) => {
      if (!isMounted.current) return;

      const { status: msgStatus, output, tps, numTokens, model_id, message } = e.data;

      log(`Client: Received message: ${JSON.stringify(e.data)}`);

      if (!model_id) {
        console.warn(`Client: Received message without a valid model_id. Message: ${JSON.stringify(e.data)}`);
        return;
      }

      if (model_id !== selectedModel) {
        console.warn(
          `Client: Received message for model ID "${model_id}", which does not match the selected model "${selectedModel}". Ignoring.`
        );
        return;
      }

      switch (msgStatus) {
        case 'start':
          setIsRunning(true);
          setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
          break;

        case 'update':
          setTps(tps);
          setNumTokens(numTokens);
          setMessages((prev) => {
            const cloned = [...prev];
            const last = cloned.at(-1);
            if (last) {
              cloned[cloned.length - 1] = { ...last, content: last.content + output };
            }
            return cloned;
          });
          break;

        case 'complete':
          setIsRunning(false);
          break;

        case 'interrupted':
          setIsRunning(false);
          log('Worker has been interrupted.');
          break;

        case 'error':
          setStatus(null);
          setStatusMessage(`Error: ${message}`);
          setIsRunning(false);
          break;

        default:
          // Handle other statuses if necessary
          break;
      }
    },
    [isMounted, log, selectedModel, setIsRunning, setMessages, setStatus, setStatusMessage]
  );

  useEffect(() => {
    const currentWorker = worker.current;
    if (!currentWorker) return;

    currentWorker.addEventListener('message', handleWorkerMessage);

    return () => {
      currentWorker.removeEventListener('message', handleWorkerMessage);
    };
  }, [handleWorkerMessage, worker]);

  return {
    messages,
    setMessages,
    input,
    setInput,
    tps,
    numTokens,
    onEnter,
    onInterrupt,
  };
};

export default useChat;