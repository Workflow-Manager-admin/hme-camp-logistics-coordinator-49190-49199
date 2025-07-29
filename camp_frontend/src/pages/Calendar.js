import React, { useState } from 'react';
import ArrivalCalendar from '../components/ArrivalCalendar/ArrivalCalendar';
import EventCalendar from '../components/EventCalendar';
import { Box, Tabs, Tab } from '@mui/material';

// PUBLIC_INTERFACE
/**
 * Calendar page component for viewing and managing camp events and activities.
 * Integrates with arrival/departure dates and camp event scheduling.
 */
const Calendar = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="page-container">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Camp Events" />
          <Tab label="Arrivals & Departures" />
        </Tabs>
      </Box>
      
      {activeTab === 0 ? (
        <EventCalendar />
      ) : (
        <ArrivalCalendar />
      )}
    </div>
  );
};

export default Calendar;
