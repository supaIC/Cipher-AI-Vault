import React from 'react';

interface SettingsProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <div className="card">
      <h3 className="card-title">Settings</h3>
      <div className="card-content">
        <p>
          Configure application settings here. Adjust preferences, manage user accounts, and customize the interface.
        </p>
        <div className="form-group">
          <label htmlFor="darkModeToggle">Dark Mode:</label>
          <input
            id="darkModeToggle"
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;