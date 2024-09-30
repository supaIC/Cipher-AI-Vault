import React from 'react';

interface ModelStatusOverlayProps {
  status: string | null;
  loadingMessage: string;
}

const ModelStatusOverlay: React.FC<ModelStatusOverlayProps> = ({ status, loadingMessage }) => {
  return (
    <>
      {status === 'loading' && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>{loadingMessage}</p>
        </div>
      )}
    </>
  );
};

export default ModelStatusOverlay;