import React, { useState } from "react";
import "./ImageStore.css";

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
        <div className="image-store__container">
          {imageAssets.map((asset) => (
            <div
              key={asset.key}
              className="image-store__item"
              onMouseEnter={() => onAssetHover(asset)}
              onMouseLeave={() => onAssetHover(null)}
              onClick={() => setViewingAsset(asset)}
            >
              <img src={asset.url} alt="Asset" className="image-store__image" />
              <p className="image-store__name" style={{ fontSize: "12px" }}>
                {asset.key.split("/").pop()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No images available.</p>
      )}

      {viewingAsset && (
        <div className="image-store__view">
          <div className="image-store__view-content">
            <img src={viewingAsset.url} alt="Viewing Asset" />
          </div>
          <div className="image-store__view-actions">
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
