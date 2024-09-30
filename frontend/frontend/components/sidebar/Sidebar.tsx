import React, { useState, useEffect } from "react";
import { FiHome, FiBox, FiDatabase, FiMessageSquare, FiSettings, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Sidebar.css';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, isMenuOpen, toggleMenu }) => {
  const [isHovered, setIsHovered] = useState(false);

  const sidebarItems = [
    { label: "Dashboard", Icon: FiHome },
    { label: "Models", Icon: FiBox },
    { label: "Data Management", Icon: FiDatabase },
    { label: "Chat", Icon: FiMessageSquare },
    { label: "Settings", Icon: FiSettings },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && isMenuOpen) {
        toggleMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [toggleMenu, isMenuOpen]);

  return (
    <>
      <div 
        className={`sidebar ${isMenuOpen ? 'expanded' : 'collapsed'} ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Sidebar Navigation"
      >
        <button
          onClick={toggleMenu}
          className="toggle-button"
          aria-label={isMenuOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <FiChevronLeft className="sidebar-icon" /> : <FiChevronRight className="sidebar-icon" />}
        </button>
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {sidebarItems.map(({ label, Icon }) => (
              <li key={label}>
                <button
                  onClick={() => setActiveSection(label)}
                  className={`sidebar-item ${activeSection === label ? 'active' : ''}`}
                  aria-label={`Go to ${label}`}
                  aria-current={activeSection === label ? 'page' : undefined}
                  data-tooltip={label}
                >
                  <Icon className="sidebar-icon" />
                  <span className="sidebar-label">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {isMenuOpen && <div className="sidebar-overlay" onClick={toggleMenu}></div>}
    </>
  );
};

export default Sidebar;