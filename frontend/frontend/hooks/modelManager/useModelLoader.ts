// useModelLoader.ts
import { useEffect, useCallback } from 'react';
import { useStore } from '../../store/store';

interface UseModelLoaderOptions {
  worker: React.MutableRefObject<Worker | null>;
  selectedModel: string;
  setLoadedModels: React.Dispatch<React.SetStateAction<Set<string>>>;
  setProgressItems: React.Dispatch<React.SetStateAction<any[]>>;
  isMounted: React.MutableRefObject<boolean>;
  log: (...args: any[]) => void;
}

const useModelLoader = ({
  worker,
  selectedModel,
  setLoadedModels,
  setProgressItems,
  isMounted,
  log,
}: UseModelLoaderOptions) => {
  // **Access Zustand's Loading State Setters**
  const setIsLoading = useStore((state) => state.setIsLoading);
  const setLoadingMessage = useStore((state) => state.setLoadingMessage);
  const setStatus = useStore((state) => state.setStatus);
  const setStatusMessage = useStore((state) => state.setStatusMessage);

  const handleWorkerMessage = useCallback(
    (e: MessageEvent) => {
      if (!isMounted.current) return;

      // Destructure all relevant fields from the worker message
      const { status: msgStatus, name, file, progress, loaded, total, model_id, message } = e.data;

      log(`ModelLoader: Received message: ${JSON.stringify(e.data)}`);

      // Validate 'model_id'
      if (!model_id && msgStatus !== 'error') {
        log(
          `ModelLoader: Received message without a valid model_id. Message: ${JSON.stringify(e.data)}`
        );
        return;
      }

      if (model_id && model_id !== selectedModel) {
        log(
          `ModelLoader: Received message for model ID "${model_id}", which does not match the selected model "${selectedModel}". Ignoring.`
        );
        return;
      }

      switch (msgStatus) {
        case 'loading':
          setStatus('loading');
          setLoadingMessage('Initializing model...');
          setIsLoading(true);
          log(`ModelLoader: Loading started for model ID: ${model_id}`);
          break;

        case 'initiate':
        case 'download':
          setProgressItems((prev) => [...prev, e.data]);
          setLoadingMessage(`Downloading ${file}...`);
          log(`ModelLoader: Initiated download for file: ${file}`);
          break;

        case 'progress':
          setProgressItems((prev) =>
            prev.map((item) => {
              if (item.file === file) {
                return { ...item, progress, loaded, total };
              }
              return item;
            })
          );

          // Construct a dynamic loading message based on progress
          const progressPercentage = progress.toFixed(2);
          setLoadingMessage(`${name} (${file}): ${progressPercentage}% loaded`);
          log(`ModelLoader: ${name} (${file}): ${progressPercentage}% loaded`);
          break;

        case 'done':
          setProgressItems((prev) => prev.filter((item) => item.file !== file));
          setLoadingMessage(`${name} (${file}): Completed`);
          log(`ModelLoader: Completed loading of file: ${file}`);
          break;

        case 'ready':
          setStatus('ready');
          setLoadedModels((prev) => new Set(prev).add(model_id));
          setStatusMessage('Model loaded successfully. Ready for chat.');
          setIsLoading(false); // Stop loading
          setLoadingMessage(''); // Clear loading message
          log(`ModelLoader: Loading completed for model ID: ${model_id}`);
          break;

        case 'error':
          setStatus(null);
          setStatusMessage(`Error: ${message || 'Unknown error'}`);
          setIsLoading(false); // Stop loading
          setLoadingMessage(`Error: ${message || 'Unknown error'}`);
          log(`ModelLoader: Loading error: ${message}`);
          break;

        default:
          // Ignore other messages
          log(`ModelLoader: Ignored unknown status: ${msgStatus}`);
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
      setIsLoading,
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
