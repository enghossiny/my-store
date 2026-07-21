import { createClient } from '@supabase/supabase-js';

// Separate client for admin with no caching
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      fetch: (url, options) =>
        fetch(url, {
          ...options,
          cache: 'no-store',
          next: { revalidate: 0 },
        }),
    },
  }
);