import { useEffect, useState } from 'react';
import { MobileSession, restoreMobileSession, signInMobile, signOutMobile, signUpMobile } from '../services/auth';

export function useMobileAuth() {
  const [session, setSession] = useState<MobileSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const restored = await restoreMobileSession();
        setSession(restored);
      } catch (error) {
        setSession(null);
        setError(error instanceof Error ? error.message : 'Session restore failed.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function signIn(email: string, password: string) {
    setError('');
    const next = await signInMobile(email, password);
    setSession(next);
  }

  async function signUp(name: string, email: string, password: string) {
    setError('');
    const next = await signUpMobile(name, email, password);
    setSession(next);
  }

  async function signOut() {
    await signOutMobile();
    setSession(null);
  }

  return {
    session,
    loading,
    error,
    setError,
    signIn,
    signUp,
    signOut,
  };
}
