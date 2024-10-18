// LoadingOverlay.tsx
import React from 'react';
import './LoadingOverlay.css';

interface LoadingOverlayProps {
  message: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  // **Handle Empty Messages**
  const displayMessage = message || 'Loading...';

  return (
    <div className="overlay" role="alert" aria-live="assertive">
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-message">{displayMessage}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
