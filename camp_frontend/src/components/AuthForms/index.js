import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Login from './Login';
import Signup from './Signup';
import Reset from './Reset';
import './styles.css';

// PUBLIC_INTERFACE
/**
 * Main authentication container component that manages different auth views
 * (login, signup, password reset) and handles auth state.
 */
const AuthForms = ({ view: initialView = 'login' }) => {
  const [view, setView] = useState(initialView);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // If user is already authenticated, redirect to home or previous location
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleViewChange = (newView) => {
    setView(newView);
    navigate(`/${newView}`, { replace: true });
  };

  const renderForm = () => {
    switch (view) {
      case 'signup':
        return <Signup onToggleView={handleViewChange} />;
      case 'reset':
        return <Reset onToggleView={handleViewChange} />;
      default:
        return <Login onToggleView={handleViewChange} />;
    }
  };

  return renderForm();
};

export default AuthForms;
