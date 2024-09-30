// src/screens/DatabaseAdmin/tabs/Dashboard/Dashboard.tsx

import React, { useCallback } from 'react';
import { FiBox, FiDatabase, FiSettings, FiMessageCircle, FiSearch } from 'react-icons/fi'; // Importing relevant icons
import './Dashboard.css'; // Optional: If you have component-specific styles

interface DashboardProps {
  loadedModels: Set<string>;
  index: any;
  renderCard: (title: string, content: React.ReactNode) => JSX.Element;
  renderActionButton: (
    label: string,
    onClick: () => void,
    disabled: boolean,
    primary?: boolean
  ) => JSX.Element;
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
  recentSearches: string[];
  handleSearch: (searchQuery: string) => Promise<any>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const Dashboard: React.FC<DashboardProps> = ({
  loadedModels,
  index,
  renderCard,
  renderActionButton,
  setActiveSection,
  recentSearches,
  handleSearch,
  setSearchQuery,
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
    <div className="dashboard-grid">
      {/* Model Status Card */}
      {renderCard(
        'Model Status',
        <div className="status-content">
          <FiBox className="status-icon" />
          <div>
            <p className="status-text">
              {loadedModels.size > 0
                ? `Loaded Model: ${Array.from(loadedModels)[0]}`
                : 'No model loaded'}
            </p>
            {loadedModels.size > 0 && (
              <span className="status-badge success">Active</span>
            )}
          </div>
        </div>
      )}

      {/* Database Status Card */}
      {renderCard(
        'Database Status',
        <div className="status-content">
          <FiDatabase className="status-icon" />
          <div>
            <p className="status-text">
              {index ? 'Database Initialized' : 'Database Not Initialized'}
            </p>
            {index ? (
              <span className="status-badge success">Online</span>
            ) : (
              <span className="status-badge warning">Offline</span>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions Card */}
      {renderCard(
        'Quick Actions',
        <div className="quick-actions">
          <div className="action-button-wrapper">
            {renderActionButton(
              'Load Model',
              () => setActiveSection('Models'),
              false,
              true
            )}
            <span className="action-tooltip">Load and manage your models</span>
          </div>
          <div className="action-button-wrapper">
            {renderActionButton(
              'Manage Data',
              () => setActiveSection('Data Management'),
              false,
              true
            )}
            <span className="action-tooltip">Add, update, or remove data</span>
          </div>
          {renderActionButton('Start Chat', () => setActiveSection('Chat'), false, true)}
        </div>
      )}

      {/* Recent Searches Card */}
      {renderCard(
        'Recent Searches',
        <div className="recent-searches-container">
          {recentSearches.length > 0 ? (
            recentSearches.map((search) => (
              <button
                key={search} // Ensuring unique and stable keys
                onClick={() => handleRecentSearchClick(search)}
                className="search-chip"
                aria-label={`Search: ${search}`}
              >
                <FiSearch className="search-chip-icon" />
                {search}
              </button>
            ))
          ) : (
            <p className="no-searches">No recent searches available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;