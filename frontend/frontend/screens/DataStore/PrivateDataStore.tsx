import React, { useEffect, useState, useRef } from "react";
import { HttpAgent, Actor, ActorSubclass, ActorMethod } from "@dfinity/agent";
import * as data from "../../hooks/dataManager/dataManager";
import { Types } from 'ic-auth';
import * as Components from "../../components"; // Import all components

interface Asset {
  key: string;
  url: string;
}

interface DataStoreProps {
  assets: Array<Asset>;
  onDelete: (asset: Asset) => void;
  userObject: Types.UserObject;
}

const DataStore: React.FC<DataStoreProps> = ({ assets, onDelete, userObject }) => {
  const [dataActor, setDataActor] = useState<Actor | null>(null);
  const [privateData, setPrivateData] = useState<data.FullDataQuery | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [fullJsonData, setFullJsonData] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteAsset, setConfirmDeleteAsset] = useState<Asset | null>(null); // State for delete confirmation
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initializeDataActor = async () => {
      if (userObject.agent) {
        try {
          const actor = await getDataActor();
          setDataActor(actor as any);
        } catch (error) {
          console.error("Error initializing data actor:", error);
          setError("Failed to initialize data actor. Please try again.");
        }
      }
    };

    initializeDataActor();
  }, [userObject]);

  useEffect(() => {
    if (dataActor) {
      loadPrivateData();
    }
  }, [dataActor]);

  const getDataActor = async (): Promise<ActorSubclass<Record<string, ActorMethod<unknown[], unknown>>>> => {
    return await data.getDataActor(userObject.agent as any);
  };

  const loadPrivateData = async () => {
    if (!dataActor) {
      console.log("Data actor not initialized yet.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching all user data...");
      const allUserData = await data.getAllUserData(dataActor);

      if (!allUserData || allUserData.length === 0) {
        console.log("No user data found. Proceeding to create a new user...");
        await data.createUser(dataActor);
        console.log("User created successfully.");
        
        console.log("Reloading data after user creation...");
        await loadPrivateData(); // Load data again after user creation
      } else {
        console.log("User exists. Fetched all user data:", allUserData);
        setPrivateData(allUserData);
      }
    } catch (error) {
      console.error("Error loading private data:", error);
      setError("Failed to load private data. Please try again.");
    } finally {
      console.log("Finished loading private data.");
      setLoading(false);
    }
  };

  const handleAssetClick = async (asset: Asset | data.FileData) => {
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

  const handleDeletePrivateAsset = async (asset: data.FileData) => {
    if (!dataActor) {
      console.error("Data actor not initialized");
      return;
    }

    setLoading(true);
    try {
      await data.removeFileFromUser(userObject.principal, asset.fileID, dataActor);
      await loadPrivateData(); // Load private data after deletion of private asset
    } catch (error) {
      console.error("Error deleting private asset:", error);
      setError("Failed to delete private asset. Please try again.");
    } finally {
      setLoading(false);
      setViewingAsset(null); // Reset viewing asset after delete
    }
  };

  const handleDelete = (asset: Asset | data.FileData) => {
    setConfirmDeleteAsset(asset as Asset); // Set asset for confirmation
  };

  const confirmDelete = async () => {
    if (confirmDeleteAsset) {
      await handleDeletePrivateAsset(confirmDeleteAsset as unknown as data.FileData);
      setConfirmDeleteAsset(null); // Reset confirmation after delete
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteAsset(null); // Reset confirmation
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

  const copyToClipboard = () => {
    if (!fullJsonData) return;
    navigator.clipboard.writeText(fullJsonData).then(
      () => {
        setCopySuccess("Copied to clipboard!");
        setTimeout(() => setCopySuccess(null), 2000);
      },
      (err) => {
        setCopySuccess("Failed to copy!");
        setTimeout(() => setCopySuccess(null), 2000);
        console.error("Failed to copy JSON to clipboard", err);
      }
    );
  };

  const validateJsonFormat = (jsonData: any): boolean => {
    if (!Array.isArray(jsonData)) {
      return false;
    }

    return jsonData.every((item: any) =>
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.description === 'string'
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          const jsonData = JSON.parse(content);
          if (validateJsonFormat(jsonData)) {
            await addFile(jsonData, file.name);
          } else {
            setError("Invalid JSON format. Please upload a file with the correct structure.");
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
          setError("Failed to parse JSON. Please make sure the file contains valid JSON.");
        }
      };
      reader.readAsText(file);
    }
  };

  const addFile = async (fileData: any[], fileName: string) => {
    if (!dataActor) return;
    setLoading(true);
    setError(null);
    const newFileData: data.FileData = {
      fileID: "file-" + Date.now(),
      fileName: fileName,
      fileData: fileData
    };
    try {
      const result = await data.addFileToUser(userObject.principal, newFileData, dataActor);
      console.log("Add file result:", result);
      await loadPrivateData();
    } catch (error) {
      console.error("Error adding file:", error);
      setError("Failed to add file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderDataList = () => {
    if (loading) {
      return <Components.LoadingOverlay message="Loading data..." />; // Use loading overlay
    }

    if (error) {
      return <p>Error: {error}</p>;
    }

    if (!privateData || privateData.length === 0) {
      return <p>No private data available. Try uploading a file.</p>;
    }
    
    return privateData.flatMap((userDataMap) => {
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
    }).filter(Boolean);
  };

  return (
    <div className="page-container">
      {/* Top Section with Actions */}
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
  
      {/* Separated Assets Section */}
      <div className="assets-list-section">
        <div className="data-list">
          {renderDataList()}
        </div>
      </div>
  
      {/* Asset View Section */}
      {viewingAsset && (
        <div className="asset-view">
          <div className="asset-view-content">
            <pre
              dangerouslySetInnerHTML={{
                __html: fullJsonData ? syntaxHighlight(fullJsonData) : "Loading full JSON...",
              }}
            />
            <button onClick={copyToClipboard} className="copy-json-button">
              Copy Raw JSON
            </button>
            {copySuccess && <div className="copy-feedback">{copySuccess}</div>}
          </div>
          <div className="asset-view-actions">
            <button onClick={() => setViewingAsset(null)}>Close</button>
            <button onClick={() => handleDelete(viewingAsset)}>Delete</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDeleteAsset && (
        <Components.DeleteConfirmation
          asset={confirmDeleteAsset}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      
      {/* Loading Overlay */}
      {loading && <Components.LoadingOverlay message="Loading data..." />}
    </div>
  );   
};

export default DataStore;
