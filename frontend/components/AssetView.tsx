// AssetView.tsx

import React from 'react';

interface Asset {
  key: string;
  url: string;
}

interface AssetViewProps {
  asset: Asset;
  onClose: () => void;
  onDelete: () => void;
}

const AssetView: React.FC<AssetViewProps> = ({ asset, onClose, onDelete }) => {
  return (
    <div className="asset-view">
      <div className="asset-view-content">
        <img src={asset.url} alt="Viewing Asset" />
      </div>
      <div className="asset-view-actions">
        <button onClick={() => window.open(asset.url, '_blank')}>
          View Asset on-chain
        </button>
        <button onClick={onClose}>Close</button>
        <button onClick={onDelete}>Delete</button>
        {/* Add more actions as needed */}
      </div>
    </div>
  );
};

export default AssetView;
