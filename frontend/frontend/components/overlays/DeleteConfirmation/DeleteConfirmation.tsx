import React from "react";
import './DeleteConfirmation.css';

interface DeleteConfirmationProps {
  asset: { key: string; url: string };
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  asset,
  onConfirm,
  onCancel,
}) => (
  <div className="confirm-overlay">
    <div className="confirm-box">
      <h2>Delete Asset</h2>
      <p>Are you sure you want to delete this asset?</p>
      <p><strong>{asset.url}</strong></p>
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

export default DeleteConfirmation;
