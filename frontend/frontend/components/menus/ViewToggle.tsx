import React from 'react';
import './ViewToggle.css';

type ViewMode = 'images' | 'json' | 'documents' | 'admin' | 'public';

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
        className={`view-toggle-button ${viewMode === 'public' ? 'active' : ''}`}
        onClick={() => setViewMode('public')}
      >
        Public Data
      </button>
      <button
        className={`view-toggle-button ${viewMode === 'json' ? 'active' : ''}`}
        onClick={() => setViewMode('json')}
      >
        Stable Memory
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
