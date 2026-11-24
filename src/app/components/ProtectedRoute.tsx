import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'patient' | 'care_partner' | 'caregiver' | 'clinician'>;
  redirectTo?: string;
}

/**
 * Protected route wrapper that requires authentication
 * Optionally restricts access to specific user roles
 */
export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = '/' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600 mb-4" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    // Redirect to appropriate dashboard based on user's actual role
    const dashboardMap: Record<string, string> = {
      patient: '/patient/dashboard',
      care_partner: '/caregiver',
      caregiver: '/caregiver',
      clinician: '/clinician',
    };
    
    return <Navigate to={dashboardMap[user.role] || '/'} replace />;
  }

  // User is authenticated and has the right role
  return <>{children}</>;
}