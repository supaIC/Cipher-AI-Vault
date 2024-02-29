import React from 'react';

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

const AssetListItem: React.FC<AssetListItemProps> = ({ asset, onMouseEnter, onMouseLeave, onClick }) => {
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
