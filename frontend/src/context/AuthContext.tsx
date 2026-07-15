import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { getProfileRequest } from '../services/profileService';
import { Profile } from '../types';

interface AuthContextValue {
  profile: Profile | null;
  isLoading: boolean;
  // fallback is used right after login/register — if the live profile fetch
  // fails, we still want ttm_user to reflect the account that just
  // authenticated, not a stale previous session's cached profile.
  refresh: (fallback?: Profile) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readCachedProfile(): Profile | null {
  try {
    const raw = localStorage.getItem('ttm_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Seeds from the cached profile (written at login) for an instant,
// non-flashing UI, then re-checks live from GET /api/profile — same "never
// trust stale permission data" rule the backend applies to canManageProjects.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(readCachedProfile);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (fallback?: Profile) => {
    try {
      const fresh = await getProfileRequest();
      setProfile(fresh);
      localStorage.setItem('ttm_user', JSON.stringify(fresh));
    } catch {
      // Expected on /login and /register before a token exists. If a
      // fallback was given (a login/register response's basic user object),
      // use it so the just-authenticated account is reflected either way.
      if (fallback) {
        setProfile(fallback);
        localStorage.setItem('ttm_user', JSON.stringify(fallback));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <AuthContext.Provider value={{ profile, isLoading, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
