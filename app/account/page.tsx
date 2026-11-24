'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

type SessionUser = { email?: string; user_metadata?: { full_name?: string } };

export default function Account() {
  const [configured, setConfigured] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    try {
      const supabase = createBrowserSupabaseClient();
      void supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription.subscription.unsubscribe();
    } catch {
      setConfigured(false);
    }
  }, []);

  async function signIn() {
    setBusy(true);
    setError('');
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/account`, queryParams: { prompt: 'select_account' } },
      });
      if (authError) throw authError;
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Google sign-in could not be started.');
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      await createBrowserSupabaseClient().auth.signOut();
      setUser(null);
    } catch {
      setError('You could not be signed out. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="simple-page">
      <p className="eyebrow">My DIOC</p>
      <h1>{user ? `Welcome, ${user.user_metadata?.full_name || 'DIOC client'}.` : 'Welcome back.'}</h1>
      {error && <p role="alert">{error}</p>}
      {user ? (
        <div className="auth-card">
          <h2>{user.email}</h2>
          <p>You are signed in. Guest checkout remains available through WhatsApp.</p>
          <button className="primary" type="button" onClick={signOut} disabled={busy}>
            {busy ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      ) : (
        <div className="auth-card">
          <h2>{configured ? 'Sign in with Google' : 'Account configuration required'}</h2>
          {configured ? (
            <>
              <p>Use your Google account for DIOC customer sign-in.</p>
              <button className="primary" type="button" onClick={signIn} disabled={busy}>
                {busy ? 'Connecting…' : 'Continue with Google'}
              </button>
            </>
          ) : (
            <p>Customer authentication is unavailable until the public Supabase environment variables are configured.</p>
          )}
        </div>
      )}
    </main>
  );
}
