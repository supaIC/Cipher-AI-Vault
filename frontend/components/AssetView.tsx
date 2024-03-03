// AssetView.tsx

import React from "react";

// Defines the structure for the Asset type.
interface Asset {
  key: string; // Unique identifier for the asset.
  url: string; // URL where the asset can be accessed.
}

// Specifies the properties expected by the AssetView component.
interface AssetViewProps {
  asset: Asset; // Asset object to be viewed.
  onClose: () => void; // Function to call when closing the view.
  onDelete: () => void; // Function to call to delete the asset.
}

const AssetView: React.FC<AssetViewProps> = ({ asset, onClose, onDelete }) => {
  return (
    <div className="asset-view">
      <div className="asset-view-content">
        {/* Displaying the asset image */}
        <img src={asset.url} alt="Viewing Asset" />
      </div>
      <div className="asset-view-actions">
        {/* Button to view the asset on-chain in a new tab */}
        <button onClick={() => window.open(asset.url, "_blank")}>
          View Asset on-chain
        </button>
        {/* Button to close the asset view */}
        <button onClick={onClose}>Close</button>
        {/* Button to trigger asset deletion */}
        <button onClick={onDelete}>Delete</button>
        {/* Placeholder for additional actions if needed */}
      </div>
    </div>
  );
};

export default AssetView;