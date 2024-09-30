import React from 'react';

interface StatusOverlayProps {
  status: string | null;
  loadingMessage: string;
}

const StatusOverlay: React.FC<StatusOverlayProps> = ({ status, loadingMessage }) => {
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

export default StatusOverlay;