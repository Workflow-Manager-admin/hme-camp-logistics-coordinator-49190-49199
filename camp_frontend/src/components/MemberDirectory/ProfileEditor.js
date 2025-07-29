import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

// PUBLIC_INTERFACE
/**
 * ProfileEditor component for editing member profile information.
 * Integrates with Supabase for real-time updates and data persistence.
 */
const ProfileEditor = ({ isOpen, onClose, memberId, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    arrival_date: '',
    departure_date: '',
    accommodation_request: '',
    dietary_preferences: '',
    allergies: ''
  });

  useEffect(() => {
    if (isOpen && memberId) {
      fetchMemberData();
    }
  }, [isOpen, memberId]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) throw error;

      // Format dates for form inputs
      setFormData({
        ...data,
        arrival_date: data.arrival_date ? data.arrival_date.split('T')[0] : '',
        departure_date: data.departure_date ? data.departure_date.split('T')[0] : ''
      });
    } catch (err) {
      console.error('Error fetching member data:', err);
      setError('Failed to load member data');
    } finally {
      setLoading(false);
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
    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.arrival_date || !formData.departure_date) {
        throw new Error('Please fill in all required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate dates
      const arrival = new Date(formData.arrival_date);
      const departure = new Date(formData.departure_date);
      if (departure < arrival) {
        throw new Error('Departure date must be after arrival date');
      }

      const { error: updateError } = await supabase
        .from('members')
        .update({
          name: formData.name,
          email: formData.email,
          arrival_date: formData.arrival_date,
          departure_date: formData.departure_date,
          accommodation_request: formData.accommodation_request,
          dietary_preferences: formData.dietary_preferences,
          allergies: formData.allergies,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);

      if (updateError) throw updateError;

      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-editor-modal">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Edit Profile</h2>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="arrival_date">Arrival Date *</label>
              <input
                id="arrival_date"
                name="arrival_date"
                type="date"
                value={formData.arrival_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="departure_date">Departure Date *</label>
              <input
                id="departure_date"
                name="departure_date"
                type="date"
                value={formData.departure_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="accommodation_request">Accommodation Request</label>
              <textarea
                id="accommodation_request"
                name="accommodation_request"
                value={formData.accommodation_request}
                onChange={handleInputChange}
                placeholder="Describe your accommodation needs (tent size, RV space, etc.)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dietary_preferences">Dietary Preferences</label>
              <textarea
                id="dietary_preferences"
                name="dietary_preferences"
                value={formData.dietary_preferences}
                onChange={handleInputChange}
                placeholder="List any dietary preferences"
              />
            </div>

            <div className="form-group">
              <label htmlFor="allergies">Allergies</label>
              <textarea
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                placeholder="List any allergies or medical needs"
              />
            </div>

            {error && (
              <div className="form-error">{error}</div>
            )}

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileEditor;
