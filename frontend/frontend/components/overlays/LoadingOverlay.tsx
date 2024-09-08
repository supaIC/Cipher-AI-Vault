import React from "react";

interface LoadingOverlayProps {
  message: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => (
  <div className="overlay">
    <div className="loading">{message}</div>
  </div>
);

export default LoadingOverlay;
