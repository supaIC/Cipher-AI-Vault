import React from "react";

interface Asset {
  key: string;
  url: string;
}

interface AssetListItemProps {
  asset: Asset;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

const AssetListItem: React.FC<AssetListItemProps> = ({
  asset,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  const fileName = asset.key.split("/").pop();
  const displayFileName =
    fileName && fileName.length > 30
      ? `${fileName.substring(0, 30)}...`
      : fileName;

  return (
    <div
      className="asset-item"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <img src={asset.url} alt="Asset" className="asset-image" />
      <p className="asset-name" style={{ fontSize: "12px" }}>
        {displayFileName}
      </p>
    </div>
  );
};

export default AssetListItem;