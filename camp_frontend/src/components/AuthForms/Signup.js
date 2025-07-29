import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import './styles.css';

// PUBLIC_INTERFACE
/**
 * Signup form component that handles new user registration with invite token.
 * Integrates with Supabase Auth for secure account creation.
 */
const Signup = ({ onSuccess, onToggleView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const validateInvite = async (token, userEmail) => {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .eq('email', userEmail)
      .eq('used', false)
      .single();

    if (error) {
      throw new Error('Invalid or expired invite token');
    }
    
    if (!data) {
      throw new Error('Invite token does not match the provided email');
    }

    return data;
  };

  const markInviteAsUsed = async (inviteId) => {
    const { error } = await supabase
      .from('invites')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', inviteId);

    if (error) {
      console.error('Failed to mark invite as used:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // First validate the invite token
      const inviteData = await validateInvite(inviteToken, email);

      // Proceed with signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            invite_token: inviteToken,
            invite_id: inviteData.id
          },
          emailRedirectTo: `${process.env.REACT_APP_SITE_URL}/auth/callback`
        }
      });

      if (signUpError) throw signUpError;

      // Mark invite as used
      await markInviteAsUsed(inviteData.id);

      setMessage('Please check your email for the confirmation link to complete your registration.');
      if (onSuccess) onSuccess(data);
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
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Sign up with your invite token</p>
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

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="inviteToken">Invite Token</label>
            <input
              id="inviteToken"
              className="form-input"
              type="text"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
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

export default Signup;
