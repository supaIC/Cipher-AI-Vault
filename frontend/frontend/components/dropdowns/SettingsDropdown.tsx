import React from 'react';
import CyclesTopUpComponent from '../cycles/CyclesTopUpButton'; // Import your component
import GetBalancesComponent from '../cycles/GetBalancesButton'; // Import your component
import './SettingsDropdown.css';

interface SettingsDropdownProps {
  isVisible: boolean;
  currentUser: any; // Add currentUser prop
  onLogout: () => void;
  showUserFiles: boolean;
  onToggleUserFiles: () => void;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  isVisible,
  currentUser,
  onLogout,
  showUserFiles,
  onToggleUserFiles,
}) => {
  if (!isVisible) return null;

  return (
    <div className={`settings-dropdown ${isVisible ? 'active' : ''}`}>
      <button onClick={onLogout}>Logout</button>

      <GetBalancesComponent agent={currentUser.agent} />  {/* Use the GetBalancesComponent */}
      <CyclesTopUpComponent currentUser={currentUser} />   {/* Use the CyclesTopUpComponent */}

      <button onClick={onToggleUserFiles}>
        {showUserFiles ? 'Show All Files' : 'Show My Files'}
      </button>
    </div>
  );
};

export default SettingsDropdown;