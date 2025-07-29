import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import Reset from './Reset';
import './styles.css';

// PUBLIC_INTERFACE
/**
 * Main authentication container component that manages different auth views
 * (login, signup, password reset) and handles auth state.
 */
const AuthForms = ({ onAuthSuccess }) => {
  const [view, setView] = useState('login');

  const handleSuccess = (data) => {
    if (onAuthSuccess) onAuthSuccess(data);
  };

  const renderForm = () => {
    switch (view) {
      case 'signup':
        return <Signup onSuccess={handleSuccess} onToggleView={setView} />;
      case 'reset':
        return <Reset onToggleView={setView} />;
      default:
        return <Login onSuccess={handleSuccess} onToggleView={setView} />;
    }
  };

  return renderForm();
};

export default AuthForms;
