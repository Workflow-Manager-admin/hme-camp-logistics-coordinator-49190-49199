import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import './JobBoard.css';

// PUBLIC_INTERFACE
/**
 * JobBoard component for managing camp jobs and volunteer assignments.
 * Provides real-time updates, filtering, and role-based actions.
 */
const JobBoard = () => {
  const { user, userRole } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    timeslot: '',
    status: 'open'
  });
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    assigned: 0,
    completed: 0
  });

  useEffect(() => {
    fetchJobs();
    setupRealtimeSubscription();

    return () => {
      supabase.removeAllSubscriptions();
    };
  }, []);

  useEffect(() => {
    calculateStats(jobs);
  }, [jobs]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          assigned_member:members(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('jobs_channel')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
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
      setJobs(current => [payload.new, ...current]);
    } else if (payload.eventType === 'DELETE') {
      setJobs(current => 
        current.filter(job => job.id !== payload.old.id)
      );
    } else if (payload.eventType === 'UPDATE') {
      setJobs(current =>
        current.map(job =>
          job.id === payload.new.id ? { ...job, ...payload.new } : job
        )
      );
    }
  };

  const calculateStats = (jobsList) => {
    const stats = jobsList.reduce((acc, job) => {
      acc.total++;
      if (job.status === 'open') acc.open++;
      else if (job.status === 'assigned') acc.assigned++;
      else if (job.status === 'completed') acc.completed++;
      return acc;
    }, { total: 0, open: 0, assigned: 0, completed: 0 });

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
      if (editMode && selectedJob) {
        const { error: updateError } = await supabase
          .from('jobs')
          .update({
            title: formData.title,
            description: formData.description,
            required_skills: formData.required_skills,
            timeslot: formData.timeslot,
            status: formData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedJob.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('jobs')
          .insert([{
            title: formData.title,
            description: formData.description,
            required_skills: formData.required_skills,
            timeslot: formData.timeslot,
            status: formData.status
          }]);

        if (insertError) throw insertError;
      }

      closeModal();
      fetchJobs();
    } catch (err) {
      console.error('Error saving job:', err);
      setError(err.message);
    }
  };

  const handleJobSignup = async (jobId) => {
    try {
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          assigned_member_id: user.id,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error signing up for job:', err);
      setError(err.message);
    }
  };

  const handleJobComplete = async (jobId) => {
    try {
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error completing job:', err);
      setError(err.message);
    }
  };

  const openModal = (job = null) => {
    if (job) {
      setSelectedJob(job);
      setFormData({
        title: job.title,
        description: job.description,
        required_skills: job.required_skills,
        timeslot: job.timeslot,
        status: job.status
      });
      setEditMode(true);
    } else {
      setSelectedJob(null);
      setFormData({
        title: '',
        description: '',
        required_skills: '',
        timeslot: '',
        status: 'open'
      });
      setEditMode(false);
    }
  };

  const closeModal = () => {
    setSelectedJob(null);
    setEditMode(false);
    setError(null);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="loading-state">Loading jobs...</div>;
  }

  return (
    <div className="job-board">
      <div className="job-board-header">
        <div>
          <h2 className="page-title">Job Board</h2>
          <p className="page-description">
            View available jobs, sign up for tasks, and track camp work.
          </p>
        </div>
        {userRole === 'admin' && (
          <button
            className="btn"
            onClick={() => openModal()}
          >
            Add New Job
          </button>
        )}
      </div>

      <div className="job-board-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.open}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.assigned}</div>
          <div className="stat-label">Assigned</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="job-board-filters">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="job-board-search"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="job-board-filter"
        >
          <option value="all">All Statuses</option>
          <option value="open">Available</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {error && <div className="error-state">{error}</div>}

      <div className="job-board-grid">
        {filteredJobs.map(job => (
          <div
            key={job.id}
            className="job-card"
            onClick={() => userRole === 'admin' && openModal(job)}
          >
            <div className="job-card-header">
              <h3 className="job-title">{job.title}</h3>
              <span className={`job-status status-${job.status}`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
            
            <p className="job-description">{job.description}</p>
            
            <div className="job-details">
              {job.required_skills && (
                <div className="job-detail-item">
                  <span>Required Skills:</span>
                  <span>{job.required_skills}</span>
                </div>
              )}
              {job.timeslot && (
                <div className="job-detail-item">
                  <span>Time:</span>
                  <span>{new Date(job.timeslot).toLocaleDateString()}</span>
                </div>
              )}
              {job.assigned_member && (
                <div className="job-detail-item">
                  <span>Assigned to:</span>
                  <span>{job.assigned_member.name}</span>
                </div>
              )}
            </div>

            {job.status === 'open' && !job.assigned_member_id && (
              <div className="job-actions">
                <button
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJobSignup(job.id);
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}

            {job.status === 'assigned' && job.assigned_member_id === user.id && (
              <div className="job-actions">
                <button
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJobComplete(job.id);
                  }}
                >
                  Mark Complete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {(selectedJob || !editMode) && (
        <div className="job-modal">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>{editMode ? 'Edit Job' : 'Add New Job'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Job title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Job description and requirements"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="required_skills">Required Skills</label>
                <input
                  id="required_skills"
                  name="required_skills"
                  value={formData.required_skills}
                  onChange={handleInputChange}
                  placeholder="Skills needed for this job"
                />
              </div>

              <div className="form-group">
                <label htmlFor="timeslot">Time Slot</label>
                <input
                  id="timeslot"
                  name="timeslot"
                  type="datetime-local"
                  value={formData.timeslot}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="open">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="completed">Completed</option>
                  <option value="urgent">Urgent</option>
                </select>
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
                  {editMode ? 'Save Changes' : 'Add Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoard;
