import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const isBrowser = typeof window !== 'undefined';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: isBrowser ? window.localStorage : undefined,
  },
});

function isRefreshTokenError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /refresh token|invalid refresh token|not found/i.test(message);
}

export async function clearAuthSession() {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // Ignore cleanup errors; the storage will still be cleared by the client.
  }
}

export async function getCurrentUser() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError && isRefreshTokenError(sessionError)) {
      await clearAuthSession();
      return null;
    }

    if (!session?.access_token) {
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error && isRefreshTokenError(error)) {
      await clearAuthSession();
      return null;
    }

    return user;
  } catch (error) {
    if (isRefreshTokenError(error)) {
      await clearAuthSession();
      return null;
    }

    return null;
  }
}