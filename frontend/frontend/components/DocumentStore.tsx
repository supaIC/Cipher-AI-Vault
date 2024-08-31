import React, { useEffect, useState } from "react";

interface Asset {
  key: string;
  url: string;
}

interface DocumentStoreProps {
  assets: Array<Asset>;
  onAssetHover: (asset: Asset | null) => void;
  onDelete: (asset: Asset) => void;
}

const DocumentStore: React.FC<DocumentStoreProps> = ({ assets, onAssetHover, onDelete }) => {
  const documentAssets = assets.filter(
    (asset) => asset.url.endsWith(".pdf") || asset.url.endsWith(".txt")
  );
  const [textPreviews, setTextPreviews] = useState<{ [key: string]: string }>({});
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [fullTextData, setFullTextData] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTextPreviews = async () => {
      const previews: { [key: string]: string } = { ...textPreviews }; // Use existing previews as base

      for (const asset of documentAssets) {
        if (asset.url.endsWith(".txt") && !previews[asset.key]) {
          try {
            const response = await fetch(asset.url);
            const text = await response.text();
            previews[asset.key] = text.slice(0, 100) + (text.length > 100 ? "..." : "");
          } catch (error) {
            console.error("Failed to load text file:", error);
          }
        }
      }

      if (isMounted) {
        setTextPreviews(previews);
      }
    };

    loadTextPreviews();

    return () => {
      isMounted = false;
    };
  }, [documentAssets, textPreviews]);

  const handleAssetClick = async (asset: Asset) => {
    setViewingAsset(asset);
    setFullTextData(null); // Reset the full text data

    if (asset.url.endsWith(".txt")) {
      try {
        const response = await fetch(asset.url);
        const text = await response.text();
        setFullTextData(text); // Load the entire text data
      } catch (error) {
        console.error("Error fetching full text data:", error);
      }
    }
  };

  const handleDelete = (asset: Asset) => {
    onDelete(asset);
    setViewingAsset(null); // Clear the viewing asset after deletion
  };

  const copyToClipboard = () => {
    if (!fullTextData) return;

    let isMounted = true;
    navigator.clipboard.writeText(fullTextData).then(
      () => {
        if (isMounted) {
          setCopySuccess("Copied to clipboard!");
          setTimeout(() => {
            if (isMounted) setCopySuccess(null);
          }, 2000); // Clear message after 2 seconds
        }
      },
      (err) => {
        if (isMounted) {
          setCopySuccess("Failed to copy!");
          setTimeout(() => {
            if (isMounted) setCopySuccess(null);
          }, 2000); // Clear message after 2 seconds
        }
        console.error("Failed to copy text to clipboard", err);
      }
    );

    return () => {
      isMounted = false;
    };
  };

  const renderDocumentPreview = (asset: Asset) => {
    if (asset.url.endsWith(".pdf")) {
      return <embed src={asset.url} type="application/pdf" width="100%" height="150px" />;
    } else if (asset.url.endsWith(".txt")) {
      return (
        <div className="text-preview">
          <p>{textPreviews[asset.key] || "Loading..."}</p>
        </div>
      );
    } else {
      return <p>Unsupported document type.</p>;
    }
  };

  return (
    <>
      {documentAssets.length > 0 ? (
        documentAssets.map((asset) => (
          <div
            key={asset.key}
            className="asset-item"
            onMouseEnter={() => onAssetHover(asset)}
            onMouseLeave={() => onAssetHover(null)}
            onClick={() => handleAssetClick(asset)}
          >
            {renderDocumentPreview(asset)}
            <p className="asset-name" style={{ fontSize: "12px", marginTop: "8px" }}>
              {asset.key.split("/").pop()}
            </p>
          </div>
        ))
      ) : (
        <p>No documents available.</p>
      )}

      {viewingAsset && (
        <div className="asset-view">
          <div className="asset-view-content">
            {viewingAsset.url.endsWith(".txt") ? (
              <>
                <pre>{fullTextData || "Loading full text..."}</pre>
                <button onClick={copyToClipboard} className="copy-text-button">
                  Copy Raw Text
                </button>
                {copySuccess && <div className="copy-feedback">{copySuccess}</div>}
              </>
            ) : (
              <embed src={viewingAsset.url} type="application/pdf" width="100%" height="600px" />
            )}
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

export default DocumentStore;
