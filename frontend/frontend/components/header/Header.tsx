import React from 'react';
import logo from '../../assets/images/logo.png';
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';

interface HeaderProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isMenuOpen,
  toggleMenu,
  isDarkMode,
  toggleDarkMode,
}) => {
  return (
    <header className="header">
      <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
        {isMenuOpen ? <FiX /> : <FiMenu />}
      </button>
      <div className="logo">
        <img src={logo} alt="App Logo" />
        <h1>AI Vault Admin</h1>
      </div>
      <nav className="navigation">
        <button onClick={toggleDarkMode} className="dark-mode-toggle" aria-label="Toggle dark mode">
          {isDarkMode ? <FiSun /> : <FiMoon />}
        </button>
      </nav>
    </header>
  );
};

export default Header;
