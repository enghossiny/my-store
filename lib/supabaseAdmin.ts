import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase admin client is missing configuration. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

const fallbackClient = {
  from: () => {
    throw new Error('Supabase admin client is not configured');
  },
} as unknown as ReturnType<typeof createClient>;

// Separate client for admin operations with service-role access.
export const supabaseAdmin = (supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: (url, options) => globalThis.fetch(url, { ...options, cache: 'no-store' }),
      },
    })
  : fallbackClient) as ReturnType<typeof createClient>;