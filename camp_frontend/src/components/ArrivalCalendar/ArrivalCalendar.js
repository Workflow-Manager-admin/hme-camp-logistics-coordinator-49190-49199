import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import './ArrivalCalendar.css';

// PUBLIC_INTERFACE
/**
 * ArrivalCalendar component for managing and displaying camp members' arrival/departure schedules.
 * Provides timeline view and individual member cards with dates.
 */
const ArrivalCalendar = () => {
  const { userRole } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    departed: 0
  });

  useEffect(() => {
    fetchMembers();
    setupRealtimeSubscription();

    return () => {
      supabase.removeAllSubscriptions();
    };
  }, []);

  useEffect(() => {
    calculateStats(members);
  }, [members]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('arrival_date');

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('members_arrival_channel')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'members'
        },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleRealtimeUpdate = (payload) => {
    if (payload.eventType === 'UPDATE') {
      setMembers(current =>
        current.map(member =>
          member.id === payload.new.id ? { ...member, ...payload.new } : member
        )
      );
    }
  };

  const calculateStats = (membersList) => {
    const now = new Date();
    const stats = membersList.reduce((acc, member) => {
      const arrival = new Date(member.arrival_date);
      const departure = new Date(member.departure_date);
      
      if (now >= arrival && now <= departure) {
        acc.active++;
      } else if (now < arrival) {
        acc.upcoming++;
      } else if (now > departure) {
        acc.departed++;
      }
      return acc;
    }, { total: membersList.length, active: 0, upcoming: 0, departed: 0 });

    setStats(stats);
  };

  const getMemberStatus = (arrivalDate, departureDate) => {
    const now = new Date();
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);

    if (now >= arrival && now <= departure) {
      return 'active';
    } else if (now < arrival) {
      return 'upcoming';
    } else {
      return 'departed';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Currently at Camp';
      case 'upcoming':
        return 'Arriving Soon';
      case 'departed':
        return 'Departed';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTimelinePercentage = (member) => {
    const now = new Date();
    const arrival = new Date(member.arrival_date);
    const departure = new Date(member.departure_date);
    const total = departure - arrival;
    const elapsed = now - arrival;

    if (now < arrival) return 0;
    if (now > departure) return 100;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getMemberStatus(member.arrival_date, member.departure_date);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="loading-state">Loading arrival calendar...</div>;
  }

  return (
    <div className="arrival-calendar">
      <div className="arrival-calendar-header">
        <div>
          <h2 className="page-title">Arrival Calendar</h2>
          <p className="page-description">
            Track camp members' arrival and departure schedules
          </p>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Currently at Camp</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.upcoming}</div>
          <div className="stat-label">Arriving Soon</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.departed}</div>
          <div className="stat-label">Departed</div>
        </div>
      </div>

      <div className="arrival-calendar-filters">
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="arrival-calendar-search"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="arrival-calendar-filter"
        >
          <option value="all">All Statuses</option>
          <option value="active">Currently at Camp</option>
          <option value="upcoming">Arriving Soon</option>
          <option value="departed">Departed</option>
        </select>
      </div>

      {error && <div className="error-state">{error}</div>}

      <div className="arrival-calendar-grid">
        {filteredMembers.map(member => {
          const status = getMemberStatus(member.arrival_date, member.departure_date);
          const timelineProgress = calculateTimelinePercentage(member);

          return (
            <div key={member.id} className="member-card">
              <div className="member-header">
                <div className="member-avatar">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                </div>
                <span className={`status-badge status-${status}`}>
                  {getStatusLabel(status)}
                </span>
              </div>

              <div className="timeline-container">
                <div className="timeline">
                  <div className="timeline-dates">
                    <span>{formatDate(member.arrival_date)}</span>
                    <span>{formatDate(member.departure_date)}</span>
                  </div>
                  <div className="timeline-track">
                    <div
                      className="timeline-progress"
                      style={{ width: `${timelineProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="member-dates">
                <div className="date-group">
                  <div className="date-label">Arrival</div>
                  <div className="date-value">{formatDate(member.arrival_date)}</div>
                </div>
                <div className="date-group">
                  <div className="date-label">Departure</div>
                  <div className="date-value">{formatDate(member.departure_date)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArrivalCalendar;
