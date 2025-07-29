import React from 'react';

// PUBLIC_INTERFACE
/**
 * Payments page component for managing camp dues and financial tracking.
 * Integrates with Venmo for payment processing.
 */
const Payments = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Payments & Dues</h2>
        <p className="page-description">
          Track camp dues, make payments, and view financial status.
        </p>
      </div>
      
      <div className="page-content">
        <div className="feature-card">
          <h3>Coming Soon</h3>
          <p>Payment tracking and dues management system.</p>
          <ul>
            <li>View dues status</li>
            <li>Make payments via Venmo</li>
            <li>Track payment history</li>
            <li>Payment reminders</li>
            <li>Financial reporting</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Payments;
