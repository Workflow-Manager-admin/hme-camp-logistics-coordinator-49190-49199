import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
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
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Apply theme to document element and persist to localStorage
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<AuthForms />} />
            <Route path="/signup" element={<AuthForms view="signup" />} />
            <Route path="/reset" element={<AuthForms view="reset" />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardLayout theme={theme} onThemeToggle={toggleTheme} />
                </PrivateRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="home" element={<Home />} />
              <Route path="roster" element={<Roster />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="meals" element={<Meals />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="accommodations" element={<Accommodations />} />
              <Route path="payments" element={<Payments />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
