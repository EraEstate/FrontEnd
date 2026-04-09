import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import NotFoundPage from '../pages/NotFoundPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireRole?: 'USER' | 'STAFF' | 'ADMIN';
  allowedRoles?: Array<'USER' | 'STAFF' | 'ADMIN'>;
}

/**
 * Role hierarchy:  ADMIN > STAFF > USER
 * - ADMIN: can access ALL routes (admin, staff, user)
 * - STAFF: can access staff + user routes, NOT admin
 * - USER:  can access user routes only, NOT admin or staff
 * 
 * If unauthorized → show 404 (not redirect to /)
 * If not logged in → redirect to /login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireRole,
  allowedRoles
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role;

  // ADMIN bypasses ALL role checks — supreme access
  if (userRole === 'ADMIN') {
    return <>{children}</>;
  }

  // Admin-only route? Non-admin → 404
  if (requireAdmin) {
    return <NotFoundPage />;
  }

  // Specific role required (e.g. requireRole="STAFF")
  if (requireRole) {
    // STAFF can access STAFF routes
    // USER cannot access STAFF routes → 404
    if (requireRole === 'STAFF' && userRole !== 'STAFF') {
      return <NotFoundPage />;
    }
    // STAFF trying to access ADMIN (already handled above)
    if (requireRole === 'ADMIN' && userRole !== 'ADMIN') {
      return <NotFoundPage />;
    }
  }

  // Allowed roles check
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // ADMIN already passed above, so only check remaining roles
    return <NotFoundPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;