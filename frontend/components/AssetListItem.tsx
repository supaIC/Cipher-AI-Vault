import React from "react";

// Defines the structure for the Asset type.
interface Asset {
  key: string; // Unique identifier for the asset.
  url: string; // URL pointing to the asset's location.
}

// Specifies the properties expected by the AssetListItem component.
interface AssetListItemProps {
  asset: Asset; // Asset object containing key and URL.
  onMouseEnter: () => void; // Function to call when the mouse enters the item area.
  onMouseLeave: () => void; // Function to call when the mouse leaves the item area.
  onClick: () => void; // Function to call when the item is clicked.
}

const AssetListItem: React.FC<AssetListItemProps> = ({
  asset,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  // Renders the asset item with an image thumbnail and a truncated name if it's too long.
  const fileName = asset.key.split('/').pop();
  const displayFileName = fileName && fileName.length > 30 ? `${fileName.substring(0, 30)}...` : fileName;

  return (
    <div
      className="asset-item"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <img src={asset.url} alt="Asset" className="asset-image" />
      <p className="asset-name" style={{ fontSize: '12px' }}>{displayFileName}</p>
    </div>
  );
};

export default AssetListItem;