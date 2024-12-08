import { useEffect, useRef, useCallback } from 'react';

interface UseWorkerOptions {
  selectedModel: string;
  log: (message: string) => void;
}

const useWorker = ({ selectedModel, log }: UseWorkerOptions) => {
  const workerRef = useRef<Worker | null>(null);

  const initializeWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      log('Existing worker terminated.');
    }

    try {
      const workerUrl = new URL('./worker.js', import.meta.url);
      log(`Worker URL: ${workerUrl}`);

      workerRef.current = new Worker(workerUrl, { type: 'module' });
      log('Worker initialized.');

      // Add an error event listener
      workerRef.current.addEventListener('error', (error) => {
        console.error('Worker error:', error);
        log(`Worker error: ${error.message}`);
      });
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      log(`Failed to initialize worker: ${error instanceof Error ? error.message : String(error)}`);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        log('Worker terminated.');
      }
    };
  }, [log]);

  useEffect(() => {
    const cleanup = initializeWorker();
    return cleanup;
  }, [initializeWorker]);

  const loadModel = useCallback(() => {
    if (workerRef.current && selectedModel) {
      workerRef.current.postMessage({
        type: 'load',
        model_id: selectedModel
      });
      log(`Requested to load model: ${selectedModel}`);
    } else if (!workerRef.current) {
      console.error('Worker not initialized');
      log('Worker not initialized');
    }
  }, [selectedModel, log]);

  return { workerRef, loadModel };
};

export default useWorker;