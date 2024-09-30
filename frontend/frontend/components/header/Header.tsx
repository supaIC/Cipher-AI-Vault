import React, { useEffect } from 'react';
import logo from '../../assets/images/logo.png';
import { FiMenu, FiX, FiSun, FiMoon, FiUser } from 'react-icons/fi';
import './Header.css';

interface HeaderProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: string;
}

const Header: React.FC<HeaderProps> = ({
  isMenuOpen,
  toggleMenu,
  isDarkMode,
  toggleDarkMode,
  currentUser,
}) => {
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </button>
        <div className="logo">
          <img src={logo} alt="App Logo" />
          <h1>AI Vault Admin</h1>
        </div>
      </div>
      <div className="header-right">
        <div className="logged-in-user">
          <FiUser className="user-icon" />
          <span className="user-principal">{currentUser}</span>
        </div>
        <button onClick={toggleDarkMode} className="dark-mode-toggle" aria-label="Toggle dark mode">
          {isDarkMode ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </header>
  );
};

export default Header;