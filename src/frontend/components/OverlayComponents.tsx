import React from "react";

interface LoadingOverlayProps {
  message: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => (
  <div className="overlay">
    <div className="loading">{message}</div>
  </div>
);

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  onClose,
}) => (
  <div className="error-notification">
    {message}
    <button onClick={onClose}>X</button>{" "}
  </div>
);

interface DeleteConfirmationProps {
  asset: { key: string; url: string };
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  asset,
  onConfirm,
  onCancel,
}) => (
  <div className="confirm-overlay">
    <div className="confirm-box">
      <p>Are you sure you want to delete this asset?</p>{" "}
      <div className="confirm-actions">
        <button onClick={onConfirm} className="confirm-delete">
          Delete
        </button>
        <button onClick={onCancel} className="cancel-delete">
          Cancel
        </button>
      </div>
    </div>
  </div>
);