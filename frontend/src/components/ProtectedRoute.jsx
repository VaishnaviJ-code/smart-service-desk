import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Prevent browser cache from showing protected pages after logout
  useEffect(() => {
    // Disable browser back/forward cache for protected pages
    window.onpageshow = function(event) {
      if (event.persisted) {
        window.location.reload();
      }
    };

    return () => {
      window.onpageshow = null;
    };
  }, []);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on their actual role
    const dashboardPath = user.role === 1 ? '/admin' : user.role === 3 ? '/agent/dashboard' : '/user/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
