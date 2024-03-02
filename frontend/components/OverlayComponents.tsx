// OverlayComponents.tsx

import React from "react";

// Interface for the LoadingOverlay component props.
interface LoadingOverlayProps {
  message: string; // The message to display within the loading overlay.
}

/**
 * LoadingOverlay component displays a simple overlay with a loading message.
 * Useful for indicating to the user that an asynchronous operation is in progress.
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => (
  <div className="overlay">
    <div className="loading">{message}</div>
  </div>
);

// Interface for the ErrorNotification component props.
interface ErrorNotificationProps {
  message: string; // The error message to display.
  onClose: () => void; // Handler for closing the error notification.
}

/**
 * ErrorNotification component shows an error message with a close button.
 * Allows users to be informed of errors and dismiss the notification.
 */
export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  onClose,
}) => (
  <div className="error-notification">
    {message}
    <button onClick={onClose}>X</button>{" "}
    {/* Button for closing the notification */}
  </div>
);

// Interface for the DeleteConfirmation component props.
interface DeleteConfirmationProps {
  asset: { key: string; url: string }; // The asset being considered for deletion.
  onConfirm: () => void; // Handler for confirming the deletion.
  onCancel: () => void; // Handler for cancelling the deletion.
}

/**
 * DeleteConfirmation component presents a confirmation dialog to the user
 * when they attempt to delete an asset. Includes options to confirm or cancel the action.
 */
export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  asset,
  onConfirm,
  onCancel,
}) => (
  <div className="confirm-overlay">
    <div className="confirm-box">
      <p>Are you sure you want to delete this asset?</p>{" "}
      {/* Confirmation message */}
      <div className="confirm-actions">
        <button onClick={onConfirm} className="confirm-delete">
          Yes, Delete {/* Button for confirming deletion */}
        </button>
        <button onClick={onCancel} className="cancel-delete">
          Cancel {/* Button for cancelling deletion */}
        </button>
      </div>
    </div>
  </div>
);