import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import DashboardLayout from './components/DashboardLayout';
import AuthForms from './components/AuthForms';
import Home from './pages/Home';
import Roster from './pages/Roster';
import Jobs from './pages/Jobs';
import Meals from './pages/Meals';
import Calendar from './pages/Calendar';
import Accommodations from './pages/Accommodations';
import Payments from './pages/Payments';
import './App.css';

// PUBLIC_INTERFACE
/**
 * Main App component that handles routing and global state management.
 * Provides the overall application structure and theme management.
 */
function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage or default to light
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Effect to apply theme to document element and persist to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  /**
   * Toggles between light and dark themes and persists the selection.
   */
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          {!session ? (
            <Route path="*" element={<AuthForms onAuthSuccess={({ session }) => setSession(session)} />} />
          ) : (
            <Route path="/" element={<DashboardLayout theme={theme} onThemeToggle={toggleTheme} />}>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="roster" element={<Roster />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="meals" element={<Meals />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="accommodations" element={<Accommodations />} />
            <Route path="payments" element={<Payments />} />
            </Route>
          )}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
