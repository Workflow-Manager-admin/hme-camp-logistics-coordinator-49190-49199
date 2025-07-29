import { createClient } from '@supabase/supabase-js';

// Supabase configuration using environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Validate that required environment variables are present
if (!supabaseUrl) {
  throw new Error('Missing required environment variable: REACT_APP_SUPABASE_URL');
}

if (!supabaseKey) {
  throw new Error('Missing required environment variable: REACT_APP_SUPABASE_KEY');
}

// PUBLIC_INTERFACE
/**
 * Supabase client instance configured with environment variables.
 * This client provides access to authentication, database, storage, and real-time features.
 * 
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// PUBLIC_INTERFACE
/**
 * Default export of the configured Supabase client for convenience.
 * Use this for all interactions with Supabase services.
 */
export default supabase;
