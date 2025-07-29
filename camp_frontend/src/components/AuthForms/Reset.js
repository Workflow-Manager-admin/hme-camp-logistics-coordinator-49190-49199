import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import './styles.css';

// PUBLIC_INTERFACE
/**
 * Password reset form component integrated with Supabase Auth.
 * Handles password reset requests and provides user feedback.
 */
const Reset = ({ onToggleView }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.REACT_APP_SITE_URL}/auth/callback`
      });

      if (resetError) throw resetError;

      setMessage('Check your email for password reset instructions.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Enter your email to receive reset instructions</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="auth-feedback error">{error}</div>
          )}

          {message && (
            <div className="auth-feedback success">{message}</div>
          )}

          <button 
            type="submit" 
            className="auth-submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <span 
              className="auth-link"
              onClick={() => onToggleView('login')}
            >
              Sign in here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reset;
