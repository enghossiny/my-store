import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isSupabaseAdminConfigured = Boolean(supabaseUrl && supabaseKey);

let supabaseAdmin: any;

if (!isSupabaseAdminConfigured) {
  supabaseAdmin = {
    from: () => {
      throw new Error(
        'Supabase admin client is not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables on the server (do NOT commit this key).'
      );
    },
  };
} else {
  supabaseAdmin = createClient(supabaseUrl, supabaseKey);
}

export { supabaseAdmin, isSupabaseAdminConfigured };
