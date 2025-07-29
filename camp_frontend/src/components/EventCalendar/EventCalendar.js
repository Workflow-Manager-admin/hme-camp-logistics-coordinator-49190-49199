import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
         FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

// Styled components
const EventCalendarContainer = styled('div')(({ theme }) => ({
  padding: '20px',
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '& .fc': {
    fontFamily: theme.typography.fontFamily
  },
  '& .fc .fc-toolbar-title': {
    fontSize: '1.5em',
    color: '#37474F'
  },
  '& .fc .fc-button': {
    backgroundColor: '#FF6F00',
    borderColor: '#FF6F00',
    '&:hover': {
      backgroundColor: '#F57C00',
      borderColor: '#F57C00'
    }
  },
  '& .fc .fc-button-primary:not(:disabled).fc-button-active, & .fc .fc-button-primary:not(:disabled):active': {
    backgroundColor: '#EF6C00',
    borderColor: '#EF6C00'
  },
  '& .fc-event': {
    cursor: 'pointer',
    padding: '2px 4px',
    margin: '1px 0',
    border: 'none'
  },
  '& .fc-event-title': {
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  '& .fc-event-time': {
    fontSize: '0.85em',
    opacity: 0.8
  },
  [theme.breakpoints.down('md')]: {
    padding: '10px',
    '& .fc .fc-toolbar': {
      flexDirection: 'column',
      gap: '10px'
    },
    '& .fc .fc-toolbar-title': {
      fontSize: '1.2em'
    }
  }
}));

// PUBLIC_INTERFACE
/**
 * EventCalendar component for displaying and managing camp events
 * Supports viewing, adding, and editing events with role-based access control
 */
/**
 * PROPS
 * showMineOnly: boolean - if true, only events created by this user are shown
 * userId: string - the current user's id
 */
const EventCalendar = ({ showMineOnly = false, userId = null }) => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTypes, setEventTypes] = useState(['event', 'job', 'meal']);
  const [filters, setFilters] = useState({
    event: true,
    job: true,
    meal: true
  });
  const { user, userRole } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    type: 'event',
    description: '',
    isRecurring: false,
    recurringPattern: '',
    createdBy: ''
  });

  useEffect(() => {
    fetchEvents();
    const subscription = supabase
      .channel('events_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, handleRealtimeUpdate)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*');
      
      if (error) throw error;

      const formattedEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        type: event.type,
        description: event.description,
        isRecurring: event.is_recurring,
        recurringPattern: event.recurring_pattern,
        createdBy: event.created_by,
        backgroundColor: getEventColor(event.type)
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleRealtimeUpdate = (payload) => {
    if (payload.eventType === 'INSERT') {
      setEvents(prev => [...prev, formatEvent(payload.new)]);
    } else if (payload.eventType === 'UPDATE') {
      setEvents(prev => prev.map(event => 
        event.id === payload.new.id ? formatEvent(payload.new) : event
      ));
    } else if (payload.eventType === 'DELETE') {
      setEvents(prev => prev.filter(event => event.id !== payload.old.id));
    }
  };

  const formatEvent = (event) => ({
    id: event.id,
    title: event.title,
    start: event.start_time,
    end: event.end_time,
    type: event.type,
    description: event.description,
    isRecurring: event.is_recurring,
    recurringPattern: event.recurring_pattern,
    createdBy: event.created_by,
    backgroundColor: getEventColor(event.type)
  });

  const getEventColor = (type) => {
    const colors = {
      event: '#FF6F00',  // Primary color
      job: '#37474F',    // Secondary color
      meal: '#76FF03'    // Accent color
    };
    return colors[type] || colors.event;
  };

  const handleDateSelect = (selectInfo) => {
    if (userRole === 'admin' || userRole === 'member') {
      setFormData({
        title: '',
        start: format(selectInfo.start, "yyyy-MM-dd'T'HH:mm"),
        end: format(selectInfo.end, "yyyy-MM-dd'T'HH:mm"),
        type: 'event',
        description: '',
        isRecurring: false,
        recurringPattern: '',
        createdBy: user.id
      });
      setSelectedEvent(null);
      setIsModalOpen(true);
    }
  };

  const handleEventClick = (clickInfo) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setFormData({
        ...event,
        start: format(new Date(event.start), "yyyy-MM-dd'T'HH:mm"),
        end: format(new Date(event.end), "yyyy-MM-dd'T'HH:mm")
      });
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async () => {
    try {
      const eventData = {
        title: formData.title,
        start_time: formData.start,
        end_time: formData.end,
        type: formData.type,
        description: formData.description,
        is_recurring: formData.isRecurring,
        recurring_pattern: formData.recurringPattern,
        created_by: user.id
      };

      if (selectedEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', selectedEvent.id);
        
        if (error) throw error;
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([eventData]);
        
        if (error) throw error;
      }

      setIsModalOpen(false);
      setSelectedEvent(null);
      setFormData({
        title: '',
        start: '',
        end: '',
        type: 'event',
        description: '',
        isRecurring: false,
        recurringPattern: '',
        createdBy: ''
      });
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', selectedEvent.id);
        
        if (error) throw error;

        setIsModalOpen(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  // Filter logic for tabs and filter buttons
  let filteredEvents = events.filter(event => filters[event.type]);
  if (showMineOnly && userId) {
    filteredEvents = filteredEvents.filter(event => event.createdBy === userId);
  }

  return (
    <EventCalendarContainer>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        {eventTypes.map(type => (
          <Button
            key={type}
            variant={filters[type] ? 'contained' : 'outlined'}
            onClick={() => setFilters(prev => ({ ...prev, [type]: !prev[type] }))}
            sx={{ 
              backgroundColor: filters[type] ? getEventColor(type) : 'transparent',
              color: filters[type] ? 'white' : getEventColor(type),
              '&:hover': {
                backgroundColor: filters[type] ? getEventColor(type) : 'rgba(0,0,0,0.1)'
              }
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}s
          </Button>
        ))}
      </Box>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={filteredEvents}
        selectable={userRole === 'admin' || userRole === 'member'}
        editable={userRole === 'admin' || userRole === 'member'}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
      />

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEvent ? 'Edit Event' : 'Create Event'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Start Time"
              type="datetime-local"
              value={formData.start}
              onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Time"
              type="datetime-local"
              value={formData.end}
              onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                label="Type"
              >
                {eventTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          {selectedEvent && (
            <Button onClick={handleDelete} color="error">
              Delete
            </Button>
          )}
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedEvent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </EventCalendarContainer>
  );
};

export default EventCalendar;
