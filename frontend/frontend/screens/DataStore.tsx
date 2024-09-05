import React, { useEffect, useState, useRef } from "react";
import { HttpAgent, Agent, Actor, ActorSubclass, ActorMethod } from "@dfinity/agent";
import * as data from "../hooks/dataManager/dataManager";
import { Types } from 'ic-auth';

interface Asset {
  key: string;
  url: string;
}

interface DataStoreProps {
  assets: Array<Asset>;
  onAssetHover: (asset: Asset | null) => void;
  onDelete: (asset: Asset) => void;
  userObject: Types.UserObject;
}

const DataStore: React.FC<DataStoreProps> = ({ assets, onAssetHover, onDelete, userObject }) => {
  const [dataActor, setDataActor] = useState<Actor | null>(null);
  const [privateData, setPrivateData] = useState<data.FullDataQuery | null>(null);
  const [publicData, setPublicData] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'private' | 'public'>('private');
  const [viewingAsset, setViewingAsset] = useState<Asset | data.FileData | null>(null);
  const [fullJsonData, setFullJsonData] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    loadPublicData();
  }, [assets]);

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
        // If no user data is found, create the user automatically
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

  const loadPublicData = async () => {
    const jsonAssets = assets.filter((asset) => asset.key.includes("/data-store/"));
    const snippets: { [key: string]: string } = {};

    for (const asset of jsonAssets) {
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
  };

  const handleAssetClick = async (asset: Asset | data.FileData) => {
    setViewingAsset(asset);
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

  const handleDelete = async (asset: Asset | data.FileData) => {
    if (activeTab === 'public') {
      onDelete(asset as Asset);
    } else {
      if (!dataActor) return;
      try {
        await data.removeFileFromUser(userObject.principal, (asset as data.FileData).fileID, dataActor);
        await loadPrivateData();
      } catch (error) {
        console.error("Error deleting file:", error);
        setError("Failed to delete file. Please try again.");
      }
    }
    setViewingAsset(null);
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
      return <p>Loading...</p>;
    }

    if (error) {
      return <p>Error: {error}</p>;
    }

    if (activeTab === 'private') {
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
    } else {
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
            onMouseEnter={() => onAssetHover({ key, url: assets.find(a => a.key === key)?.url || '' })}
            onMouseLeave={() => onAssetHover(null)}
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
    }
  };

  return (
    <div className="page-container">
      {/* Top Section with Tabs and Actions */}
      <div className="top-section">
        <div className="tab-container">
          <button
            className={`tab ${activeTab === 'private' ? 'active' : ''}`}
            onClick={() => setActiveTab('private')}
          >
            Private Data
          </button>
          <button
            className={`tab ${activeTab === 'public' ? 'active' : ''}`}
            onClick={() => setActiveTab('public')}
          >
            Public Data
          </button>
        </div>
  
        <div className="data-actions">
          {activeTab === 'private' && (
            <>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              <button onClick={() => fileInputRef.current?.click()}>Upload Private File</button>
            </>
          )}
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
            {activeTab === 'public' && 'url' in viewingAsset && (
              <button onClick={() => window.open(viewingAsset.url, "_blank")}>
                View Asset on-chain
              </button>
            )}
            <button onClick={() => setViewingAsset(null)}>Close</button>
            <button onClick={() => handleDelete(viewingAsset)}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );   
};

export default DataStore;
