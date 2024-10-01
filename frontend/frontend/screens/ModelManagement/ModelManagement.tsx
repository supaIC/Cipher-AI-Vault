import React from 'react';
import { modelsConfig } from '../../hooks/modelManager/modelsConfig';
import "./ModelManagement.css";

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
  loadModel: () => void;
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
  loadModel,
  setStatus,
  setStatusMessage,
  log,
}) => {
  const handleLoadModel = () => {
    if (selectedModel && !loadedModels.has(selectedModel)) {
      loadModel();
      setStatus('loading');
      setStatusMessage('Loading model...');
      log(`Client: Initiated load request for model ID "${selectedModel}"`);
    }
  };

  return (
    <div className="model-management-card">
      <h3 className="model-management-card-title">Model Management</h3>
      <div className="model-management-form-group">
        <label htmlFor="modelSelect">Select Model:</label>
        <select
          id="modelSelect"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isRunning}
          className="model-management-select-input"
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