import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import ProfileEditor from './ProfileEditor';
import './MemberDirectory.css';
import './ProfileEditor.css';

// PUBLIC_INTERFACE
/**
 * MemberDirectory component for displaying, searching, and filtering camp members.
 * Provides real-time updates when member data changes.
 */
const MemberDirectory = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedView, setSelectedView] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    fetchMembers();
    setupRealtimeSubscription();

    return () => {
      supabase.removeAllSubscriptions();
    };
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select(`
          id,
          name,
          email,
          role,
          crew_id,
          arrival_date,
          departure_date,
          paid_status,
          accommodation_request,
          dietary_preferences,
          allergies
        `)
        .order('name');

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
      .channel('members_channel')
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
    if (payload.eventType === 'INSERT') {
      setMembers(current => [...current, payload.new]);
    } else if (payload.eventType === 'DELETE') {
      setMembers(current => current.filter(member => member.id !== payload.old.id));
    } else if (payload.eventType === 'UPDATE') {
      setMembers(current =>
        current.map(member =>
          member.id === payload.new.id ? { ...member, ...payload.new } : member
        )
      );
      
      // Update selected view if the updated member is currently being viewed
      if (selectedView?.id === payload.new.id) {
        setSelectedView(prev => ({ ...prev, ...payload.new }));
      }
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const openMemberProfile = (member) => {
    setSelectedView(member);
  };

  const closeMemberProfile = () => {
    setSelectedView(null);
  };

  const handleProfileUpdate = () => {
    fetchMembers();
  };

  if (loading) {
    return <div className="member-directory-loading">Loading members...</div>;
  }

  if (error) {
    return <div className="member-directory-error">{error}</div>;
  }

  return (
    <div className="member-directory">
      <div className="member-directory-filters">
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="member-directory-search"
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="member-directory-role-filter"
        >
          <option value="all">All Roles</option>
          <option value="member">Members</option>
          <option value="admin">Admins</option>
          <option value="lead">Leads</option>
        </select>
      </div>

      <div className="member-directory-grid">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            className="member-card"
            onClick={() => openMemberProfile(member)}
          >
            <div className="member-card-avatar">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div className="member-card-info">
              <h3 className="member-card-name">{member.name}</h3>
              <p className="member-card-role">{member.role}</p>
              <div className="member-card-status">
                <span className={`status-indicator ${member.paid_status ? 'paid' : 'unpaid'}`}>
                  {member.paid_status ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedView && (
        <div className="member-profile-modal">
          <div className="modal-content">
            <button className="modal-close" onClick={closeMemberProfile}>×</button>
            <div className="modal-header">
              <h2>{selectedView.name}</h2>
              <button 
                className="btn btn-outline"
                onClick={() => setEditingMember(selectedView)}
              >
                Edit Profile
              </button>
            </div>
            <div className="profile-details">
              <p><strong>Email:</strong> {selectedView.email}</p>
              <p><strong>Role:</strong> {selectedView.role}</p>
              <p><strong>Arrival:</strong> {new Date(selectedView.arrival_date).toLocaleDateString()}</p>
              <p><strong>Departure:</strong> {new Date(selectedView.departure_date).toLocaleDateString()}</p>
              <p><strong>Accommodation:</strong> {selectedView.accommodation_request}</p>
              <p><strong>Dietary Preferences:</strong> {selectedView.dietary_preferences}</p>
              <p><strong>Allergies:</strong> {selectedView.allergies}</p>
              <p><strong>Payment Status:</strong> {selectedView.paid_status ? 'Paid' : 'Unpaid'}</p>
            </div>
          </div>
        </div>
      )}

      <ProfileEditor
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        memberId={editingMember?.id}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default MemberDirectory;
