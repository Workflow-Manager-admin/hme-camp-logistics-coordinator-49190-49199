import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../../supabaseClient";

export const AuthContext = createContext();

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the user's profile from the profiles table
  const fetchProfile = async (userObj) => {
    if (!userObj) {
      setRole(null);
      return;
    }
    // Fetch matching profile row for user
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userObj.id)
      .single();

    if (!error && data?.role) {
      setRole(data.role);
    } else {
      setRole("member");
    }
  };

  useEffect(() => {
    async function refreshOnSession() {
      const sessionResult = await supabase.auth.getSession();
      let userObj = null;
      if (sessionResult.data?.session) {
        userObj = sessionResult.data.session.user;
        setUser(userObj);
        fetchProfile(userObj);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    }

    refreshOnSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, _session) => {
      refreshOnSession();
    });

    return () => {
      if (listener && listener.subscription) {
        listener.subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line
  }, []);

  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider value={{ user, role, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAuth() {
  return useContext(AuthContext);
}
