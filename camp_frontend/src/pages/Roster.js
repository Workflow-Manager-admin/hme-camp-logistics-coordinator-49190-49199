import React from 'react';
import MemberDirectory from '../components/MemberDirectory/MemberDirectory';

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
        <MemberDirectory />
      </div>
    </div>
  );
};

export default Roster;
