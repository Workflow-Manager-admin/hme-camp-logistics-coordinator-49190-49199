import React from 'react';
import { NavLink } from 'react-router-dom';
import './SidebarNav.css';

// PUBLIC_INTERFACE
/**
 * Sidebar navigation component for the camp logistics app.
 * Provides navigation links to all major app sections.
 */
const SidebarNav = ({ isOpen, onToggle }) => {
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/roster', label: 'Roster', icon: '👥' },
    { path: '/jobs', label: 'Jobs', icon: '🔨' },
    { path: '/meals', label: 'Meals', icon: '🍽️' },
    { path: '/calendar', label: 'Calendar', icon: '📅' },
    { path: '/accommodations', label: 'Accommodations', icon: '🏕️' },
    { path: '/payments', label: 'Payments', icon: '💰' }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onToggle} />}
      
      <nav className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">HME Camp</h2>
          <button 
            className="sidebar-close-btn"
            onClick={onToggle}
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>
        
        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.path} className="sidebar-nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `sidebar-nav-link ${isActive ? 'active' : ''}`
                }
                onClick={() => window.innerWidth <= 768 && onToggle()}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default SidebarNav;
