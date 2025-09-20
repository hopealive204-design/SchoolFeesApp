
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance
let supabase: SupabaseClient | null = null;
let configMissing = false;

/**
 * Lazily initializes and returns the Supabase client instance.
 * Returns null if configuration variables are missing.
 * @returns {SupabaseClient | null} The initialized Supabase client or null.
 */
export const getSupabase = (): SupabaseClient | null => {
    // Return existing instance if already initialized
    if (supabase) {
        return supabase;
    }

    // If we've already checked and the config is missing, don't check again.
    if (configMissing) {
        return null;
    }
    
    // This guard prevents a ReferenceError in browser environments where 'process' is not defined.
    // Without this check, the app would crash on platforms like Cloudflare Pages.
    if (typeof process === 'undefined' || typeof process.env === 'undefined') {
        console.log("Supabase environment variables not found. The application will run in offline mode using local mock data.");
        configMissing = true;
        return null;
    }

    // These values are expected to be set as environment variables in your hosting provider.
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    // Check for the presence of environment variables.
    if (!supabaseUrl || !supabaseAnonKey) {
      // Log a clear, one-time message.
      console.log("Supabase URL and/or Anon Key not set. The application will run in offline mode using local mock data.");
      configMissing = true; // Flag that config is missing
      return null;
    }

    // Create and store the client instance
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    return supabase;
};
