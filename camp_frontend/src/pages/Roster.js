import React from 'react';

// PUBLIC_INTERFACE
/**
 * Roster page component for displaying and managing camp members.
 * Shows member directory with crew assignments, status, and buddy info.
 */
const Roster = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Member Roster</h2>
        <p className="page-description">
          View and manage camp members, crew assignments, and contact information.
        </p>
      </div>
      
      <div className="page-content">
        <div className="feature-card">
          <h3>Coming Soon</h3>
          <p>Member directory with filtering and search capabilities.</p>
          <ul>
            <li>View all camp members</li>
            <li>Filter by crew assignment</li>
            <li>Check dues payment status</li>
            <li>View buddy assignments</li>
            <li>Contact information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Roster;
