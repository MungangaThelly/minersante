import React from 'react';
import { useStore } from './store.js';

export default function AuthBootstrap({ children, supabase }) {
  const { setUser, clearUser } = useStore();
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) {
          if (session?.user) setUser(session.user); else clearUser();
        }
      } catch {
        if (mounted) clearUser();
      }
    })();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user); else clearUser();
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setUser, clearUser, supabase]);
  return children;
}
