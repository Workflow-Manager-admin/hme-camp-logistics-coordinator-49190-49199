import React, { useState } from 'react';
import ArrivalCalendar from '../components/ArrivalCalendar/ArrivalCalendar';
import EventCalendar from '../components/EventCalendar';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
// PUBLIC_INTERFACE
/**
 * Calendar page component for viewing and managing camp events and activities.
 * Integrates with arrival/departure dates and camp event scheduling.
 */
const Calendar = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [eventTab, setEventTab] = useState(0);
  const { user } = useAuth();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEventTabChange = (event, newValue) => {
    setEventTab(newValue);
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
        <Paper elevation={1} sx={{ mb: 2 }}>
          <Tabs value={eventTab} onChange={handleEventTabChange} centered>
            <Tab label="All Events" />
            <Tab label="My Events" />
          </Tabs>
        </Paper>
      ) : null}
      {activeTab === 0 ? (
        <EventCalendar showMineOnly={eventTab === 1} userId={user ? user.id : null} />
      ) : (
        <ArrivalCalendar />
      )}
    </div>
  );
};

export default Calendar;
