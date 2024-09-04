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

  const getDataActor = async(): Promise<ActorSubclass<Record<string, ActorMethod<unknown[], unknown>>>> => {
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

  const createUser = async() => {
    console.log("Creating user...");
    const result = await data.createUser(dataActor);
    console.log("Result: ", result);
  }

  const grabUser = async() => {
    console.log("Grabbing user...");
    const result = await data.getSingleUser(userObject.principal, dataActor);
    console.log(result);
  }

  return (
    <>
    <div>
      <button onClick={createUser}>Create User</button>
      <button onClick={grabUser}>Grab User</button>
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