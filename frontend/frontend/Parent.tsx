import React, { useEffect, useState, useCallback } from "react";
import UploadButton from "./components/UploadButton";
import {
  LoadingOverlay,
  ErrorNotification,
  DeleteConfirmation,
} from "./components/OverlayComponents";
import DataStore from "./components/DataStore";
import ImageStore from "./components/ImageStore";
import DocumentStore from "./components/DocumentStore";
import DatabaseAdmin from "./components/DatabaseAdmin";
import { ICWalletList } from "./components/ICWalletList";
import { useAssetManager, Asset, UserObject } from "./hooks/assetManager/assetManager";
import { cyclesTopUp } from "./hooks/useCyclesTopup/useCyclesTopup";
import DragAndDropContainer from "./components/DragAndDropContainer";
import { HttpAgent } from "@dfinity/agent";
import { whitelist } from "./config";
import * as auth from "./hooks/authFunctions/authFunctions";
import * as data from "./hooks/dataManager/dataManager"; // Add DataManager import
import * as distro from "./interfaces/distro";

export function Parent() {
  const [currentUser, setCurrentUser] = useState<UserObject | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);
  const [tooltipPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [viewMode, setViewMode] = useState<'images' | 'json' | 'documents' | 'admin'>('images');
  const [privateData, setPrivateData] = useState<data.FullDataQuery | null>(null); // Add state for private data
  const [dataActor, setDataActor] = useState<any | null>(null);

  const {
    assets,
    globalLoading,
    loadingMessage,
    error,
    setError,
    confirmDelete,
    setConfirmDelete,
    loadAssetList,
    handleDeleteAsset,
    handleFileUpload,
    showUserFiles,
    toggleUserFiles,
  } = useAssetManager(currentUser, currentUser?.principal || null);

  const giveToParent = useCallback(
    (principal: string, agent: HttpAgent, provider: string) => {
      setCurrentUser({ principal, agent, provider });
    },
    []
  );

  // Initialize the DataActor for private data
  useEffect(() => {
    const initializeDataActor = async () => {
      if (currentUser?.agent) {
        try {
          const actor = await data.getDataActor(currentUser.agent);
          setDataActor(actor);
        } catch (error) {
          console.error("Error initializing data actor:", error);
        }
      }
    };

    if (currentUser) {
      initializeDataActor();
    }
  }, [currentUser]);

  // Load private data when the data actor is ready
  useEffect(() => {
    const loadPrivateData = async () => {
      if (dataActor) {
        try {
          const userData = await data.getAllUserData(dataActor);
          setPrivateData(userData);
        } catch (error) {
          console.error("Error loading private data:", error);
        }
      }
    };

    if (dataActor) {
      loadPrivateData();
    }
  }, [dataActor]);

  useEffect(() => {
    if (currentUser) {
      loadAssetList();
    }
  }, [currentUser, loadAssetList, showUserFiles]);

  const handleCyclesTopUp = async () => {
    if (currentUser) {
      await cyclesTopUp(currentUser);
    }
  };

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const [settingsVisible, setSettingsVisible] = useState(false);

  const toggleSettings = () => {
    setSettingsVisible((prevState) => !prevState);
  };

  const getBalances = async () => {
    if (currentUser) {
      const backendActor = await auth.getBackendActor(currentUser.agent, "jeb4e-myaaa-aaaak-aflga-cai", distro.idlFactory);
      const balances = await backendActor.getBalances();
      console.log(balances);
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && currentUser) {
        handleFileUpload(file, currentUser.principal || "");
      }
    },
    [currentUser, handleFileUpload]
  );

  return (
    <div className="app">
      {currentUser && (
        <>
          <button className="settings-btn" onClick={toggleSettings}>
            Settings
          </button>

          {settingsVisible && (
            <div className={`settings-dropdown ${settingsVisible && "active"}`}>
              <button onClick={handleCyclesTopUp}>Donate Cycles</button>
              <button onClick={handleLogout}>Logout</button>
              <button onClick={getBalances}>Get Balances</button>
            </div>
          )}

          <div className="logged-in-info">
            Logged in as: {currentUser.principal}
          </div>
        </>
      )}

      {globalLoading && <LoadingOverlay message={loadingMessage} />}
      {error && <ErrorNotification message={error} onClose={() => setError(null)} />}
      {confirmDelete && (
        <DeleteConfirmation
          asset={confirmDelete}
          onConfirm={() => handleDeleteAsset(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {!currentUser ? (
        <ICWalletList giveToParent={giveToParent} whitelist={whitelist} />
      ) : (
        <>
          <UploadButton
            onUpload={(file) => handleFileUpload(file, currentUser.principal || "")}
            disabled={globalLoading}
          />

          <div className="view-toggle-container">
            <button
              className={`view-toggle-button ${viewMode === 'images' ? 'active' : ''}`}
              onClick={() => setViewMode('images')}
            >
              Image Store
            </button>
            <button
              className={`view-toggle-button ${viewMode === 'documents' ? 'active' : ''}`}
              onClick={() => setViewMode('documents')}
            >
              Document Store
            </button>
            <button
              className={`view-toggle-button ${viewMode === 'json' ? 'active' : ''}`}
              onClick={() => setViewMode('json')}
            >
              Data Store
            </button>
            <button
              className={`view-toggle-button ${viewMode === 'admin' ? 'active' : ''}`}
              onClick={() => setViewMode('admin')}
            >
              Database Admin
            </button>
          </div>

          <DragAndDropContainer onDrop={handleDrop}>
            <div className="assets-container">
              {viewMode === 'images' ? (
                <ImageStore
                  assets={assets}
                  onAssetHover={setHoveredAsset}
                  onDelete={(asset) => {
                    setConfirmDelete(asset);
                  }}
                />
              ) : viewMode === 'documents' ? (
                <DocumentStore
                  assets={assets}
                  onAssetHover={setHoveredAsset}
                  onDelete={(asset) => {
                    setConfirmDelete(asset);
                  }}
                />
              ) : viewMode === 'json' ? (
                <DataStore
                  assets={assets}
                  onAssetHover={setHoveredAsset}
                  onDelete={(asset) => {
                    setConfirmDelete(asset);
                  }}
                  userObject={currentUser as any}
                />
              ) : (
                <DatabaseAdmin 
                  assets={assets} 
                  privateData={privateData} 
                />
              )}
            </div>

            {hoveredAsset && (
              <div
                className="tooltip"
                style={{
                  left: tooltipPosition.left,
                  top: tooltipPosition.top,
                }}
              >
                <p>URL: {hoveredAsset.url}</p>
              </div>
            )}
          </DragAndDropContainer>
        </>
      )}
    </div>
  );
}