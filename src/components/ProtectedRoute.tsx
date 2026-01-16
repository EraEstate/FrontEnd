import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireRole?: 'USER' | 'STAFF' | 'ADMIN';
  allowedRoles?: Array<'USER' | 'STAFF' | 'ADMIN'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireRole,
  allowedRoles
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if admin access is required
  if (requireAdmin && user?.role !== 'ADMIN') {
    // Redirect non-admin users to home page
    return <Navigate to="/" replace />;
  }

  // Check if specific role is required
  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  // Check if user role is in allowed roles
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;