import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import './MealPlanner.css';

// PUBLIC_INTERFACE
/**
 * MealPlanner component for managing camp meals and food planning.
 * Provides meal signup, role assignment, and dietary preference tracking.
 */
const MealPlanner = () => {
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    meal_type: 'dinner',
    description: '',
    max_participants: 20,
    dietary_notes: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    past: 0
  });

  useEffect(() => {
    fetchMeals();
    setupRealtimeSubscription();

    return () => {
      supabase.removeAllSubscriptions();
    };
  }, []);

  useEffect(() => {
    calculateStats(meals);
  }, [meals]);

  const fetchMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select(`
          *,
          participants:jsonb,
          assignments:jsonb,
          creator:members(id, name)
        `)
        .order('date', { ascending: true });

      if (error) throw error;
      setMeals(data || []);
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('meals_channel')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meals'
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
      setMeals(current => [...current, payload.new]);
    } else if (payload.eventType === 'DELETE') {
      setMeals(current => 
        current.filter(meal => meal.id !== payload.old.id)
      );
    } else if (payload.eventType === 'UPDATE') {
      setMeals(current =>
        current.map(meal =>
          meal.id === payload.new.id ? { ...meal, ...payload.new } : meal
        )
      );
    }
  };

  const calculateStats = (mealsList) => {
    const now = new Date();
    const stats = mealsList.reduce((acc, meal) => {
      acc.total++;
      if (new Date(meal.date) > now) {
        acc.upcoming++;
      } else {
        acc.past++;
      }
      return acc;
    }, { total: 0, upcoming: 0, past: 0 });

    setStats(stats);
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
      if (editMode && selectedMeal) {
        const { error: updateError } = await supabase
          .from('meals')
          .update({
            title: formData.title,
            date: formData.date,
            meal_type: formData.meal_type,
            description: formData.description,
            max_participants: formData.max_participants,
            dietary_notes: formData.dietary_notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedMeal.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('meals')
          .insert([{
            title: formData.title,
            date: formData.date,
            meal_type: formData.meal_type,
            description: formData.description,
            max_participants: formData.max_participants,
            dietary_notes: formData.dietary_notes,
            participants: [],
            assignments: {
              cook: [],
              shopper: [],
              cleanup: []
            }
          }]);

        if (insertError) throw insertError;
      }

      closeModal();
      fetchMeals();
    } catch (err) {
      console.error('Error saving meal:', err);
      setError(err.message);
    }
  };

  const handleRoleSignup = async (mealId, role) => {
    try {
      const meal = meals.find(m => m.id === mealId);
      if (!meal) return;

      const assignments = meal.assignments || {
        cook: [],
        shopper: [],
        cleanup: []
      };

      // Check if user is already assigned to this role
      if (assignments[role].includes(user.id)) {
        assignments[role] = assignments[role].filter(id => id !== user.id);
      } else {
        assignments[role].push(user.id);
      }

      const { error: updateError } = await supabase
        .from('meals')
        .update({
          assignments,
          updated_at: new Date().toISOString()
        })
        .eq('id', mealId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating meal assignments:', err);
      setError(err.message);
    }
  };

  const handleParticipate = async (mealId) => {
    try {
      const meal = meals.find(m => m.id === mealId);
      if (!meal) return;

      const participants = meal.participants || [];
      const isParticipating = participants.includes(user.id);

      const updatedParticipants = isParticipating
        ? participants.filter(id => id !== user.id)
        : [...participants, user.id];

      const { error: updateError } = await supabase
        .from('meals')
        .update({
          participants: updatedParticipants,
          updated_at: new Date().toISOString()
        })
        .eq('id', mealId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating meal participants:', err);
      setError(err.message);
    }
  };

  const openModal = (meal = null) => {
    if (meal) {
      setSelectedMeal(meal);
      setFormData({
        title: meal.title,
        date: meal.date.split('T')[0],
        meal_type: meal.meal_type,
        description: meal.description,
        max_participants: meal.max_participants,
        dietary_notes: meal.dietary_notes
      });
      setEditMode(true);
    } else {
      setSelectedMeal(null);
      setFormData({
        title: '',
        date: '',
        meal_type: 'dinner',
        description: '',
        max_participants: 20,
        dietary_notes: ''
      });
      setEditMode(false);
    }
  };

  const closeModal = () => {
    setSelectedMeal(null);
    setEditMode(false);
    setError(null);
  };

  const filteredMeals = meals.filter(meal => {
    const mealDate = new Date(meal.date);
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      return mealDate >= now;
    } else {
      return mealDate < now;
    }
  });

  if (loading) {
    return <div className="loading-state">Loading meal planner...</div>;
  }

  return (
    <div className="meal-planner">
      <div className="meal-planner-header">
        <div>
          <h2 className="page-title">Meal Planner</h2>
          <p className="page-description">
            Coordinate communal meals and sign up for cooking duties
          </p>
        </div>
        {userRole === 'admin' && (
          <button
            className="btn"
            onClick={() => openModal()}
          >
            Add New Meal
          </button>
        )}
      </div>

      <div className="meal-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Meals</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.upcoming}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.past}</div>
          <div className="stat-label">Past</div>
        </div>
      </div>

      <div className="meal-planner-tabs">
        <button
          className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Meals
        </button>
        <button
          className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Meals
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

      <div className="meal-grid">
        {filteredMeals.map(meal => {
          const isParticipating = meal.participants?.includes(user.id);
          const assignments = meal.assignments || { cook: [], shopper: [], cleanup: [] };
          const mealDate = new Date(meal.date);
          const isPast = mealDate < new Date();

          return (
            <div
              key={meal.id}
              className="meal-card"
              onClick={() => userRole === 'admin' && openModal(meal)}
            >
              <div className="meal-card-header">
                <h3 className="meal-title">{meal.title}</h3>
                <span className={`meal-type ${meal.meal_type}`}>
                  {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                </span>
              </div>

              <div className="meal-details">
                <div className="meal-detail-item">
                  <span>Date:</span>
                  <span>{new Date(meal.date).toLocaleDateString()}</span>
                </div>
                <div className="meal-detail-item">
                  <span>Participants:</span>
                  <span>{meal.participants?.length || 0} / {meal.max_participants}</span>
                </div>
                {meal.dietary_notes && (
                  <div className="meal-detail-item">
                    <span>Dietary Notes:</span>
                    <span>{meal.dietary_notes}</span>
                  </div>
                )}
              </div>

              {!isPast && (
                <div className="meal-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className={`btn ${isParticipating ? 'btn-secondary' : ''}`}
                    onClick={() => handleParticipate(meal.id)}
                  >
                    {isParticipating ? 'Cancel Participation' : 'Join Meal'}
                  </button>

                  {isParticipating && (
                    <div className="role-buttons">
                      <button
                        className={`role-btn ${assignments.cook.includes(user.id) ? 'active' : ''}`}
                        onClick={() => handleRoleSignup(meal.id, 'cook')}
                      >
                        Cook
                      </button>
                      <button
                        className={`role-btn ${assignments.shopper.includes(user.id) ? 'active' : ''}`}
                        onClick={() => handleRoleSignup(meal.id, 'shopper')}
                      >
                        Shop
                      </button>
                      <button
                        className={`role-btn ${assignments.cleanup.includes(user.id) ? 'active' : ''}`}
                        onClick={() => handleRoleSignup(meal.id, 'cleanup')}
                      >
                        Clean
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(selectedMeal || !editMode) && (
        <div className="meal-modal">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>{editMode ? 'Edit Meal' : 'Add New Meal'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Meal title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="meal_type">Meal Type</label>
                <select
                  id="meal_type"
                  name="meal_type"
                  value={formData.meal_type}
                  onChange={handleInputChange}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the meal and any special requirements"
                />
              </div>

              <div className="form-group">
                <label htmlFor="max_participants">Maximum Participants</label>
                <input
                  id="max_participants"
                  name="max_participants"
                  type="number"
                  min="1"
                  value={formData.max_participants}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dietary_notes">Dietary Notes</label>
                <textarea
                  id="dietary_notes"
                  name="dietary_notes"
                  value={formData.dietary_notes}
                  onChange={handleInputChange}
                  placeholder="Any dietary restrictions or allergen information"
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn">
                  {editMode ? 'Save Changes' : 'Add Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
