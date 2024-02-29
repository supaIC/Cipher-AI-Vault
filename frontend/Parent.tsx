import React, { useEffect, useState, useCallback } from 'react';
import { HttpAgent } from '@dfinity/agent';
import { AssetManager } from '@dfinity/assets';
import './styles/index.css';
import UploadButton from './components/UploadButton';
import { LoadingOverlay, ErrorNotification, DeleteConfirmation } from './components/OverlayComponents';
import AssetView from './components/AssetView';
import AssetListItem from './components/AssetListItem';
import ToggleButton from './components/ToggleButton';
import { ICWalletList } from './components/ICWalletList';
import { UserObject } from './hooks/walletFunctions';

interface Asset {
  key: string;
  url: string;
}

export function Parent() {
  const [currentUser, setCurrentUser] = useState<UserObject | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Asset | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [bucketName, setBucketName] = useState<string | null>(null);
  const [showUserFiles, setShowUserFiles] = useState<boolean>(false);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);

  const giveToParent = useCallback(
    (principal: string, agent: HttpAgent, provider: string) => {
      setCurrentUser({ principal, agent, provider });
      setBucketName(principal);
    },
    []
  );

  const createAssetActor = useCallback(async (): Promise<AssetManager> => {
    if (!currentUser || !bucketName) throw new Error('CurrentUser or bucketName is not set.');
    return new AssetManager({
      agent: currentUser.agent as HttpAgent,
      canisterId: 'zks6t-giaaa-aaaap-qb7fa-cai',
    });
  }, [currentUser, bucketName]);

  const loadList = useCallback(async () => {
    setGlobalLoading(true);
    setLoadingMessage('Loading assets...');
    try {
      const actor = await createAssetActor();
      const list = await actor.list();
      const filteredList = showUserFiles
        ? list.filter((file) => file.key.startsWith(`/${currentUser?.principal}/`))
        : list;
      setAssets(
        filteredList.map((file) => ({
          key: file.key,
          url: `https://zks6t-giaaa-aaaap-qb7fa-cai.raw.icp0.io/${file.key.slice(1)}`,
        }))
      );
      setError(null);
    } catch (err) {
      setError('Failed to load assets.');
    } finally {
      setGlobalLoading(false);
    }
  }, [createAssetActor, currentUser, showUserFiles]);

  const handleDeleteAsset = useCallback(async () => {
    if (!confirmDelete) return;
    setGlobalLoading(true);
    setLoadingMessage('Deleting asset...');
    try {
      const actor = await createAssetActor();
      await actor.delete(confirmDelete.key);
      await loadList();
      setConfirmDelete(null);
    } catch (err) {
      setError(`Failed to delete asset: ${confirmDelete.key}`);
      setConfirmDelete(null);
    } finally {
      setGlobalLoading(false);
    }
  }, [confirmDelete, createAssetActor, loadList]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!currentUser || !currentUser.principal) {
      setError('User not authenticated.');
      return;
    }

    setGlobalLoading(true);
    setLoadingMessage('Uploading file...');
    try {
      const actor = await createAssetActor();
      const key = `${currentUser.principal}/${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await actor.store(uint8Array, { fileName: key });
      await loadList();
    } catch (err) {
      setError('Failed to upload file.');
    } finally {
      setGlobalLoading(false);
    }
  }, [currentUser, createAssetActor, loadList]);

  useEffect(() => {
    if (currentUser) {
      loadList();
    }
  }, [currentUser, loadList]);

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

  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const openAssetView = useCallback((asset: Asset) => {
    setViewingAsset(asset);
  }, []);

  const closeAssetView = useCallback(() => {
    setViewingAsset(null);
  }, []);

  const toggleUserFiles = useCallback(() => {
    setShowUserFiles((prevState) => !prevState);
  }, []);

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
          handleFileUpload(file);
        }
      }}
      onMouseLeave={handleMouseLeave}
    >
      {globalLoading && <LoadingOverlay message={loadingMessage} />}
      {error && <ErrorNotification message={error} onClose={() => setError(null)} />}
      {confirmDelete && (
        <DeleteConfirmation
          asset={confirmDelete}
          onConfirm={handleDeleteAsset}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {!currentUser ? (
        <ICWalletList giveToParent={giveToParent} whitelist={['zks6t-giaaa-aaaap-qb7fa-cai']} />
      ) : (
        <>
          <UploadButton onUpload={handleFileUpload} disabled={globalLoading} />
          <ToggleButton label="Show Only My Files" checked={showUserFiles} onChange={toggleUserFiles} />
          <div className={`assets-container ${dragging ? 'dragging' : ''}`}>
            {dragging && <div className="overlay">Drop file here to upload</div>}
            <div className="logged-in-info">Logged in as: {currentUser.principal}</div>
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
              <div className="tooltip" style={{ left: tooltipPosition.left, top: tooltipPosition.top }}>
                <p>Key: {hoveredAsset.key}</p>
                <p>URL: {hoveredAsset.url}</p>
              </div>
            )}
          </div>
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