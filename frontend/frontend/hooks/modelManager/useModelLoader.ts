import { useEffect, useCallback } from 'react';

interface UseModelLoaderOptions {
  worker: React.MutableRefObject<Worker | null>;
  selectedModel: string;
  setStatus: React.Dispatch<React.SetStateAction<string | null>>;
  setStatusMessage: React.Dispatch<React.SetStateAction<string>>;
  setLoadedModels: React.Dispatch<React.SetStateAction<Set<string>>>;
  setProgressItems: React.Dispatch<React.SetStateAction<any[]>>;
  setLoadingMessage: React.Dispatch<React.SetStateAction<string>>;
  isMounted: React.MutableRefObject<boolean>;
  log: (message: string) => void;
}

const useModelLoader = ({
  worker,
  selectedModel,
  setStatus,
  setStatusMessage,
  setLoadedModels,
  setProgressItems,
  setLoadingMessage,
  isMounted,
  log,
}: UseModelLoaderOptions) => {
  const handleWorkerMessage = useCallback(
    (e: MessageEvent) => {
      if (!isMounted.current) return;

      const { status: msgStatus, data: msgData, model_id, message } = e.data;

      log(`ModelLoader: Received message: ${JSON.stringify(e.data)}`);

      if (!model_id && msgStatus !== 'error') {
        console.warn(`ModelLoader: Received message without a valid model_id. Message: ${JSON.stringify(e.data)}`);
        return;
      }

      if (model_id && model_id !== selectedModel) {
        console.warn(
          `ModelLoader: Received message for model ID "${model_id}", which does not match the selected model "${selectedModel}". Ignoring.`
        );
        return;
      }

      switch (msgStatus) {
        case 'loading':
          setStatus('loading');
          setLoadingMessage(msgData);
          break;

        case 'initiate':
        case 'download':
          setProgressItems((prev) => [...prev, e.data]);
          break;

        case 'progress':
          setProgressItems((prev) =>
            prev.map((item) => {
              if (item.file === e.data.file) {
                return { ...item, ...e.data };
              }
              return item;
            })
          );
          break;

        case 'done':
          setProgressItems((prev) => prev.filter((item) => item.file !== e.data.file));
          break;

        case 'ready':
          setStatus('ready');
          setLoadedModels((prev) => new Set(prev).add(model_id));
          setStatusMessage('Model loaded successfully. Ready for chat.');
          break;

        case 'error':
          setStatus(null);
          setStatusMessage(`Error: ${message}`);
          break;

        default:
          // Ignore other messages
          break;
      }
    },
    [
      isMounted,
      log,
      selectedModel,
      setStatus,
      setStatusMessage,
      setLoadedModels,
      setProgressItems,
      setLoadingMessage,
    ]
  );

  useEffect(() => {
    const currentWorker = worker.current;
    if (!currentWorker) return;

    currentWorker.addEventListener('message', handleWorkerMessage);

    return () => {
      currentWorker.removeEventListener('message', handleWorkerMessage);
    };
  }, [handleWorkerMessage, worker]);
};

export default useModelLoader;