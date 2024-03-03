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
import { UserObject } from "./hooks/walletFunctions";
import { useAssetManager, Asset } from "./hooks/useAssetManager";
import { cyclesTopUp } from "./hooks/useCyclesTopup";
import DragAndDropContainer from "./components/DragAndDropContainer";
import { HttpAgent } from "@dfinity/agent";
import { whitelist } from "./whitelist";

export function Parent() {
  const [currentUser, setCurrentUser] = useState<UserObject | null>(null);
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
  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);
  const [tooltipPosition] = useState<{
    left: number;
    top: number;
  }>({ left: 0, top: 0 });
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const giveToParent = useCallback(
    (principal: string, agent: HttpAgent, provider: string) => {
      setCurrentUser({ principal, agent, provider });
    },
    []
  );

  useEffect(() => {
    if (currentUser) {
      loadList();
    }
  }, [currentUser, loadList, showUserFiles]);

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

  const openAssetView = useCallback((asset: Asset) => {
    setViewingAsset(asset);
  }, []);

  const closeAssetView = useCallback(() => {
    setViewingAsset(null);
  }, []);

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

  return (
    <div className="app">
      {currentUser && (
        <>
          <button className="settings-btn" onClick={toggleSettings}>
            Settings
          </button>

          {settingsVisible && (
            <div className={`settings-dropdown ${settingsVisible && 'active'}`}>
              <button onClick={handleCyclesTopUp}>Donate Cycles</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </>
      )}

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

      {!currentUser ? (
        <ICWalletList
          giveToParent={giveToParent}
          whitelist={whitelist}
        />
      ) : (
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
              {assets.map((asset) => (
                <AssetListItem
                  key={asset.key}
                  asset={asset}
                  onMouseEnter={() => setHoveredAsset(asset)}
                  onMouseLeave={() => setHoveredAsset(null)}
                  onClick={() => openAssetView(asset)}
                />
              ))}
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

          {!imagesLoaded && <LoadingOverlay message="Loading assets..." />}
        </>
      )}
    </div>
  );
}
