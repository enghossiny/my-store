'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { clearAuthSession, supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error && /refresh token|invalid refresh token/i.test(error.message)) {
          await clearAuthSession();
          if (isMounted) setUser(null);
        } else if (isMounted) {
          setUser(session?.user ?? null);
        }
      } catch {
        await clearAuthSession();
        if (isMounted) setUser(null);
      }

      if (isMounted) setLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          return;
        }
        setUser(session?.user ?? null);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}