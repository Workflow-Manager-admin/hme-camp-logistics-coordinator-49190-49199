import React from 'react';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
/**
 * Home dashboard component that provides an overview of camp logistics
 * and quick access to main features.
 */
const Home = () => {
  const quickActions = [
    { path: '/roster', label: 'View Roster', icon: '👥', description: 'Check member directory and crew assignments' },
    { path: '/jobs', label: 'Job Board', icon: '🔨', description: 'Sign up for camp jobs and volunteer work' },
    { path: '/meals', label: 'Meal Planner', icon: '🍽️', description: 'Plan communal meals and cooking duties' },
    { path: '/calendar', label: 'Calendar', icon: '📅', description: 'View camp events and activities' },
    { path: '/accommodations', label: 'Accommodations', icon: '🏕️', description: 'Manage campsite and sleeping arrangements' },
    { path: '/payments', label: 'Payments', icon: '💰', description: 'Track dues and make payments' }
  ];

  return (
    <div className="page-container">
      <div className="page-header text-center">
        <h2 className="page-title">Welcome to HME Camp Logistics</h2>
        <p className="page-description">
          Your central hub for managing all aspects of camp coordination at Burning Man.
          Navigate through the sections below to get started.
        </p>
      </div>
      
      <div className="page-content">
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <Link 
              key={action.path} 
              to={action.path} 
              className="quick-action-card"
            >
              <div className="quick-action-icon">{action.icon}</div>
              <h3 className="quick-action-title">{action.label}</h3>
              <p className="quick-action-description">{action.description}</p>
            </Link>
          ))}
        </div>
        
        <div className="welcome-info">
          <div className="feature-card">
            <h3>🔥 Camp Information</h3>
            <p>
              High Maintenance Entertainment (HME) is a vibrant community of approximately 85 members 
              who come together each year at Burning Man. This app helps coordinate all our logistics 
              from arrival to departure.
            </p>
            <ul>
              <li><strong>Theme:</strong> Bold, minimalistic design inspired by the Burning Man aesthetic</li>
              <li><strong>Features:</strong> Member management, job coordination, meal planning, and more</li>
              <li><strong>Community:</strong> Built by campers, for campers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
