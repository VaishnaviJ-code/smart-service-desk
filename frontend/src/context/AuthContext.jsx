import { createContext, useContext, useEffect, useState } from "react";
import { fetchProfile, loginRequest } from "../services/authApi";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);      // { id, email, role, ... }
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    localStorage.setItem("accessToken", data.tokens.access);
    localStorage.setItem("refreshToken", data.tokens.refresh);
    setUser(data.user);
    redirectByRole(data.user.role, true); // Pass true for replace
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    
    // Replace history so forward button doesn't work
    navigate("/login", { replace: true });
  };

  const redirectByRole = (role, replace = false) => {
    const path = role === 1 ? "/admin" : role === 3 ? "/agent/dashboard" : "/user/dashboard";
    navigate(path, { replace }); // Use replace to prevent back button
  };

  // Load user profile on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const profile = await fetchProfile();
        setUser(profile);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Prevent back/forward navigation issues
  useEffect(() => {
    const handlePopState = (e) => {
      // If logged in and trying to go back to login
      if (user && location.pathname === '/login') {
        e.preventDefault();
        const dashboardPath = user.role === 1 ? '/admin' : user.role === 3 ? '/agent/dashboard' : '/user/dashboard';
        navigate(dashboardPath, { replace: true });
      }
      
      // If logged out and trying to go to protected page
      const protectedPaths = ['/admin', '/agent', '/user/dashboard', '/tickets'];
      const isProtectedPath = protectedPaths.some(path => location.pathname.startsWith(path));
      
      if (!user && isProtectedPath) {
        e.preventDefault();
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, location, navigate]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    redirectByRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
