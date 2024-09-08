import React from "react";
import './LoadingOverlay.css'; // Import the CSS file for styling

interface LoadingOverlayProps {
  message: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => (
  <div className="overlay">
    <div className="loading-container">
      <div className="spinner"></div>
      <div className="loading-message">{message}</div>
    </div>
  </div>
);

export default LoadingOverlay;
