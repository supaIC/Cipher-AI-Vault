import React, { useState, useEffect } from 'react';
import CyclesTopUpComponent from '../buttons/cycles/CyclesTopUpButton'; // Import your component
import GetBalancesComponent from '../buttons/cycles/GetBalancesButton'; // Import your component
import './SettingsDropdown.css';

interface SettingsDropdownProps {
  isVisible: boolean;
  currentUser: any;
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
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    // Check for previously saved mode from localStorage
    const savedMode = localStorage.getItem('lightMode') === 'true';
    setLightMode(savedMode);
    document.body.classList.toggle('light-mode', savedMode);
  }, []);

  const handleToggleLightMode = () => {
    setLightMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('lightMode', newMode.toString());
      document.body.classList.toggle('light-mode', newMode);
      return newMode;
    });
  };

  if (!isVisible) return null;

  return (
    <div className={`settings-dropdown ${isVisible ? 'active' : ''}`}>
      <button onClick={onLogout}>Logout</button>

      <button onClick={handleToggleLightMode}>
        {lightMode ? 'Dark Mode' : 'Light Mode'}
      </button>

      <GetBalancesComponent agent={currentUser.agent} /> {/* Use the GetBalancesComponent */}
      <CyclesTopUpComponent currentUser={currentUser} /> {/* Use the CyclesTopUpComponent */}

      <button onClick={onToggleUserFiles}>
        {showUserFiles ? 'Show All Files' : 'Show My Files'}
      </button>
    </div>
  );
};

export default SettingsDropdown;
