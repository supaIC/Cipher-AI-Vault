import React, { useEffect, useState, useRef } from "react";
import { Types } from 'ic-auth';
import * as Components from "../../components";
import { syntaxHighlight } from "../../utils/jsonSyntaxHighlight";
import { useDataManager } from "../../hooks/dataManager/dataManager";

interface Asset {
  key: string;
  url: string;
}

interface DataStoreProps {
  assets: Array<Asset>;
  onDelete: (asset: Asset) => void;
  userObject: Types.UserObject;
  onAssetHover: (asset: Asset | null) => void;
}

const PrivateDataStore: React.FC<DataStoreProps> = ({ assets, onDelete, userObject, onAssetHover }) => {
  const dataManager = useDataManager();
  const [privateData, setPrivateData] = useState<any | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [fullJsonData, setFullJsonData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteAsset, setConfirmDeleteAsset] = useState<Asset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPrivateData();
  }, []);

  const loadPrivateData = async () => {
    setLoading(true);
    setError(null);

    try {
      const allUserData = await dataManager.getAllUserData(userObject);

      if (!allUserData || allUserData.length === 0) {
        await dataManager.createUser(userObject);
        await loadPrivateData();
      } else {
        setPrivateData(allUserData);
      }
    } catch (error) {
      console.error("Error loading private data:", error);
      setError("Failed to load private data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssetClick = async (asset: Asset | any) => {
    setViewingAsset(asset as Asset);
    setFullJsonData(null);

    if ('url' in asset) {
      try {
        const response = await fetch(asset.url);
        const data = await response.json();
        setFullJsonData(JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error fetching full JSON data:", error);
        setError("Failed to load full JSON data. Please try again.");
      }
    } else {
      setFullJsonData(JSON.stringify(asset.fileData, null, 2));
    }
  };

  const handleDeletePrivateAsset = async (asset: any) => {
    try {
      await dataManager.removeFileFromUser(userObject, userObject.principal, asset.fileID);
      await loadPrivateData();
    } catch (error) {
      console.error("Error deleting private asset:", error);
      setError("Failed to delete private asset. Please try again.");
    } finally {
      setViewingAsset(null);
    }
  };

  const handleDelete = (asset: Asset | any) => {
    setConfirmDeleteAsset(asset as Asset);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          const jsonData = JSON.parse(content);
          await addFile(jsonData, file.name);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          setError("Failed to parse JSON. Please ensure the file contains valid JSON.");
        }
      };
      reader.readAsText(file);
    }
  };

  const addFile = async (fileData: any[], fileName: string) => {
    setLoading(true);
    setError(null);
    const newFileData = {
      fileID: "file-" + Date.now(),
      fileName: fileName,
      fileData: fileData,
    };
    try {
      await dataManager.addFileToUser(userObject, userObject.principal, newFileData);
      await loadPrivateData();
    } catch (error) {
      console.error("Error adding file:", error);
      setError("Failed to add file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Components.LoadingOverlay message="Loading data..." />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="page-container">
      <div className="top-section">
        <div className="data-actions">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileInputRef.current?.click()}>Upload Data to Stable Memory</button>
        </div>
      </div>
  
      <div className="assets-list-section">
        <div className="data-list">
          {privateData && privateData.length > 0 ? (
            privateData.flatMap((userDataMap: any) => {
              if (!Array.isArray(userDataMap)) {
                console.error('Unexpected data structure:', userDataMap);
                return null;
              }
              const [_, userData] = userDataMap;
              if (!userData || !userData.allFiles) {
                console.error('Invalid user data structure:', userData);
                return null;
              }
              return userData.allFiles.map((file: any) => (
                <div
                  key={file.fileID}
                  className="asset-item"
                  onClick={() => handleAssetClick(file)}
                  onMouseEnter={() => onAssetHover({ key: file.fileID, url: '' })}
                  onMouseLeave={() => onAssetHover(null)}
                >
                  <div className="json-preview">
                    <pre
                      className="json-snippet"
                      dangerouslySetInnerHTML={{
                        __html: file.fileData && file.fileData.length > 0
                          ? syntaxHighlight(JSON.stringify(file.fileData[0], null, 2).substring(0, 100) + "...")
                          : "No data available"
                      }}
                    />
                  </div>
                  <p className="asset-name" style={{ fontSize: "12px" }}>
                    {file.fileName}
                  </p>
                </div>
              ));
            }).filter(Boolean)
          ) : (
            <p>No private data available. Try uploading a file.</p>
          )}
        </div>
      </div>
  
      {viewingAsset && (
        <div className="asset-view">
          <div className="asset-view-content">
            <pre
              dangerouslySetInnerHTML={{
                __html: fullJsonData ? syntaxHighlight(fullJsonData) : "Loading full JSON...",
              }}
            />
            <Components.CopyToClipboard text={fullJsonData || ""} />
          </div>
          <div className="asset-view-actions">
            <button onClick={() => setViewingAsset(null)}>Close</button>
            <button onClick={() => handleDelete(viewingAsset)}>Delete</button>
          </div>
        </div>
      )}

      {confirmDeleteAsset && (
        <Components.DeleteConfirmation
          asset={confirmDeleteAsset}
          onConfirm={async () => {
            await handleDeletePrivateAsset(confirmDeleteAsset);
            setConfirmDeleteAsset(null);
          }}
          onCancel={() => setConfirmDeleteAsset(null)}
        />
      )}
    </div>
  );   
};

export default PrivateDataStore;