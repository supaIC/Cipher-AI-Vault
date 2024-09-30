import React, { useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';

interface SearchResult {
  input: string;
  similarity: number;
  object: {
    name: string;
    description: string;
  };
}

interface Asset {
  key: string;
  url: string;
}

interface DataManagementProps {
  isRunning: boolean;
  selectedFileType: 'public' | 'private';
  setSelectedFileType: React.Dispatch<React.SetStateAction<'public' | 'private'>>;
  selectedFile: string;
  setSelectedFile: React.Dispatch<React.SetStateAction<string>>;
  publicJsonAssets: Asset[];
  privateJsonAssets: any[];
  renderActionButton: (
    label: string,
    onClick: () => void,
    disabled: boolean,
    primary?: boolean
  ) => JSX.Element;
  initializeDB: () => Promise<void>;
  status: string | null;
  clearDatabase: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  performSearch: () => void;
  index: any;
  recentSearches: string[];
  handleSearch: (searchQuery: string) => Promise<SearchResult[]>;
  searchResult: SearchResult[];
  statusMessage: string;
}

const DataManagement: React.FC<DataManagementProps> = ({
  isRunning,
  selectedFileType,
  setSelectedFileType,
  selectedFile,
  setSelectedFile,
  publicJsonAssets,
  privateJsonAssets,
  renderActionButton,
  initializeDB,
  status,
  clearDatabase,
  searchQuery,
  setSearchQuery,
  performSearch,
  index,
  recentSearches,
  handleSearch,
  searchResult,
  statusMessage,
}) => {
  // Memoize the handler to prevent unnecessary re-renders
  const handleRecentSearchClick = useCallback(
    (search: string) => {
      setSearchQuery(search);
      handleSearch(search);
    },
    [setSearchQuery, handleSearch]
  );

  return (
    <>
      {/* Database Initialization Card */}
      <div className="card">
        <h3 className="card-title">Vector Database Management</h3>
        <div className="card-content">
          <div className="form-group">
            <label htmlFor="fileTypeSelect">File Type:</label>
            <select
              id="fileTypeSelect"
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value as 'public' | 'private')}
              disabled={isRunning}
              className="select-input"
              aria-label="Select File Type"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fileSelect">Data File:</label>
            <select
              id="fileSelect"
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              disabled={isRunning}
              className="select-input"
              aria-label="Select Data File"
            >
              <option value="">--Select a file--</option>
              {(selectedFileType === 'public' ? publicJsonAssets : privateJsonAssets).map((asset) => (
                <option
                  key={selectedFileType === 'public' ? asset.key : asset.fileName}
                  value={selectedFileType === 'public' ? asset.key.split('/').pop() : asset.fileName}
                >
                  {selectedFileType === 'public' ? asset.key.split('/').pop() : asset.fileName}
                </option>
              ))}
            </select>
          </div>
          <div className="button-group">
            {renderActionButton('Initialize Database', initializeDB, isRunning || !selectedFile, true)}
            {renderActionButton('Clear Database', clearDatabase, isRunning)}
          </div>
        </div>
      </div>

      {/* Search Database Card */}
      <div className="card">
        <h3 className="card-title">Search Database</h3>
        <div className="card-content">
          <div className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              placeholder="Search database..."
              aria-label="Search Database"
            />
            <button
              className="search-button"
              onClick={performSearch}
              disabled={isRunning || !index || !searchQuery}
              aria-label="Execute Search"
            >
              <FiSearch />
            </button>
          </div>
          <div className="recent-searches">
            <h4>Recent Searches:</h4>
            {recentSearches.map((search) => (
              <button
                key={search} // Changed from key={index} to key={search}
                onClick={() => handleRecentSearchClick(search)}
                className="recent-search-button"
                aria-label={`Search: ${search}`}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results Card */}
      <div className="card">
        <h3 className="card-title">Search Results</h3>
        <div className="card-content">
          <div className="search-results" aria-live="polite" aria-atomic="true">
            {searchResult.length > 0 ? (
              searchResult.map((result, index) => (
                <div key={index} className="result-item" tabIndex={0}>
                  <h4>{result.object.name}</h4>
                  <p>{result.object.description}</p>
                  <span className="result-similarity">
                    Similarity: {typeof result.similarity === 'number' ? result.similarity.toFixed(4) : 'N/A'}
                  </span>
                </div>
              ))
            ) : (
              <p>No results found</p>
            )}
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="card">
        <h3 className="card-title">Status</h3>
        <div className="card-content">
          <p className="status-message">{statusMessage || 'No actions performed yet.'}</p>
        </div>
      </div>
    </>
  );
};

export default DataManagement;