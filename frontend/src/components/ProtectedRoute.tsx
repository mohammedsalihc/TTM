import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import Spinner from './Spinner';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Redirects to /login when there's no valid session — either no token at
// all, or the live profile fetch (see AuthContext.refresh) came back empty
// because the token was invalid/expired. Waits for that fetch to settle
// first (isLoading) so a valid session doesn't flash-redirect before the
// profile has had a chance to load.
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-600">
        <Spinner size={24} />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
