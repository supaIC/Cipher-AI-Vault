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

/**
 * AssetListItem component renders an individual asset item, showing a thumbnail
 * and the asset's name. It supports mouse interaction events including entering,
 * leaving, and clicking the asset item.
 *
 * Props:
 * - asset: Contains the information about the asset to be displayed.
 * - onMouseEnter: Handler for mouse enter event.
 * - onMouseLeave: Handler for mouse leave event.
 * - onClick: Handler for click event.
 */
const AssetListItem: React.FC<AssetListItemProps> = ({
  asset,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  // Renders the asset item with an image thumbnail and a truncated name if it's too long.
  return (
    <div
      className="asset-item"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <img src={asset.url} alt="Asset" className="asset-image" />
      <p className="asset-name">
        {asset.key.length > 20 ? `${asset.key.substring(0, 20)}...` : asset.key}
      </p>
    </div>
  );
};

export default AssetListItem;