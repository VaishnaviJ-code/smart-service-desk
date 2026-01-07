import { createContext, useContext, useEffect, useState } from "react";
import { fetchProfile, loginRequest } from "../services/authApi";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ✅ Check if token exists immediately - if yes, assume logged in
  const hasToken = !!localStorage.getItem("accessToken");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(hasToken); // Only load if token exists
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    localStorage.setItem("accessToken", data.tokens.access);
    localStorage.setItem("refreshToken", data.tokens.refresh);
    setUser(data.user);
    redirectByRole(data.user.role, true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    navigate("/login", { replace: true });
  };

  const redirectByRole = (role, replace = false) => {
    const path = role === 1 ? "/admin" : role === 3 ? "/agent/dashboard" : "/user/dashboard";
    navigate(path, { replace });
  };

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
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    hasToken, // ✅ Export hasToken
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
