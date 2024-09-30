import React from 'react';
import CyclesTopUpComponent from '../../components/buttons/cycles/CyclesTopUpButton';
import GetBalancesComponent from '../../components/buttons/cycles/GetBalancesButton';
import './Settings.css';

interface SettingsProps {
  currentUser: any;
  onLogout: () => void;
  showUserFiles: boolean;
  onToggleUserFiles: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  currentUser,
  onLogout,
  showUserFiles,
  onToggleUserFiles,
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

      <div className="settings-section">
        <h3 className="settings-section-title">Cycle Management</h3>
        <div className="settings-cycle-controls">
          <GetBalancesComponent agent={currentUser.agent} />
          <CyclesTopUpComponent currentUser={currentUser} />
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">File Management</h3>
        <div className="settings-toggle-group">
          <span className="settings-toggle-label">Show only my files</span>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={showUserFiles}
              onChange={onToggleUserFiles}
              className="settings-toggle-input"
            />
            <span className="settings-toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;
