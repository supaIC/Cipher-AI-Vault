// // React
// import React, { useState, useEffect, useRef, useCallback } from 'react';

// // Hooks
// import * as data from '../../hooks/dataManager/dataManager';
// import useWorker from '../../hooks/modelManager/useWorker';
// import useChat from '../../hooks/modelManager/useChat';
// import useModelLoader from '../../hooks/modelManager/useModelLoader';
// import useDatabase from '../../hooks/dataManager/useDatabase';

// // Screens
// import ChatInterface from '../ChatInterface/ChatInterface';
// import ModelManagement from '../ModelManagement/ModelManagement';
// import DataManagement from '../DataManagement/DataManagement';
// import Dashboard from '../Dashboard/Dashboard';
// import Settings from '../Settings/Settings';

// // Components
// import Sidebar from '../../components/sidebar/Sidebar';
// import StatusOverlay from '../../components/overlays/StatusOverlay/StatusOverlay';
// import Header from '../../components/header/Header';

// // Styles
// import useDarkMode from '../../hooks/useDarkMode/useDarkMode';

// interface SearchResult {
//   input: string;
//   similarity: number;
//   object: {
//     name: string;
//     description: string;
//   };
// }

// interface Asset {
//   key: string;
//   url: string;
// }

// interface DatabaseAdminProps {
//   assets: Array<Asset>;
//   privateData: data.FullDataQuery | null;
//   currentUser: any;
//   onLogout: () => void;
// }

// const DatabaseAdmin: React.FC<DatabaseAdminProps> = ({ assets, privateData, currentUser, onLogout }) => {
//   // State variables
//   const [statusMessage, setStatusMessage] = useState<string>('');
//   const [status, setStatus] = useState<string | null>(null);
//   const [loadingMessage, setLoadingMessage] = useState<string>('');
//   const [progressItems, setProgressItems] = useState<any[]>([]);
//   const [isRunning, setIsRunning] = useState<boolean>(false);
//   const [selectedModel, setSelectedModel] = useState<string>('');
//   const [loadedModels, setLoadedModels] = useState<Set<string>>(new Set());
//   const [activeSection, setActiveSection] = useState<string>('Dashboard');
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [recentSearches, setRecentSearches] = useState<string[]>([]);
//   const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
//   const [tooltipContent, setTooltipContent] = useState<string | null>(null);
//   const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
//   const [showUserFiles, setShowUserFiles] = useState<boolean>(false);

//   const isMounted = useRef<boolean>(true);

//   const log = useCallback((message: string) => {
//     console.log(`[Client Log ${new Date().toISOString()}] ${message}`);
//   }, []);

//   const publicJsonAssets = assets.filter((asset) => asset.key.includes('/data-store/'));
//   const privateJsonAssets = privateData
//     ? privateData.flatMap((userDataMap) => (Array.isArray(userDataMap) ? userDataMap[1].allFiles : []))
//     : [];

//   const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

//   const handleTooltip = useCallback((content: string | null, event?: React.MouseEvent) => {
//     if (content) {
//       setTooltipContent(content);
//       if (event) {
//         setTooltipPosition({ x: event.clientX, y: event.clientY });
//       }
//     } else {
//       setTooltipContent(null);
//     }
//   }, []);

//   const addRecentSearch = useCallback((query: string) => {
//     setRecentSearches((prev) => [query, ...prev.filter((item) => item !== query)].slice(0, 5));
//   }, []);

//   // Toggle showUserFiles state
//   const onToggleUserFiles = () => setShowUserFiles((prev) => !prev);

//   // Use the useDarkMode hook
//   const { isDarkMode, toggleDarkMode } = useDarkMode();

//   // Use the useDatabase hook
//   const {
//     index,
//     searchResult,
//     selectedFile,
//     setSelectedFile,
//     selectedFileType,
//     setSelectedFileType,
//     initializeDB,
//     handleSearch,
//     clearDatabase,
//   } = useDatabase({
//     isRunning,
//     setIsRunning,
//     log,
//     addRecentSearch,
//     setStatusMessage,
//     publicJsonAssets,
//     privateJsonAssets,
//     isMounted,
//   });

//   // Use the useWorker hook
//   const worker = useWorker({
//     selectedModel,
//     log,
//   });

//   // Use the useModelLoader hook
//   useModelLoader({
//     worker,
//     selectedModel,
//     setStatus,
//     setStatusMessage,
//     setLoadedModels,
//     setProgressItems,
//     setLoadingMessage,
//     isMounted,
//     log,
//   });

//   // Use the useChat hook
//   const {
//     messages,
//     setMessages,
//     input,
//     setInput,
//     tps,
//     numTokens,
//     onEnter,
//     onInterrupt,
//   } = useChat({
//     isRunning,
//     setIsRunning,
//     selectedModel,
//     worker,
//     log,
//     handleSearch,
//     isMounted,
//     setStatus,
//     setStatusMessage,
//   });

//   useEffect(() => {
//     isMounted.current = true;

//     // Load recent searches
//     const savedSearches = localStorage.getItem('recentSearches');
//     if (savedSearches) {
//       setRecentSearches(JSON.parse(savedSearches));
//     }

//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//   useEffect(() => {
//     localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
//   }, [recentSearches]);

//   // Memoize renderActionButton to prevent unnecessary re-creations
//   const renderActionButton = useCallback(
//     (
//       label: string,
//       onClick: () => void,
//       disabled: boolean,
//       primary: boolean = false
//     ): JSX.Element => (
//       <button
//         onClick={onClick}
//         disabled={disabled}
//         className={`button ${primary ? 'button-primary' : 'button-secondary'} ${disabled ? 'button-disabled' : ''
//           }`}
//         aria-label={label}
//       >
//         {label}
//       </button>
//     ),
//     []
//   );

//   // Memoize renderCard to prevent unnecessary re-creations
//   const renderCard = useCallback(
//     (title: string, content: React.ReactNode): JSX.Element => (
//       <div className="card" key={title}>
//         <h3 className="card-title">{title}</h3>
//         <div className="card-content">{content}</div>
//       </div>
//     ),
//     []
//   );

//   // Memoize renderDashboard
//   const renderDashboard = useCallback(() => (
//     <Dashboard
//       loadedModels={loadedModels}
//       index={index}
//       renderCard={renderCard}
//       renderActionButton={renderActionButton}
//       setActiveSection={(section) => setActiveSection(section)}
//       recentSearches={recentSearches}
//       handleSearch={handleSearch}
//       setSearchQuery={setSearchQuery}
//     />
//   ), [loadedModels, index, renderCard, renderActionButton, recentSearches, handleSearch]);

//   // Memoize renderModelManagement
//   const renderModelManagement = useCallback(() => (
//     <ModelManagement
//       selectedModel={selectedModel}
//       setSelectedModel={setSelectedModel}
//       loadedModels={loadedModels}
//       isRunning={isRunning}
//       renderActionButton={renderActionButton}
//       worker={worker}
//       setStatus={setStatus}
//       setStatusMessage={setStatusMessage}
//       log={log}
//     />
//   ), [selectedModel, loadedModels, isRunning, renderActionButton, worker, setStatus, setStatusMessage, log]);

//   // Memoize renderDataManagement
//   const renderDataManagement = useCallback(() => (
//     <DataManagement
//       isRunning={isRunning}
//       selectedFileType={selectedFileType}
//       setSelectedFileType={setSelectedFileType}
//       selectedFile={selectedFile}
//       setSelectedFile={setSelectedFile}
//       publicJsonAssets={publicJsonAssets}
//       privateJsonAssets={privateJsonAssets}
//       renderActionButton={renderActionButton}
//       initializeDB={initializeDB}
//       status={status}
//       clearDatabase={clearDatabase}
//       searchQuery={searchQuery}
//       setSearchQuery={setSearchQuery}
//       performSearch={() => handleSearch(searchQuery)}
//       index={index}
//       recentSearches={recentSearches}
//       handleSearch={handleSearch}
//       searchResult={searchResult}
//       statusMessage={statusMessage}
//     />
//   ), [
//     isRunning,
//     selectedFileType,
//     setSelectedFileType,
//     selectedFile,
//     setSelectedFile,
//     publicJsonAssets,
//     privateJsonAssets,
//     renderActionButton,
//     initializeDB,
//     status,
//     clearDatabase,
//     searchQuery,
//     setSearchQuery,
//     handleSearch,
//     index,
//     recentSearches,
//     searchResult,
//     statusMessage,
//   ]);

//   // Memoize renderChatInterface
//   const renderChatInterface = useCallback(() => (
//     <ChatInterface
//       messages={messages}
//       isRunning={isRunning}
//       status={status}
//       tps={tps}
//       numTokens={numTokens}
//       input={input}
//       setInput={setInput}
//       onEnter={onEnter}
//       onInterrupt={onInterrupt}
//       worker={worker}
//       setMessages={setMessages}
//     />
//   ), [messages, isRunning, status, tps, numTokens, input, setInput, onEnter, onInterrupt, worker, setMessages]);

//   // Memoize renderSettings with the newly added props
//   const renderSettings = useCallback(() => (
//     <Settings
//       currentUser={currentUser}
//       onLogout={onLogout}
//       showUserFiles={showUserFiles}
//       onToggleUserFiles={onToggleUserFiles}
//     />
//   ), [isDarkMode, toggleDarkMode, currentUser, onLogout, showUserFiles, onToggleUserFiles]);

//   return (
//     <div className={`admin-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
//       <Header
//         isMenuOpen={isMenuOpen}
//         toggleMenu={toggleMenu}
//         isDarkMode={isDarkMode}
//         toggleDarkMode={toggleDarkMode}
//         currentUser={currentUser.principal} // Assuming currentUser object has a principal property
//       />
  
//       <main className="main-content">
//         <Sidebar
//           activeSection={activeSection}
//           setActiveSection={setActiveSection}
//           isMenuOpen={isMenuOpen}
//           toggleMenu={toggleMenu}
//         />
  
//         <section className="content-area">
//           <h2 className="section-title">{activeSection}</h2>
//           {activeSection === 'Dashboard' && renderDashboard()}
//           {activeSection === 'Models' && renderModelManagement()}
//           {activeSection === 'Data Management' && renderDataManagement()}
//           {activeSection === 'Chat' && renderChatInterface()}
//           {activeSection === 'Settings' && renderSettings()}
//         </section>
//       </main>
  
//       <StatusOverlay status={status} loadingMessage={loadingMessage} />
//     </div>
//   );  
// };

// export default DatabaseAdmin;