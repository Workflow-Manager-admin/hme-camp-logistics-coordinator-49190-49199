import React from 'react';
import AccommodationsMap from '../components/AccommodationsMap/AccommodationsMap';

// PUBLIC_INTERFACE
/**
 * Accommodations page component for managing campsite layout and assignments.
 * Handles tent/RV assignments and campsite organization.
 */
const Accommodations = () => {
  return (
    <div className="page-container">
      <AccommodationsMap />
    </div>
  );
};

export default Accommodations;
