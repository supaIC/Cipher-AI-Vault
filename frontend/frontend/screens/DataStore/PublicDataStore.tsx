import React, { useEffect, useState } from "react";
import * as Components from "../../components"; // Import other components

interface Asset {
  key: string;
  url: string;
}

interface PublicDataStoreProps {
  assets: Array<Asset>;
  onDelete: (asset: Asset) => Promise<void>; // Ensure this returns a promise for proper async handling
}

const PublicDataStore: React.FC<PublicDataStoreProps> = ({ assets, onDelete }) => {
  const [publicData, setPublicData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [fullJsonData, setFullJsonData] = useState<string | null>(null);
  const [confirmDeleteAsset, setConfirmDeleteAsset] = useState<Asset | null>(null); // State for delete confirmation

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
    try {
      await onDelete(asset);
    } catch (error) {
      console.error("Error deleting public asset:", error);
      setError("Failed to delete public asset. Please try again.");
    } finally {
      setLoading(false);
      setViewingAsset(null); // Reset viewing asset after delete
    }
  };

  const syntaxHighlight = (json: string) => {
    if (!json) return "";
    return json
      .replace(/(&)/g, '&amp;')
      .replace(/(>)/g, '&gt;')
      .replace(/(<)/g, '&lt;')
      .replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*?"(\s*:)?|\b(true|false|null)\b|\d+)/g, (match) => {
        let cls = "number";
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? "key" : "string";
        } else if (/true|false/.test(match)) {
          cls = "boolean";
        } else if (/null/.test(match)) {
          cls = "null";
        }
        return `<span class="${cls}">${match}</span>`;
      });
  };

  const renderPublicDataList = () => {
    if (loading) {
      return <Components.LoadingOverlay message="Loading data..." />;
    }

    if (error) {
      return <p>Error: {error}</p>;
    }

    if (Object.keys(publicData).length === 0) {
      return <p>No public data available.</p>;
    }

    return Object.entries(publicData).map(([key, value]) => {
      const parsedValue = JSON.parse(value);
      const isError = parsedValue.error !== undefined;

      return (
        <div
          key={key}
          className={`asset-item ${isError ? 'error' : ''}`}
          onClick={() => handleAssetClick({ key, url: assets.find(a => a.key === key)?.url || '' })}
        >
          <div className="json-preview">
            <pre
              className="json-snippet"
              dangerouslySetInnerHTML={{
                __html: isError
                  ? `Error: ${parsedValue.error}`
                  : syntaxHighlight(value.substring(0, 100) + "...")
              }}
            />
          </div>
          <p className="asset-name" style={{ fontSize: "12px" }}>
            {key.split("/").pop()}
          </p>
        </div>
      );
    });
  };

  return (
    <div className="public-data-store">
      <h2>Public Data</h2>
      <div className="public-data-list">
        {renderPublicDataList()}
      </div>
      {viewingAsset && (
        <div className="asset-view">
          <div className="asset-view-content">
            <pre dangerouslySetInnerHTML={{ __html: syntaxHighlight(fullJsonData || "") }} />
          </div>
          <div className="asset-view-actions">
            <button onClick={() => setViewingAsset(null)}>Close</button>
            <button onClick={() => window.open(viewingAsset.url, "_blank")}>
              View Asset on-chain
            </button>
            <button onClick={() => handleDelete(viewingAsset)}>Delete</button>
          </div>
        </div>
      )}
      {/* Delete Confirmation */}
      {confirmDeleteAsset && (
        <Components.DeleteConfirmation
          asset={confirmDeleteAsset}
          onConfirm={async () => await handleDelete(confirmDeleteAsset)}
          onCancel={() => setConfirmDeleteAsset(null)}
        />
      )}
    </div>
  );
};

export default PublicDataStore;
