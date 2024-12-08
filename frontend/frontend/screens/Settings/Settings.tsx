import React from 'react';
import './Settings.css';

interface SettingsProps {
  currentUser: any;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  currentUser,
  onLogout,
}) => {
  return (
    <div className="settings-card">
      <h2 className="settings-card-title">Settings</h2>
      <p className="settings-card-description">
        Configure application settings here. Adjust preferences, manage your account, and customize the interface.
      </p>

      <div className="settings-section">
        <h3 className="settings-section-title">Account Management</h3>
        <button className="settings-button settings-button-danger" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;