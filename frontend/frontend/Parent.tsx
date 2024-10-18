// Parent.tsx
import React, { useEffect, useRef, useCallback } from 'react';

// Screens
import * as Screens from './screens';

// Components
import * as Components from './components';

// Actors
import * as Actors from './actors';

// Hooks
import { useAssetManager, Asset } from './hooks/assetManager/assetManager';
import { useDataManager } from './hooks/dataManager/dataManager';
import useWorker from './hooks/modelManager/useWorker';
import useChat from './hooks/modelManager/useChat';
import useModelLoader from './hooks/modelManager/useModelLoader';
import useDatabase from './hooks/dataManager/useDatabase';
import useDarkMode from './hooks/useDarkMode/useDarkMode';

// Types
import { Types } from 'ic-auth';

// Zustand Store
import { useStore } from './store/store';

// Logger
import { debugLog, errorLog } from './utils/logger'; // Adjust the path as necessary

export function Parent() {
  const { currentUser, setCurrentUser } = Actors.useAuthActor();
  const { createBackendActor } = Actors.useBackendActor();
  const dataManager = useDataManager();

  // Zustand State Variables and Actions
  const hoveredAsset = useStore((state) => state.hoveredAsset);
  const setHoveredAsset = useStore((state) => state.setHoveredAsset);

  const tooltipPosition = useStore((state) => state.tooltipPosition);
  const setTooltipPosition = useStore((state) => state.setTooltipPosition);

  const activeSection = useStore((state) => state.activeSection);
  const setActiveSection = useStore((state) => state.setActiveSection);

  const privateData = useStore((state) => state.privateData);
  const setPrivateData = useStore((state) => state.setPrivateData);

  const statusMessage = useStore((state) => state.statusMessage);
  const setStatusMessage = useStore((state) => state.setStatusMessage);

  const status = useStore((state) => state.status);
  const setStatus = useStore((state) => state.setStatus);

  const loadingMessage = useStore((state) => state.loadingMessage);

  const progressItems = useStore((state) => state.progressItems);
  const setProgressItems = useStore((state) => state.setProgressItems);

  const isRunning = useStore((state) => state.isRunning);
  const setIsRunning = useStore((state) => state.setIsRunning);

  const selectedModel = useStore((state) => state.selectedModel);
  const setSelectedModel = useStore((state) => state.setSelectedModel);

  const loadedModels = useStore((state) => state.loadedModels);
  const setLoadedModels = useStore((state) => state.setLoadedModels);

  const searchQuery = useStore((state) => state.searchQuery);
  const setSearchQuery = useStore((state) => state.setSearchQuery);

  const recentSearches = useStore((state) => state.recentSearches);
  const setRecentSearches = useStore((state) => state.setRecentSearches);
  const addRecentSearch = useStore((state) => state.addRecentSearch);

  const isMenuOpen = useStore((state) => state.isMenuOpen);
  const setIsMenuOpen = useStore((state) => state.setIsMenuOpen);

  const tooltipContent = useStore((state) => state.tooltipContent);
  const setTooltipContent = useStore((state) => state.setTooltipContent);

  const showUserFiles = useStore((state) => state.showUserFiles);
  const setShowUserFiles = useStore((state) => state.setShowUserFiles);

  const selectedFile = useStore((state) => state.selectedFile);
  const setSelectedFile = useStore((state) => state.setSelectedFile);

  const selectedFileType = useStore((state) => state.selectedFileType);
  const setSelectedFileType = useStore((state) => state.setSelectedFileType);

  const searchResult = useStore((state) => state.searchResult);
  const setSearchResult = useStore((state) => state.setSearchResult);

  const index = useStore((state) => state.index);
  const setIndex = useStore((state) => state.setIndex);

  const isMounted = useRef<boolean>(true);

  const { isDarkMode, toggleDarkMode } = useDarkMode();

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
    ? privateData.flatMap((userDataMap) =>
        Array.isArray(userDataMap) ? userDataMap[1].allFiles : []
      )
    : [];

  const {
    initializeDB,
    handleSearch,
    clearDatabase,
  } = useDatabase({
    log: debugLog,
    addRecentSearch,
    publicJsonAssets,
    privateJsonAssets,
    isMounted,
  });

  const { workerRef, loadModel } = useWorker({
    selectedModel,
    log: debugLog,
  });

  // **Access Loading States from Zustand Store**
  const isLoading = useStore((state) => state.isLoading);
  const currentLoadingMessage = useStore((state) => state.loadingMessage);

  useModelLoader({
    worker: workerRef,
    selectedModel,
    setLoadedModels,
    setProgressItems,
    isMounted,
    log: debugLog,
  });

  const { messages, setMessages, input, setInput, tps, numTokens, onEnter, onInterrupt } = useChat({
    isRunning,
    setIsRunning,
    selectedModel,
    worker: workerRef,
    log: debugLog,
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
          errorLog('Error loading private data:', error);
        }
      }
    };

    loadPrivateData();
  }, [currentUser, dataManager, setPrivateData]);

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
  }, [setRecentSearches]);

  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const giveToParent = useCallback(
    (principal: string, agent: any, provider: string) => {
      setCurrentUser({ principal, agent, provider });
    },
    [setCurrentUser]
  );

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), [setIsMenuOpen]);

  const handleTooltip = useCallback(
    (content: string | null, event?: React.MouseEvent) => {
      if (content) {
        setTooltipContent(content);
        setTooltipPosition({ x: event?.clientX || 0, y: event?.clientY || 0 });
      } else {
        setTooltipContent(null);
      }
    },
    [setTooltipContent, setTooltipPosition]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && currentUser) {
        handleFileUpload(file, currentUser.principal || '');
      }
    },
    [currentUser, handleFileUpload]
  );

  const renderActionButton = useCallback(
    (
      label: string,
      onClick: () => void,
      disabled: boolean,
      primary: boolean = false
    ): JSX.Element => (
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

  const handleLoadModel = useCallback(() => {
    if (selectedModel && !loadedModels.has(selectedModel)) {
      loadModel();
      debugLog(`Client: Initiated load request for model ID "${selectedModel}"`);
    }
  }, [selectedModel, loadedModels, loadModel]);

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
            isRunning={
              isLoading &&
              typeof currentLoadingMessage === 'string' &&
              currentLoadingMessage.startsWith('Loading')
            }
            renderActionButton={renderActionButton}
            loadModel={handleLoadModel}
            setStatus={setStatus}
            setStatusMessage={setStatusMessage}
            log={debugLog}
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
            worker={workerRef}
            setMessages={setMessages}
          />
        );
      case 'Cycle Management':
        return <Screens.CycleManagement currentUser={currentUser} />;
      case 'Settings':
        return <Screens.Settings currentUser={currentUser} onLogout={() => setCurrentUser(null)} />;
      case 'Image Storage':
      case 'Document Storage':
      case 'Public Data':
        return (
          <Components.DragAndDropContainer onDrop={handleDrop}>
            {activeSection === 'Image Storage' && (
              <>
                <Components.UploadButton
                  onUpload={(file) => handleFileUpload(file, currentUser?.principal || '')}
                  disabled={globalLoading}
                />
                <Screens.ImageStore
                  assets={assets}
                  onAssetHover={setHoveredAsset}
                  onDelete={(asset) => setConfirmDelete(asset)}
                />
              </>
            )}
            {activeSection === 'Document Storage' && (
              <>
                <Components.UploadButton
                  onUpload={(file) => handleFileUpload(file, currentUser?.principal || '')}
                  disabled={globalLoading}
                />
                <Screens.DocumentStore
                  assets={assets}
                  onAssetHover={setHoveredAsset}
                  onDelete={(asset) => setConfirmDelete(asset)}
                />
              </>
            )}
            {activeSection === 'Public Data' && (
              <>
                <Components.UploadButton
                  onUpload={(file) => handleFileUpload(file, currentUser?.principal || '')}
                  disabled={globalLoading}
                />
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

  // **Determine Which Overlay to Show to Prevent Overlapping**
  const shouldShowModelLoading = isLoading;
  const shouldShowGlobalLoading = globalLoading && !isLoading;

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
                <div
                  className="tooltip"
                  style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
                >
                  <p>{tooltipContent}</p>
                </div>
              )}
            </section>
          </main>

          {/* **Loading Overlays** */}
          {/* Model Loading Overlay */}
          {shouldShowModelLoading && <Components.LoadingOverlay message={currentLoadingMessage} />}

          {/* Global Loading Overlay */}
          {shouldShowGlobalLoading && <Components.LoadingOverlay message={loadingMessage} />}

          {/* Error Notification */}
          {error && <Components.ErrorNotification message={error} onClose={() => setError(null)} />}

          {/* Delete Confirmation Modal */}
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
        </>
      )}
    </div>
  );
}

