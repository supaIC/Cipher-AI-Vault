// DeleteConfirmation.tsx
import React, { useEffect, useRef } from 'react';
import './DeleteConfirmation.css';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import { useStore } from '../../../store/store';

interface DeleteConfirmationProps {
  asset: { key: string; url: string };
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ asset, onConfirm, onCancel }) => {
  // Access isLoading and setIsLoading from Zustand store
  const isLoading = useStore((state) => state.isLoading);
  const setIsLoading = useStore((state) => state.setIsLoading);

  const isMounted = useRef(true);

  // Clean up and prevent state updates when component is unmounted
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="confirm-overlay">
      {isLoading && <LoadingOverlay message="Deleting asset..." />}
      <div className="confirm-box">
        <h2>Delete Asset</h2>
        <p>Are you sure you want to delete this asset?</p>
        <p>
          <strong>{asset.url}</strong>
        </p>
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
