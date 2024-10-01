import React, { useEffect, useState } from "react";
import * as Components from "../../components";
import { syntaxHighlight } from "../../utils/jsonSyntaxHighlight";
import "./PublicDataStorage.css"; // Import the new CSS

interface Asset {
  key: string;
  url: string;
}

interface PublicDataStoreProps {
  assets: Array<Asset>;
  onDelete: (asset: Asset) => Promise<void>;
  onAssetHover: (asset: Asset | null) => void;
}

const PublicDataStore: React.FC<PublicDataStoreProps> = ({ assets, onDelete, onAssetHover }) => {
  const [publicData, setPublicData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [fullJsonData, setFullJsonData] = useState<string | null>(null);

  useEffect(() => {
    loadPublicData();
  }, [assets]);

  const loadPublicData = async () => {
    setLoading(true);
    setError(null);
    const snippets: { [key: string]: string } = {};

    for (const asset of assets) {
      if (asset.url.endsWith(".json")) {
        try {
          const response = await fetch(asset.url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          let data;
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            data = await response.json();
          } else {
            const text = await response.text();
            console.warn(`Received non-JSON response for ${asset.key}:`, text);
            data = { error: "Received non-JSON response", content: text };
          }
          snippets[asset.key] = JSON.stringify(data, null, 2);
        } catch (error) {
          console.error(`Error fetching JSON data for ${asset.key}:`, error);
          snippets[asset.key] = JSON.stringify({ error: "Failed to load data" }, null, 2);
        }
      }
    }

    setPublicData(snippets);
    setLoading(false);
  };

  const handleAssetClick = async (asset: Asset) => {
    setViewingAsset(asset);
    setFullJsonData(null);

    try {
      const response = await fetch(asset.url);
      const data = await response.json();
      setFullJsonData(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error fetching full JSON data:", error);
      setError("Failed to load full JSON data. Please try again.");
    }
  };

  const handleDelete = async (asset: Asset) => {
    setLoading(true);
    setError(null);
    try {
      await onDelete(asset);
      // After successful deletion, remove the asset from publicData
      setPublicData(prevData => {
        const newData = { ...prevData };
        delete newData[asset.key];
        return newData;
      });
    } catch (error) {
      console.error("Error deleting public asset:", error);
      setError("Failed to delete public asset. Please try again.");
    } finally {
      setLoading(false);
      setViewingAsset(null);
    }
  };

  if (loading) {
    return <Components.LoadingOverlay message="Loading data..." />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      {Object.keys(publicData).length > 0 ? (
        <div className="public-data-store-container">
          {Object.entries(publicData).map(([key, value]) => {
            const parsedValue = JSON.parse(value);
            const isError = parsedValue.error !== undefined;
            const asset = assets.find(a => a.key === key);

            return (
              <div
                key={key}
                className={`public-data-store-item ${isError ? 'public-data-store-error' : ''}`}
                onMouseEnter={() => onAssetHover(asset || null)}
                onMouseLeave={() => onAssetHover(null)}
                onClick={() => asset && handleAssetClick(asset)}
              >
                <div className="public-data-store-json-preview">
                  <pre
                    className="public-data-store-json-snippet"
                    dangerouslySetInnerHTML={{
                      __html: isError
                        ? `Error: ${parsedValue.error}`
                        : syntaxHighlight(value.substring(0, 100) + "...")
                    }}
                  />
                </div>
                <p className="public-data-store-name">
                  {key.split("/").pop()}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No public data available.</p>
      )}

      {viewingAsset && (
        <div className="public-data-store-view">
          <div className="public-data-store-view-content">
            <pre dangerouslySetInnerHTML={{ __html: syntaxHighlight(fullJsonData || "") }} />
            <button onClick={() => navigator.clipboard.writeText(fullJsonData || "")} className="public-data-store-copy-button">
              Copy Raw JSON
            </button>
            {fullJsonData && (
              <div className="public-data-store-copy-feedback">Copied to clipboard!</div>
            )}
          </div>
          <div className="public-data-store-view-actions">
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

export default PublicDataStore;
