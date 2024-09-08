import React from 'react';

interface SettingsDropdownProps {
  isVisible: boolean;
  onCyclesTopUp: () => void;
  onLogout: () => void;
  onGetBalances: () => void;
  showUserFiles: boolean;
  onToggleUserFiles: () => void;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  isVisible,
  onCyclesTopUp,
  onLogout,
  onGetBalances,
  showUserFiles,
  onToggleUserFiles,
}) => {
  if (!isVisible) return null;

  return (
    <div className={`settings-dropdown ${isVisible ? 'active' : ''}`}>
      <button onClick={onLogout}>Logout</button>
      <button onClick={onGetBalances}>Get Balances</button>
      <button onClick={onCyclesTopUp}>Donate Cycles</button>
      <button onClick={onToggleUserFiles}>
        {showUserFiles ? 'Show All Files' : 'Show My Files'}
      </button>
    </div>
  );
};

export default SettingsDropdown;