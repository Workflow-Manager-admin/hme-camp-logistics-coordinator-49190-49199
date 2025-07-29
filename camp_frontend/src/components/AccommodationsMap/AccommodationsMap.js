import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import './AccommodationsMap.css';

// PUBLIC_INTERFACE
/**
 * AccommodationsMap component for managing camp accommodations.
 * Provides UI to view/edit accommodation assignments and handle requests.
 */
const AccommodationsMap = () => {
  const { user, userRole } = useAuth();
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    size: '',
    location: '',
    assigned_member_id: null,
    notes: ''
  });

  useEffect(() => {
    fetchAccommodations();
    setupRealtimeSubscription();

    return () => {
      supabase.removeAllSubscriptions();
    };
  }, []);

  const fetchAccommodations = async () => {
    try {
      const { data, error } = await supabase
        .from('accommodations')
        .select(`
          *,
          assigned_member:members(id, name, email)
        `)
        .order('location');

      if (error) throw error;
      setAccommodations(data || []);
    } catch (err) {
      console.error('Error fetching accommodations:', err);
      setError('Failed to load accommodations');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('accommodations_channel')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accommodations'
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
      setAccommodations(current => [...current, payload.new]);
    } else if (payload.eventType === 'DELETE') {
      setAccommodations(current => 
        current.filter(acc => acc.id !== payload.old.id)
      );
    } else if (payload.eventType === 'UPDATE') {
      setAccommodations(current =>
        current.map(acc =>
          acc.id === payload.new.id ? { ...acc, ...payload.new } : acc
        )
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editMode && selectedAccommodation) {
        const { error: updateError } = await supabase
          .from('accommodations')
          .update({
            type: formData.type,
            size: formData.size,
            location: formData.location,
            assigned_member_id: formData.assigned_member_id,
            notes: formData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedAccommodation.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('accommodations')
          .insert([{
            type: formData.type,
            size: formData.size,
            location: formData.location,
            assigned_member_id: formData.assigned_member_id,
            notes: formData.notes
          }]);

        if (insertError) throw insertError;
      }

      closeModal();
      fetchAccommodations();
    } catch (err) {
      console.error('Error saving accommodation:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('accommodations')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      closeModal();
    } catch (err) {
      console.error('Error deleting accommodation:', err);
      setError(err.message);
    }
  };

  const openModal = (accommodation = null) => {
    if (accommodation) {
      setSelectedAccommodation(accommodation);
      setFormData({
        type: accommodation.type,
        size: accommodation.size,
        location: accommodation.location,
        assigned_member_id: accommodation.assigned_member_id,
        notes: accommodation.notes || ''
      });
      setEditMode(true);
    } else {
      setSelectedAccommodation(null);
      setFormData({
        type: '',
        size: '',
        location: '',
        assigned_member_id: null,
        notes: ''
      });
      setEditMode(false);
    }
  };

  const closeModal = () => {
    setSelectedAccommodation(null);
    setEditMode(false);
    setError(null);
  };

  const filteredAccommodations = accommodations.filter(acc => {
    const matchesSearch = 
      acc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.assigned_member?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || acc.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <div className="loading-state">Loading accommodations...</div>;
  }

  const uniqueTypes = [...new Set(accommodations.map(acc => acc.type))];

  return (
    <div className="accommodations-map">
      <div className="accommodations-header">
        <div>
          <h2 className="page-title">Accommodations Map</h2>
          <p className="page-description">
            View and manage camp accommodation assignments
          </p>
        </div>
        {userRole === 'admin' && (
          <button
            className="btn"
            onClick={() => openModal()}
          >
            Add Accommodation
          </button>
        )}
      </div>

      <div className="accommodations-filters">
        <input
          type="text"
          placeholder="Search accommodations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="accommodations-search"
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="accommodations-type-filter"
        >
          <option value="all">All Types</option>
          {uniqueTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-state">{error}</div>}

      <div className="accommodations-grid">
        {filteredAccommodations.map(accommodation => (
          <div
            key={accommodation.id}
            className="accommodation-card"
            onClick={() => userRole === 'admin' && openModal(accommodation)}
          >
            <div className="accommodation-card-header">
              <h3 className="accommodation-type">{accommodation.type}</h3>
              <span className={`accommodation-status ${accommodation.assigned_member_id ? 'status-assigned' : 'status-available'}`}>
                {accommodation.assigned_member_id ? 'Assigned' : 'Available'}
              </span>
            </div>
            <div className="accommodation-details">
              <div className="accommodation-detail-item">
                <span>Location:</span>
                <span>{accommodation.location}</span>
              </div>
              <div className="accommodation-detail-item">
                <span>Size:</span>
                <span>{accommodation.size}</span>
              </div>
              {accommodation.assigned_member && (
                <div className="accommodation-detail-item">
                  <span>Assigned to:</span>
                  <span>{accommodation.assigned_member.name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {(selectedAccommodation || !editMode) && (
        <div className="accommodation-modal">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>{editMode ? 'Edit Accommodation' : 'Add Accommodation'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <input
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="e.g., Tent, RV, Yurt"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="size">Size</label>
                <input
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  placeholder="e.g., 10x10, 20ft"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., North side, A1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional details or requirements"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                {editMode && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleDelete(selectedAccommodation.id)}
                  >
                    Delete
                  </button>
                )}
                <button type="submit" className="btn">
                  {editMode ? 'Save Changes' : 'Add Accommodation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccommodationsMap;
