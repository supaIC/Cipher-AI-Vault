import React, { useCallback, useEffect, useState } from "react";
import * as Components from "./components"; // Import all components at once
import * as Screens from "./screens";       // Import all screens at once
import * as Actor from "./actors";        // Import all context providers at once
import { useAssetManager, Asset } from "./hooks/assetManager/assetManager"; // Still using useAssetManager
import internetComputerLogo from './assets/logos/internet_computer.png';
import cipherProxyLogo from './assets/logos/cipher_proxy.png';

export function Parent() {
  const { currentUser, setCurrentUser } = Actor.useAuthActor();         // Use auth actor for currentUser and setCurrentUser
  const { dataActor, initializeDataActor } = Actor.useDataActor();      // Use data actor for data management
  const { createBackendActor } = Actor.useBackendActor();               // Use backend actor for backend interaction
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
    // Initialize the data actor when currentUser is available
    const initialize = async () => {
      if (currentUser && currentUser.agent) {
        await initializeDataActor(currentUser.agent);
      }
    };
    initialize();
  }, [currentUser, initializeDataActor]); // Run effect when currentUser changes

  useEffect(() => {
    const loadPrivateData = async () => {
      if (dataActor) { // Ensure dataActor is initialized
        try {
          const userData = await dataActor.getAllUserData(); // Adjusted to call the correct method
          setPrivateData(userData);
        } catch (error) {
          console.error("Error loading private data:", error);
        }
      }
    };

    loadPrivateData(); // Call loadPrivateData whenever dataActor changes
  }, [dataActor]);

  useEffect(() => {
    if (currentUser) {
      loadAssetList();
    }
  }, [currentUser, loadAssetList, showUserFiles]);

  const giveToParent = useCallback(
    (principal: string, agent: any, provider: string) => {
      setCurrentUser({ principal, agent, provider: provider || '' });  // Ensure provider is always a string
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
        handleFileUpload(file, currentUser.principal || ""); // Ensure currentUser is defined
      }
    },
    [currentUser, handleFileUpload]
  );

  return (
    <div className="app">
      <img src={internetComputerLogo} alt="Internet Computer" className="bottom-left-image" />
      <img src={cipherProxyLogo} alt="Cipher Proxy" className="right-image" />

      {!currentUser ? (
        <div className="landing-page">
          <div className="hero-section">
            <h1>Welcome to Cipher AI Vault</h1>
            <p>
              Secure, sandboxed AI with in-memory VectorDB and LLM, stable-memory data storage, and more—all on the Internet Computer.
            </p>
            <Components.ICWalletList giveToParent={giveToParent} whitelist={[]} /> {/* Pass the empty whitelist or update if needed */}
          </div>
        </div>
      ) : (
        <>
          <button className="settings-btn" onClick={toggleSettings}>Settings</button>

          <Components.SettingsDropdown
            isVisible={settingsVisible}
            currentUser={currentUser} // Pass currentUser
            onLogout={() => setCurrentUser(null)}
            showUserFiles={showUserFiles}
            onToggleUserFiles={toggleUserFiles}
          />

          <Components.LoggedInUser principal={currentUser.principal} />

          {globalLoading && <Components.LoadingOverlay message={loadingMessage} />}
          {error && <Components.ErrorNotification message={error} onClose={() => setError(null)} />}
          {confirmDelete && (
            <Components.DeleteConfirmation
              asset={confirmDelete}
              onConfirm={() => handleDeleteAsset(confirmDelete)}
              onCancel={() => setConfirmDelete(null)}
            />
          )}

          <Components.UploadButton
            onUpload={(file) => handleFileUpload(file, currentUser?.principal || "")}
            disabled={globalLoading}
          />

          <Components.ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

          <Components.DragAndDropContainer onDrop={handleDrop}>
            <div className="assets-container">
              {viewMode === 'images' ? (
                <Screens.ImageStore assets={assets} onAssetHover={setHoveredAsset} onDelete={(asset) => setConfirmDelete(asset)} />
              ) : viewMode === 'documents' ? (
                <Screens.DocumentStore assets={assets} onAssetHover={setHoveredAsset} onDelete={(asset) => setConfirmDelete(asset)} />
              ) : viewMode === 'json' ? (
                <Screens.PrivateDataStore
                  assets={assets}
                  userObject={{ ...currentUser, provider: currentUser?.provider || '' }}  // Ensure provider is string
                  onDelete={(asset: Asset | null) => setConfirmDelete(asset)}
                />
              ) : viewMode === 'public' ? (
                <Screens.PublicDataStore assets={assets} onDelete={async (asset) => setConfirmDelete(asset)} />
              ) : (
                <Screens.DatabaseAdmin assets={assets} privateData={privateData} />
              )}
            </div>
            {hoveredAsset && (
              <div className="tooltip" style={{ left: tooltipPosition.left, top: tooltipPosition.top }}>
                <p>URL: {hoveredAsset.url}</p>
              </div>
            )}
          </Components.DragAndDropContainer>
        </>
      )}
    </div>
  );
}
