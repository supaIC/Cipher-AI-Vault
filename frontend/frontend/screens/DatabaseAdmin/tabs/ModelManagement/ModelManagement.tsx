import React, { useEffect } from 'react';
import { modelsConfig } from '../../../../hooks/modelManager/modelsConfig'; // Import modelsConfig here

interface ModelManagementProps {
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  loadedModels: Set<string>;
  isRunning: boolean;
  renderActionButton: (
    label: string,
    onClick: () => void,
    disabled: boolean,
    primary?: boolean
  ) => JSX.Element;
  worker: React.MutableRefObject<Worker | null>;
  setStatus: React.Dispatch<React.SetStateAction<string | null>>;
  setStatusMessage: React.Dispatch<React.SetStateAction<string>>;
  log: (message: string) => void;
}

const ModelManagement: React.FC<ModelManagementProps> = ({
  selectedModel,
  setSelectedModel,
  loadedModels,
  isRunning,
  renderActionButton,
  worker,
  setStatus,
  setStatusMessage,
  log,
}) => {
  // Set default selected model if none is selected
  useEffect(() => {
    if (!selectedModel && modelsConfig.length > 0) {
      setSelectedModel(modelsConfig[0].model_id);
    }
  }, [selectedModel, setSelectedModel]);

  const handleLoadModel = () => {
    worker.current?.postMessage({ type: 'load', data: { model_id: selectedModel } });
    setStatus('loading');
    setStatusMessage('Loading model...');
    log(`Client: Sent load request for model ID "${selectedModel}"`);
  };

  return (
    <div className="card">
      <h3 className="card-title">Model Management</h3>
      <div className="form-group">
        <label htmlFor="modelSelect">Select Model:</label>
        <select
          id="modelSelect"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isRunning}
          className="select-input"
          aria-label="Select Model"
        >
          {modelsConfig.map((model) => (
            <option key={model.key} value={model.model_id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
      {renderActionButton(
        loadedModels.has(selectedModel) ? 'Model Loaded' : 'Load Model',
        handleLoadModel,
        loadedModels.has(selectedModel) || isRunning || !selectedModel,
        true
      )}
    </div>
  );
};

export default ModelManagement;

