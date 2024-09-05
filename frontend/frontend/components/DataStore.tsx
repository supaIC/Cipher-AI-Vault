import React, { useEffect, useState } from "react";
import { HttpAgent, Agent, Actor, ActorSubclass, ActorMethod } from "@dfinity/agent";
import * as data from "../hooks/dataManager/dataManager";
import { Types } from 'ic-auth'

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
  const jsonAssets = assets.filter((asset) => asset.key.includes("/data-store/"));
  const [jsonSnippets, setJsonSnippets] = useState<{ [key: string]: string }>({});
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [fullJsonData, setFullJsonData] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [dataActor, setDataActor] = useState<Actor | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);

  useEffect(() => {

    let isMounted = true;

    const fetchJsonSnippets = async () => {
      const snippets: { [key: string]: string } = {};
      const newSnippets: { [key: string]: string } = {}; // Track new snippets

      for (const asset of jsonAssets) {
        if (asset.url.endsWith(".json") && !jsonSnippets[asset.key]) {
          try {
            const response = await fetch(asset.url);
            const data = await response.json();
            const snippet = JSON.stringify(data, null, 2).substring(0, 100) + "...";
            snippets[asset.key] = syntaxHighlight(snippet);
            newSnippets[asset.key] = syntaxHighlight(snippet);
          } catch (error) {
            console.error("Error fetching JSON data:", error);
          }
        } else if (jsonSnippets[asset.key]) {
          snippets[asset.key] = jsonSnippets[asset.key];
        }
      }

      if (isMounted && Object.keys(newSnippets).length > 0) {
        // Only update state if there are new snippets to add
        setJsonSnippets((prevSnippets) => ({
          ...prevSnippets,
          ...newSnippets,
        }));
      }
    };

    fetchJsonSnippets();

    return () => {
      isMounted = false;
    };
  }, [jsonAssets]);

  useEffect(() => {
    if (userObject.agent) {
      const actor = getDataActor();
      setDataActor(actor as any);
    }
  }, [userObject]);

  // Function to get the data actor from the dataManager
  const getDataActor = async (): Promise<ActorSubclass<Record<string, ActorMethod<unknown[], unknown>>>> => {
    const dataActor = await data.getDataActor(userObject.agent as any);
    setDataActor(dataActor);
    return dataActor;
  }

  const handleAssetClick = async (asset: Asset) => {
    setViewingAsset(asset);
    setFullJsonData(null); // Reset the full JSON data

    if (asset.url.endsWith(".json")) {
      try {
        const response = await fetch(asset.url);
        const data = await response.json();
        setFullJsonData(JSON.stringify(data, null, 2)); // Load the entire JSON data
      } catch (error) {
        console.error("Error fetching full JSON data:", error);
      }
    }
  };

  const handleDelete = (asset: Asset) => {
    onDelete(asset);
    setViewingAsset(null); // Clear the viewing asset after deletion
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
          if (/:$/.test(match)) {
            cls = "key";
          } else {
            cls = "string";
          }
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
        setTimeout(() => setCopySuccess(null), 2000); // Clear message after 2 seconds
      },
      (err) => {
        setCopySuccess("Failed to copy!");
        setTimeout(() => setCopySuccess(null), 2000); // Clear message after 2 seconds
        console.error("Failed to copy JSON to clipboard", err);
      }
    );
  };

  // Function to create a new user in the data store
  const createUser = async () => {
    if (!dataActor) return;
    console.log("Creating user...");
    const result = await data.createUser(dataActor);
    console.log("Result:", result);
  };

  // Function to grab a user from the data store
  const grabUser = async () => {
    if (!dataActor) return;
    console.log("Grabbing user...");
    const result = await data.getSingleUser(userObject.principal, dataActor);
    console.log(result);
  };

  // Function to fetch all users' data from the data store
  const getAllUsers = async () => {
    if (!dataActor) return;
    console.log("Fetching all user data...");
    const allUserData = await data.getAllUserData(dataActor);
    console.log("All User Data: ", allUserData);
  };

  // Function to add a new file to the user in the data store using test data
  const addFile = async () => {
    if (!dataActor) return;

    const fileData = {
      fileID: "file-uuid-123", // Replace with your file ID logic
      fileName: "DFINITY Profiles",
      fileData: [
        {
          id: "1",
          name: "Dominic Williams",
          description: "Dominic Williams is the founder and chief scientist of the DFINITY Foundation..."
        },
        {
          id: "2",
          name: "DFINITY Foundation",
          description: "The DFINITY Foundation is a non-profit research organization based in Zurich, Switzerland..."
        }
      ]
    };

    console.log("Adding file to user...");
    const result = await data.addFileToUser(userObject.principal, fileData, dataActor);
    console.log("Add file result: ", result);
  };

  // Function to remove a file from the user's data
  const removeFile = async () => {
    if (!dataActor) return;

    const fileID = "file-uuid-123"; // Replace with the correct fileID that exists in the user's data
    console.log("Removing file from user...");
    const result = await data.removeFileFromUser(userObject.principal, fileID, dataActor);
    console.log("Remove file result: ", result);
  };

  // Function to get data for a specific file
  const getFileData = async () => {
    if (!dataActor) return;

    const fileName = "DFINITY Profiles"; // Replace with the actual file name
    console.log("Getting file data...");
    const result = await data.getFileData(userObject.principal, fileName, dataActor);
    setFileData(JSON.stringify(result, null, 2)); // Store the file data in state
    console.log("Get file data result: ", result);
  };

  return (
    <>
      <div>
        <button onClick={createUser}>Create User</button>
        <button onClick={grabUser}>Grab User</button>
        <button onClick={addFile}>Add File</button> {/* New Button with Test Data */}
        <button onClick={getAllUsers}>Get All Users</button> {/* New Button */}
        <button onClick={removeFile}>Remove File</button> {/* New Button to Remove File */}
        <button onClick={getFileData}>Get File Data</button> {/* Button to Get File Data */}
      </div>
      {jsonAssets.length > 0 ? (
        jsonAssets.map((asset) => (
          <div
            key={asset.key}
            className="asset-item"
            onMouseEnter={() => onAssetHover(asset)}
            onMouseLeave={() => onAssetHover(null)}
            onClick={() => handleAssetClick(asset)}
          >
            <div className="json-preview">
              <pre
                className="json-snippet"
                dangerouslySetInnerHTML={{
                  __html: jsonSnippets[asset.key] || "Loading...",
                }}
              />
            </div>
            <p className="asset-name" style={{ fontSize: "12px" }}>
              {asset.key.split("/").pop()}
            </p>
          </div>
        ))
      ) : (
        <p>No JSON files available.</p>
      )}

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

export default DataStore;