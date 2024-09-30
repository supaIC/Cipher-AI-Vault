import React, { useState, useEffect } from "react";
import {
  FiHome, FiBox, FiDatabase, FiMessageSquare, FiSettings, FiChevronLeft,
  FiChevronRight, FiImage, FiFileText, FiGlobe, FiHardDrive,
  FiCoffee
} from 'react-icons/fi';
import './Sidebar.css';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, isMenuOpen, toggleMenu }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Sidebar items with groups separated by `null`
  const sidebarItems = [
    { label: "Dashboard", Icon: FiHome },
    null,
    { label: "Playground", Icon: FiMessageSquare },
    { label: "Model Manager", Icon: FiBox },
    null,
    { label: "Image Storage", Icon: FiImage },
    { label: "Document Storage", Icon: FiFileText },
    null,
    { label: "Public Data", Icon: FiGlobe },
    { label: "Stable Memory", Icon: FiHardDrive },
    { label: "Data Management", Icon: FiDatabase },
    null,
    { label: "Cycle Management", Icon: FiCoffee },
    null,
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
            {sidebarItems.map((item, index) => (
              item ? (
                <li key={index}>
                  <button
                    onClick={() => setActiveSection(item.label)}
                    className={`sidebar-item ${activeSection === item.label ? 'active' : ''}`}
                    aria-label={`Go to ${item.label}`}
                    aria-current={activeSection === item.label ? 'page' : undefined}
                    data-tooltip={item.label}
                  >
                    <item.Icon className="sidebar-icon" />
                    <span className="sidebar-label">{item.label}</span>
                  </button>
                </li>
              ) : (
                <li key={index} className="sidebar-separator" />
              )
            ))}
          </ul>
        </nav>
      </div>

      {isMenuOpen && <div className="sidebar-overlay" onClick={toggleMenu}></div>}
    </>
  );
};

export default Sidebar;
