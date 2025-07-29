import React from 'react';
import ArrivalCalendar from '../components/ArrivalCalendar/ArrivalCalendar';

// PUBLIC_INTERFACE
/**
 * Calendar page component for viewing and managing camp events and activities.
 * Integrates with arrival/departure dates and job scheduling.
 */
const Calendar = () => {
  return (
    <div className="page-container">
      <ArrivalCalendar />
    </div>
  );
};

export default Calendar;
