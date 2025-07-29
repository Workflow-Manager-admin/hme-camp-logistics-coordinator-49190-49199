import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNav from './SidebarNav';
import ThemeToggle from './ThemeToggle';
import './DashboardLayout.css';

// PUBLIC_INTERFACE
/**
 * Main dashboard layout component that provides the overall structure
 * with sidebar navigation and main content area.
 */
const DashboardLayout = ({ theme, onThemeToggle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // PUBLIC_INTERFACE
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <SidebarNav isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className="dashboard-main">
        <header className="dashboard-header">
          <button
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <h1 className="dashboard-title">HME Camp Logistics</h1>
          <div className="dashboard-header-actions">
            <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          </div>
        </header>
        
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
