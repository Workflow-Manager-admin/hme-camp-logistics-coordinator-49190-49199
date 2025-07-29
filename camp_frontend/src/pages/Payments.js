import React from 'react';
import PaymentPanel from '../components/PaymentPanel/PaymentPanel';

// PUBLIC_INTERFACE
/**
 * Payments page component for managing camp dues and financial tracking.
 * Integrates with Venmo for payment processing.
 */
const Payments = () => {
  return (
    <div className="page-container">
      <PaymentPanel />
    </div>
  );
};

export default Payments;
