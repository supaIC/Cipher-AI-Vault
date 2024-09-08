import React from 'react';

type ViewMode = 'images' | 'json' | 'documents' | 'admin';

interface ViewToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="view-toggle-container">
      <button
        className={`view-toggle-button ${viewMode === 'images' ? 'active' : ''}`}
        onClick={() => setViewMode('images')}
      >
        Image Store
      </button>
      <button
        className={`view-toggle-button ${viewMode === 'documents' ? 'active' : ''}`}
        onClick={() => setViewMode('documents')}
      >
        Document Store
      </button>
      <button
        className={`view-toggle-button ${viewMode === 'json' ? 'active' : ''}`}
        onClick={() => setViewMode('json')}
      >
        Data Store
      </button>
      <button
        className={`view-toggle-button ${viewMode === 'admin' ? 'active' : ''}`}
        onClick={() => setViewMode('admin')}
      >
        Database Admin
      </button>
    </div>
  );
};

export default ViewToggle;