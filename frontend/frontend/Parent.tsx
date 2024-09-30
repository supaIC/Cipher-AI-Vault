// React
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Screens
import * as Screens from "./screens";

// Components
import * as Components from "./components";

// Actors
import * as Actors from "./actors";

// Hooks
import * as data from './hooks/dataManager/dataManager';
import { useAssetManager, Asset } from "./hooks/assetManager/assetManager";
import { useDataManager } from "./hooks/dataManager/dataManager";
import useWorker from './hooks/modelManager/useWorker';
import useChat from './hooks/modelManager/useChat';
import useModelLoader from './hooks/modelManager/useModelLoader';
import useDatabase from './hooks/dataManager/useDatabase';
import useDarkMode from './hooks/useDarkMode/useDarkMode';

// Types
import { Types } from "ic-auth";

// Styles
import './styles/Parent.css';

interface SearchResult {
  input: string;
  similarity: number;
  object: {
    name: string;
    description: string;
  };
}

export function Parent() {
  const { currentUser, setCurrentUser } = Actors.useAuthActor();
  const { createBackendActor } = Actors.useBackendActor();
  const dataManager = useDataManager();

  // State variables
  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState<string>('Dashboard');
  const [privateData, setPrivateData] = useState<data.FullDataQuery | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [status, setStatus] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [progressItems, setProgressItems] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loadedModels, setLoadedModels] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [showUserFiles, setShowUserFiles] = useState<boolean>(false);

  const isMounted = useRef<boolean>(true);

  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const addRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => [query, ...prev.filter((item) => item !== query)].slice(0, 5));
  }, []);

  const {
    assets,
    globalLoading,
    error,
    setError,
    confirmDelete,
    setConfirmDelete,
    loadAssetList,
    handleDeleteAsset,
    handleFileUpload,
    toggleUserFiles,
  } = useAssetManager(currentUser, currentUser?.principal || null);

  const publicJsonAssets = assets.filter((asset) => asset.key.includes('/data-store/'));
  const privateJsonAssets = privateData
    ? privateData.flatMap((userDataMap) => (Array.isArray(userDataMap) ? userDataMap[1].allFiles : []))
    : [];

  const {
    index,
    searchResult,
    selectedFile,
    setSelectedFile,
    selectedFileType,
    setSelectedFileType,
    initializeDB,
    handleSearch,
    clearDatabase,
  } = useDatabase({
    isRunning,
    setIsRunning,
    log: console.log,
    addRecentSearch,
    setStatusMessage,
    publicJsonAssets,
    privateJsonAssets,
    isMounted,
  });

  const worker = useWorker({
    selectedModel,
    log: console.log,
  });

  useModelLoader({
    worker,
    selectedModel,
    setStatus,
    setStatusMessage,
    setLoadedModels,
    setProgressItems,
    setLoadingMessage,
    isMounted,
    log: console.log,
  });

  const {
    messages,
    setMessages,
    input,
    setInput,
    tps,
    numTokens,
    onEnter,
    onInterrupt,
  } = useChat({
    isRunning,
    setIsRunning,
    selectedModel,
    worker,
    log: console.log,
    handleSearch,
    isMounted,
    setStatus,
    setStatusMessage,
  });

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

  useEffect(() => {
    isMounted.current = true;
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const giveToParent = useCallback(
    (principal: string, agent: any, provider: string) => {
      setCurrentUser({ principal, agent, provider });
    },
    [setCurrentUser]
  );

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  const handleTooltip = useCallback((content: string | null, event?: React.MouseEvent) => {
    if (content) {
      setTooltipContent(content);
      setTooltipPosition({ x: event?.clientX || 0, y: event?.clientY || 0 });
    } else {
      setTooltipContent(null);
    }
  }, []);

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

  const renderActionButton = useCallback(
    (label: string, onClick: () => void, disabled: boolean, primary: boolean = false): JSX.Element => (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`button ${primary ? 'button-primary' : 'button-secondary'} ${disabled ? 'button-disabled' : ''}`}
        aria-label={label}
      >
        {label}
      </button>
    ),
    []
  );

  const renderCard = useCallback(
    (title: string, content: React.ReactNode): JSX.Element => (
      <div className="card" key={title}>
        <h3 className="card-title">{title}</h3>
        <div className="card-content">{content}</div>
      </div>
    ),
    []
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'Dashboard':
        return (
          <Screens.Dashboard
            loadedModels={loadedModels}
            index={index}
            renderCard={renderCard}
            renderActionButton={renderActionButton}
            setActiveSection={setActiveSection}
            recentSearches={recentSearches}
            handleSearch={handleSearch}
            setSearchQuery={setSearchQuery}
          />
        );
      case 'Model Manager':
        return (
          <Screens.ModelManagement
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            loadedModels={loadedModels}
            isRunning={isRunning}
            renderActionButton={renderActionButton}
            worker={worker}
            setStatus={setStatus}
            setStatusMessage={setStatusMessage}
            log={console.log}
          />
        );
      case 'Data Management':
        return (
          <Screens.DataManagement
            isRunning={isRunning}
            selectedFileType={selectedFileType}
            setSelectedFileType={setSelectedFileType}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            publicJsonAssets={publicJsonAssets}
            privateJsonAssets={privateJsonAssets}
            renderActionButton={renderActionButton}
            initializeDB={initializeDB}
            status={status}
            clearDatabase={clearDatabase}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            performSearch={() => handleSearch(searchQuery)}
            index={index}
            recentSearches={recentSearches}
            handleSearch={handleSearch}
            searchResult={searchResult}
            statusMessage={statusMessage}
          />
        );
      case 'Playground':
        return (
          <Screens.ChatInterface
            messages={messages}
            isRunning={isRunning}
            status={status}
            tps={tps}
            numTokens={numTokens}
            input={input}
            setInput={setInput}
            onEnter={onEnter}
            onInterrupt={onInterrupt}
            worker={worker}
            setMessages={setMessages}
          />
        );
      case 'Cycle Management':
        return (
          <Screens.CycleManagement
            currentUser={currentUser}
          />
        );
      case 'Settings':
        return (
          <Screens.Settings
            currentUser={currentUser}
            onLogout={() => setCurrentUser(null)}
          />
        );
      case 'Image Storage':
      case 'Document Storage':
      case 'Public Data':
        return (
          <Components.DragAndDropContainer onDrop={handleDrop}>
            {activeSection === 'Image Storage' && (
              <>
                <Components.UploadButton onUpload={(file) => handleFileUpload(file, currentUser?.principal || "")} disabled={globalLoading} />
                <Screens.ImageStore
                  assets={assets}
                  onAssetHover={setHoveredAsset}
                  onDelete={(asset) => setConfirmDelete(asset)}
                />
              </>
            )}
            {activeSection === 'Document Storage' && (
              <>
                <Components.UploadButton onUpload={(file) => handleFileUpload(file, currentUser?.principal || "")} disabled={globalLoading} />
                <Screens.DocumentStore
                  assets={assets}
                  onAssetHover={setHoveredAsset}
                  onDelete={(asset) => setConfirmDelete(asset)}
                />
              </>
            )}
            {activeSection === 'Public Data' && (
              <>
                <Components.UploadButton onUpload={(file) => handleFileUpload(file, currentUser?.principal || "")} disabled={globalLoading} />
                <Screens.PublicDataStore
                  assets={assets}
                  onAssetHover={setHoveredAsset}
                  onDelete={async (asset) => setConfirmDelete(asset)}
                />
              </>
            )}
          </Components.DragAndDropContainer>
        );
      case 'Stable Memory':
        return (
          <Screens.PrivateDataStore
            assets={assets}
            userObject={currentUser as Types.UserObject}
            onDelete={(asset: Asset | null) => setConfirmDelete(asset)}
            onAssetHover={setHoveredAsset}
          />
        );
      default:
        return null;
    }
  };  

  return (
    <div className={`app admin-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {!currentUser ? (
        <Screens.LandingPage giveToParent={giveToParent} />
      ) : (
        <>
          <Components.Header
            isMenuOpen={isMenuOpen}
            toggleMenu={toggleMenu}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            currentUser={currentUser.principal}
          />

          <main className="main-content">
            <Components.Sidebar
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              isMenuOpen={isMenuOpen}
              toggleMenu={toggleMenu}
            />

            <section className="content-area">
              {renderContent()}

              {tooltipContent && (
                <div className="tooltip" style={{ left: tooltipPosition.x, top: tooltipPosition.y }}>
                  <p>{tooltipContent}</p>
                </div>
              )}
            </section>
          </main>

          {globalLoading && <Components.LoadingOverlay message={loadingMessage} />}
          {error && <Components.ErrorNotification message={error} onClose={() => setError(null)} />}
          {confirmDelete && (
            <Components.DeleteConfirmation
              asset={confirmDelete}
              onConfirm={async () => {
                await handleDeleteAsset(confirmDelete);
                setConfirmDelete(null);
              }}
              onCancel={() => setConfirmDelete(null)}
            />
          )}
          <Components.ModelStatusOverlay status={status} loadingMessage={loadingMessage} />
        </>
      )}
    </div>
  );
}