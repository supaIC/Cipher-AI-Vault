// Import necessary dependencies and components
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
import { HttpAgent } from "@dfinity/agent";

// Define the Parent component
export function Parent() {
  // State variables for managing user, assets, loading, errors, etc.
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
  const [dragging, setDragging] = useState<boolean>(false);
  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);
  const [tooltipPosition] = useState<{
    left: number;
    top: number;
  }>({ left: 0, top: 0 });
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);

  // Callback to set user information
  const giveToParent = useCallback(
    (principal: string, agent: HttpAgent, provider: string) => {
      setCurrentUser({ principal, agent, provider });
    },
    []
  );

  // Effect to load assets when user changes
  useEffect(() => {
    if (currentUser) {
      loadList();
    }
  }, [currentUser, loadList, showUserFiles]);

  // Event handlers for drag and drop functionality
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      setDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.relatedTarget || e.relatedTarget === document.body) {
      setDragging(false);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDragging(false);
  }, []);

  // Function to open and close asset view
  const openAssetView = useCallback((asset: Asset) => {
    setViewingAsset(asset);
  }, []);

  const closeAssetView = useCallback(() => {
    setViewingAsset(null);
  }, []);

  // Function to handle cycles top-up
  const handleCyclesTopUp = async () => {
    if (currentUser) {
      await cyclesTopUp(currentUser);
    }
  };

  // JSX structure of the Parent component
  return (
    <div
      className="app"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
          handleFileUpload(file, currentUser?.principal || "");
        }
      }}
      onMouseLeave={handleMouseLeave}
    >
      {/* Button to donate cycles */}
      {currentUser && (
        <button
          onClick={handleCyclesTopUp}
          style={{
            position: "absolute",
            top: "47px",
            left: "2%",
            zIndex: 9,
          }}
        >
          Donate Cycles
        </button>
      )}

      {/* Loading overlay, error notification, and delete confirmation */}
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

      {/* Render ICWalletList component if no user is logged in */}
      {!currentUser ? (
        <ICWalletList
          giveToParent={giveToParent}
          whitelist={[
            "zks6t-giaaa-aaaap-qb7fa-cai",
            "jeb4e-myaaa-aaaak-aflga-cai",
          ]}
        />
      ) : (
        <>
          {/* UploadButton and ToggleButton components */}
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

          {/* Assets container */}
          <div className={`assets-container ${dragging ? "dragging" : ""}`}>
            {dragging && (
              <div className="overlay">Drop file here to upload</div>
            )}
            <div className="logged-in-info">
              Logged in as: {currentUser.principal}
            </div>
            {/* Render AssetListItem components for each asset */}
            {assets.map((asset) => (
              <AssetListItem
                key={asset.key}
                asset={asset}
                onMouseEnter={() => setHoveredAsset(asset)}
                onMouseLeave={() => setHoveredAsset(null)}
                onClick={() => openAssetView(asset)}
              />
            ))}
            {/* Tooltip for hovered asset */}
            {hoveredAsset && (
              <div
                className="tooltip"
                style={{ left: tooltipPosition.left, top: tooltipPosition.top }}
              >
                <p>URL: {hoveredAsset.url}</p>
              </div>
            )}
          </div>

          {/* Render AssetView component if viewing an asset */}
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
        </>
      )}
    </div>
  );
}