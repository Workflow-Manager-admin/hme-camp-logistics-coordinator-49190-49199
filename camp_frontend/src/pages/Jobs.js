import React from 'react';
import JobBoard from '../components/JobBoard/JobBoard';

// PUBLIC_INTERFACE
/**
 * Jobs page component for managing job assignments and volunteer signups.
 * Handles setup, strike, and ongoing camp job coordination.
 */
const Jobs = () => {
  return (
    <div className="page-container">
      <JobBoard />
    </div>
  );
};

export default Jobs;
