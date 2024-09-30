import React, { useState, useEffect, useRef } from "react";
import './DeleteConfirmation.css';
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";

interface DeleteConfirmationProps {
  asset: { key: string; url: string };
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  asset,
  onConfirm,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true); // To track if component is mounted

  // Clean up and prevent state updates when component is unmounted
  useEffect(() => {
    isMounted.current = true; // Set to true when mounted
    return () => {
      isMounted.current = false; // Set to false when unmounted
    };
  }, []);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      if (isMounted.current) {
        setIsLoading(false); // Only update state if component is still mounted
      }
    }
  };

  return (
    <div className="confirm-overlay">
      {isLoading && <LoadingOverlay message="Deleting asset..." />}
      <div className="confirm-box">
        <h2>Delete Asset</h2>
        <p>Are you sure you want to delete this asset?</p>
        <p><strong>{asset.url}</strong></p>
        <div className="confirm-actions">
          <button onClick={handleConfirm} className="confirm-delete" disabled={isLoading}>
            Delete
          </button>
          <button onClick={onCancel} className="cancel-delete" disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
