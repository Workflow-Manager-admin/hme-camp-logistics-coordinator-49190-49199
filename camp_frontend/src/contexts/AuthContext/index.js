import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

// PUBLIC_INTERFACE
/**
 * Context for managing authentication state and user session.
 * Provides session data and auth-related utilities to child components.
 */
const AuthContext = createContext({});

// PUBLIC_INTERFACE
/**
 * Hook to access authentication context data and functions.
 * @returns {Object} Authentication context value
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

// PUBLIC_INTERFACE
/**
 * Provider component that wraps app to provide authentication context.
 * Manages session state and user roles.
 */
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserRole(session.user.user_metadata.role || 'member');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserRole(session.user.user_metadata.role || 'member');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    userRole,
    loading,
    isAdmin: userRole === 'admin',
    isAuthenticated: !!session,
    signOut: () => supabase.auth.signOut()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
