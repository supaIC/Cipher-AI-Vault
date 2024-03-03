import React, { useEffect, useState, useCallback } from "react";
import UploadButton from "./components/UploadButton";
import {
  LoadingOverlay,
  ErrorNotification,
  DeleteConfirmation,
} from "./components/OverlayComponents";
import AssetView from "./components/AssetView";
import AssetListItem from "./components/AssetListItem";
import ToggleButton from "./components/ToggleButton";
import { ICWalletList } from "./components/ICWalletList";
import { UserObject } from "./hooks/authFunctions";
import { useAssetManager, Asset } from "./hooks/useAssetManager";
import { cyclesTopUp } from "./hooks/useCyclesTopup";
import DragAndDropContainer from "./components/DragAndDropContainer";
import { HttpAgent } from "@dfinity/agent";
import { whitelist } from "./whitelist";

export function Parent() {
  // State variables for managing the current user and assets
  const [currentUser, setCurrentUser] = useState<UserObject | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);
  const [tooltipPosition] = useState<{
    left: number;
    top: number;
  }>({ left: 0, top: 0 });
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Custom hook to manage asset-related operations
  const {
    assets,
    globalLoading,
    loadingMessage,
    error,
    setError,
    confirmDelete,
    setConfirmDelete,
    loadList,
    handleDeleteAsset,
    handleFileUpload,
    showUserFiles,
    toggleUserFiles,
  } = useAssetManager(currentUser, currentUser?.principal || null);

  // Function to pass user information to the parent component
  const giveToParent = useCallback(
    (principal: string, agent: HttpAgent, provider: string) => {
      setCurrentUser({ principal, agent, provider });
    },
    []
  );

  // Effect to load the list of assets when currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadList();
    }
  }, [currentUser, loadList, showUserFiles]);

  // Effect to load images when assets change
  useEffect(() => {
    const imagesToLoad = assets.length;
    let loadedCount = 0;

    const handleImageLoad = () => {
      loadedCount++;
      if (loadedCount === imagesToLoad) {
        setImagesLoaded(true);
      }
    };

    assets.forEach((asset) => {
      const image = new Image();
      image.onload = handleImageLoad;
      image.src = asset.url;
    });

    return () => {
      assets.forEach((asset) => {
        const image = new Image();
        image.onload = null;
        image.src = "";
      });
    };
  }, [assets]);

  // Function to open the asset view
  const openAssetView = useCallback((asset: Asset) => {
    setViewingAsset(asset);
  }, []);

  // Function to close the asset view
  const closeAssetView = useCallback(() => {
    setViewingAsset(null);
  }, []);

  // Function to handle cycles top-up
  const handleCyclesTopUp = async () => {
    if (currentUser) {
      await cyclesTopUp(currentUser);
    }
  };

  // Function to handle logout
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  // State variable to manage settings visibility
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Function to toggle settings visibility
  const toggleSettings = () => {
    setSettingsVisible((prevState) => !prevState);
  };

  return (
    <div className="app">
      {/* Render settings button and dropdown if currentUser exists */}
      {currentUser && (
        <>
          <button className="settings-btn" onClick={toggleSettings}>
            Settings
          </button>

          {settingsVisible && (
            <div className={`settings-dropdown ${settingsVisible && "active"}`}>
              <button onClick={handleCyclesTopUp}>Donate Cycles</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </>
      )}

      {/* Render loading overlay, error notification, and delete confirmation */}
      {globalLoading && <LoadingOverlay message={loadingMessage} />}
      {error && (
        <ErrorNotification message={error} onClose={() => setError(null)} />
      )}
      {confirmDelete && (
        <DeleteConfirmation
          asset={confirmDelete}
          onConfirm={() => handleDeleteAsset(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Render ICWalletList if currentUser doesn't exist */}
      {!currentUser ? (
        <ICWalletList giveToParent={giveToParent} whitelist={whitelist} />
      ) : (
        // Render upload button, toggle button, drag and drop container, asset list, and asset view
        <>
          <UploadButton
            onUpload={(file) =>
              handleFileUpload(file, currentUser.principal || "")
            }
            disabled={globalLoading}
          />
          <ToggleButton
            label="Show Only My Files"
            checked={showUserFiles}
            onChange={toggleUserFiles}
          />

          <DragAndDropContainer
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                handleFileUpload(file, currentUser?.principal || "");
              }
            }}
          >
            <div className={`assets-container`}>
              <div className="logged-in-info">
                Logged in as: {currentUser.principal}
              </div>
              {/* Render AssetListItem for each asset */}
              {assets.map((asset) => (
                <AssetListItem
                  key={asset.key}
                  asset={asset}
                  onMouseEnter={() => setHoveredAsset(asset)}
                  onMouseLeave={() => setHoveredAsset(null)}
                  onClick={() => openAssetView(asset)}
                />
              ))}
              {/* Render tooltip for hovered asset */}
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
            </div>
          </DragAndDropContainer>

          {/* Render AssetView for viewing asset */}
          {viewingAsset && (
            <AssetView
              asset={viewingAsset}
              onClose={closeAssetView}
              onDelete={() => {
                setConfirmDelete(viewingAsset);
                setViewingAsset(null);
              }}
            />
          )}

          {/* Render loading overlay if images are not loaded */}
          {!imagesLoaded && <LoadingOverlay message="Loading assets..." />}
        </>
      )}
    </div>
  );
}