import React, { useEffect, useState, useCallback } from "react";
import UploadButton from "./components/UploadButton";
import {
  LoadingOverlay,
  ErrorNotification,
  DeleteConfirmation,
} from "./components/OverlayComponents";
import DataStore from "./screens/DataStore";
import ImageStore from "./screens/ImageStore";
import DocumentStore from "./screens/DocumentStore";
import DatabaseAdmin from "./screens/DatabaseAdmin";
import { ICWalletList } from "./components/ICWalletList";
import { useAssetManager, Asset, UserObject } from "./hooks/assetManager/assetManager";
import { cyclesTopUp } from "./hooks/useCyclesTopup/useCyclesTopup";
import DragAndDropContainer from "./components/DragAndDropContainer";
import { HttpAgent } from "@dfinity/agent";
import { whitelist } from "./configs/config";
import * as auth from "./hooks/authFunctions/authFunctions";
import * as data from "./hooks/dataManager/dataManager";
import * as distro from "./interfaces/distro";
import internetComputerLogo from './assets/logos/internet_computer.png';
import cipherProxyLogo from './assets/logos/cipher_proxy.png';
import SettingsDropdown from "./components/SettingsDropdown";
import LoggedInUser from "./components/LoggedInUser";
import ViewToggle from "./components/ViewToggle";

export function Parent() {
  const [currentUser, setCurrentUser] = useState<UserObject | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);
  const [tooltipPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [viewMode, setViewMode] = useState<'images' | 'json' | 'documents' | 'admin'>('images');
  const [privateData, setPrivateData] = useState<data.FullDataQuery | null>(null);
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
      <img src={internetComputerLogo} alt="Internet Computer" className="bottom-left-image" />
      <img src={cipherProxyLogo} alt="Cipher Proxy" className="right-image" />

      {/* Landing Page Section */}
      {!currentUser ? (
        <div className="landing-page">
          <div className="hero-section">
            <h1>Welcome to Cipher AI Vault</h1>
            <p>
              Secure, sandboxed AI with in-memory VectorDB and LLM,
              stable-memory data storage, and more—all on the Internet Computer.
            </p>
            <ICWalletList giveToParent={giveToParent} whitelist={whitelist} />
          </div>
        </div>
      ) : (
        <>
          <button className="settings-btn" onClick={toggleSettings}>
            Settings
          </button>

          <SettingsDropdown
            isVisible={settingsVisible}
            onCyclesTopUp={handleCyclesTopUp}
            onLogout={handleLogout}
            onGetBalances={getBalances}
            showUserFiles={showUserFiles}
            onToggleUserFiles={toggleUserFiles}
          />

          <LoggedInUser principal={currentUser.principal} />

          {globalLoading && <LoadingOverlay message={loadingMessage} />}
          {error && <ErrorNotification message={error} onClose={() => setError(null)} />}
          {confirmDelete && (
            <DeleteConfirmation
              asset={confirmDelete}
              onConfirm={() => handleDeleteAsset(confirmDelete)}
              onCancel={() => setConfirmDelete(null)}
            />
          )}

          <UploadButton
            onUpload={(file) => handleFileUpload(file, currentUser.principal || "")}
            disabled={globalLoading}
          />

          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

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