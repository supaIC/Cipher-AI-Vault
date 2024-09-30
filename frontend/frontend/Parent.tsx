import React, { useCallback, useEffect, useState } from "react";
import * as Components from "./components";
import * as Screens from "./screens";
import * as Actors from "./actors";
import { useAssetManager, Asset } from "./hooks/assetManager/assetManager";
import { useDataManager } from "./hooks/dataManager/dataManager";
import internetComputerLogo from './assets/images/internet_computer.png';
import cipherProxyLogo from './assets/images/cipher_proxy.png';
import { Types } from "ic-auth";

export function Parent() {
  const { currentUser, setCurrentUser } = Actors.useAuthActor();
  const { createBackendActor } = Actors.useBackendActor();
  const dataManager = useDataManager();
  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);
  const [tooltipPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [viewMode, setViewMode] = useState<'images' | 'json' | 'documents' | 'admin' | 'public'>('images');
  const [privateData, setPrivateData] = useState<any | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);

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

  useEffect(() => {
    const loadPrivateData = async () => {
      if (currentUser) {
        try {
          const userData = await dataManager.getAllUserData(currentUser);
          setPrivateData(userData);
        } catch (error) {
          console.error("Error loading private data:", error);
        }
      }
    };

    loadPrivateData();
  }, [currentUser, dataManager]);

  useEffect(() => {
    if (currentUser) {
      loadAssetList();
    }
  }, [currentUser, loadAssetList, showUserFiles]);

  const giveToParent = useCallback(
    (principal: string, agent: any, provider: string) => {
      setCurrentUser({ principal, agent, provider });
    },
    [setCurrentUser]
  );

  const toggleSettings = () => {
    setSettingsVisible((prevState) => !prevState);
  };

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
      {!currentUser ? (
        <div className="landing-page">
          <img src={internetComputerLogo} alt="Internet Computer" className="bottom-left-image" />
          <img src={cipherProxyLogo} alt="Cipher Proxy" className="right-image" />
          <div className="hero-section">
            <h1>Welcome to Cipher AI Vault</h1>
            <p>
              Secure, sandboxed AI with in-memory VectorDB and LLM, stable-memory data storage, and more—all on the Internet Computer.
            </p>
            <Components.ICWalletList giveToParent={giveToParent} whitelist={[]} />
          </div>
        </div>
      ) : (
        <>
          {globalLoading && <Components.LoadingOverlay message={loadingMessage} />}
          {error && <Components.ErrorNotification message={error} onClose={() => setError(null)} />}
          {confirmDelete && (
            <Components.DeleteConfirmation
              asset={confirmDelete}
              onConfirm={async () => handleDeleteAsset(confirmDelete)}
              onCancel={() => setConfirmDelete(null)}
            />
          )}

          <Components.ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

          {(viewMode === 'images' || viewMode === 'documents' || viewMode === 'public') && (
            <Components.UploadButton
              onUpload={(file) => handleFileUpload(file, currentUser?.principal || "")}
              disabled={globalLoading}
            />
          )}

          {viewMode === 'images' || viewMode === 'documents' || viewMode === 'public' ? (
            <Components.DragAndDropContainer onDrop={handleDrop}>
              <div className="assets-container">
                {viewMode === 'images' && (
                  <Screens.ImageStore
                    assets={assets}
                    onAssetHover={setHoveredAsset}
                    onDelete={(asset) => setConfirmDelete(asset)}
                  />
                )}
                {viewMode === 'documents' && (
                  <Screens.DocumentStore
                    assets={assets}
                    onAssetHover={setHoveredAsset}
                    onDelete={(asset) => setConfirmDelete(asset)}
                  />
                )}
                {viewMode === 'public' && (
                  <Screens.PublicDataStore
                    assets={assets}
                    onAssetHover={setHoveredAsset}
                    onDelete={async (asset) => setConfirmDelete(asset)}
                  />
                )}
              </div>
              {hoveredAsset && (
                <div className="tooltip" style={{ left: tooltipPosition.left, top: tooltipPosition.top }}>
                  <p>URL: {hoveredAsset.url}</p>
                </div>
              )}
            </Components.DragAndDropContainer>
          ) : (
            viewMode === 'json' ? (
              <Screens.PrivateDataStore
                assets={assets}
                userObject={currentUser as Types.UserObject}
                onDelete={(asset: Asset | null) => setConfirmDelete(asset)}
                onAssetHover={setHoveredAsset}
              />
            ) : (
              <Screens.DatabaseAdmin
                assets={assets}
                privateData={privateData}
                currentUser={currentUser}
                onLogout={() => setCurrentUser(null)}
              />
            )
          )}
        </>
      )}
    </div>
  );
}