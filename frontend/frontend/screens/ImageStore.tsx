import React, { useState } from "react";

interface Asset {
  key: string;
  url: string;
}

interface ImageStoreProps {
  assets: Array<Asset>;
  onAssetHover: (asset: Asset | null) => void;
  onDelete: (asset: Asset) => void;
}

const ImageStore: React.FC<ImageStoreProps> = ({ assets, onAssetHover, onDelete }) => {
  const imageAssets = assets.filter((asset) => asset.key.includes("/image-store/"));
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);

  const handleDelete = (asset: Asset) => {
    onDelete(asset);
    setViewingAsset(null); // Clear the viewing asset after deletion
  };

  return (
    <>
      {imageAssets.length > 0 ? (
        imageAssets.map((asset) => (
          <div
            key={asset.key}
            className="asset-item"
            onMouseEnter={() => onAssetHover(asset)}
            onMouseLeave={() => onAssetHover(null)}
            onClick={() => setViewingAsset(asset)}
          >
            <img src={asset.url} alt="Asset" className="asset-image" />
            <p className="asset-name" style={{ fontSize: "12px" }}>
              {asset.key.split("/").pop()}
            </p>
          </div>
        ))
      ) : (
        <p>No images available.</p>
      )}

      {viewingAsset && (
        <div className="asset-view">
          <div className="asset-view-content">
            <img src={viewingAsset.url} alt="Viewing Asset" />
          </div>
          <div className="asset-view-actions">
            <button onClick={() => window.open(viewingAsset.url, "_blank")}>
              View Asset on-chain
            </button>
            <button onClick={() => setViewingAsset(null)}>Close</button>
            <button onClick={() => handleDelete(viewingAsset)}>Delete</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageStore;

