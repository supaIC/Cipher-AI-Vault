import React from "react";
import { Asset } from "../../../hooks/assetManager/assetManager";

interface DeleteButtonProps {
  asset: Asset | null; // The asset to be deleted
  onDelete: (asset: Asset) => void; // Callback function for delete action
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ asset, onDelete }) => {
  const handleClick = () => {
    if (asset) {
      onDelete(asset); // Call the provided onDelete function with the asset
    }
  };

  return (
    <button
      className="delete-button"
      onClick={handleClick}
      disabled={!asset} // Disable button if no asset is selected
    >
      Delete
    </button>
  );
};

export default DeleteButton;
