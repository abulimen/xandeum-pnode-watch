/**
 * Supabase Database Connection
 * Uses @supabase/supabase-js for persistent serverless-compatible storage
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('[db] Supabase configuration missing! Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

// Create Supabase client (singleton pattern)
let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!supabase) {
        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            throw new Error('Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
        }
        supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
        console.log('[db] Supabase client initialized');
    }
    return supabase;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
    return !!(SUPABASE_URL && SUPABASE_SERVICE_KEY);
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
    try {
        const client = getSupabase();
        const { error } = await client.from('snapshots').select('id').limit(1);
        if (error) {
            console.error('[db] Connection test failed:', error.message);
            return false;
        }
        console.log('[db] Connection test successful');
        return true;
    } catch (err) {
        console.error('[db] Connection test error:', err);
        return false;
    }
}

// Export for backwards compatibility (though SQLite-specific code should be migrated)
export default getSupabase;
