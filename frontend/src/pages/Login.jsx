import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom"; // ✅ ADD THESE
import { ArrowLeft, LogIn } from "lucide-react"; // ✅ ADD ICONS
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/PasswordInput";

const Login = () => {
  const navigate = useNavigate(); // ✅ ADD
  const location = useLocation(); // ✅ ADD
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ UPDATED: Redirect if already logged in
  useEffect(() => {
    if (user) {
      const dashboardPath = 
        user.role === 1 ? '/admin' : 
        user.role === 3 ? '/agent/dashboard' : 
        '/user/dashboard';
      navigate(dashboardPath, { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    
    try {
      await login(form.email, form.password);
      
      // ✅ NEW: Navigate to return URL or default dashboard
      const returnUrl = location.state?.returnUrl;
      if (returnUrl) {
        navigate(returnUrl, { replace: true });
      }
      // If no returnUrl, useEffect above will handle redirect based on role
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="w-full max-w-md">
        {/* ✅ NEW: Back to Home Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Support Portal
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          {/* ✅ UPDATED: Better heading */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <PasswordInput
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={submitting}>
              <LogIn className="h-4 w-4 mr-2" />
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* ✅ NEW: Link to Register */}
          <div className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
