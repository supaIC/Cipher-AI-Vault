// src/hooks/useWorker.ts

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

    // Adjust the path to worker.js based on your project structure
    const workerUrl = new URL('./worker.js', import.meta.url);
    log(`Worker URL: ${workerUrl}`);

    workerRef.current = new Worker(workerUrl, { type: 'module' });
    log('Worker initialized.');

    // No need to add the message event listener here

    // Post a message to the worker to load the selected model
    workerRef.current.postMessage({
      type: 'loadModel',
      modelId: selectedModel,
    });
    log(`Requested to load model: ${selectedModel}`);

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        log('Worker terminated.');
      }
    };
  }, [selectedModel, log]);

  useEffect(() => {
    const cleanup = initializeWorker();
    return cleanup;
  }, [initializeWorker]);

  return workerRef;
};

export default useWorker;
