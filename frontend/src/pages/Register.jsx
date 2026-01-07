import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const dashboardPath = user.role === 1 ? '/admin' : user.role === 3 ? '/agent/dashboard' : '/user/dashboard';
      navigate(dashboardPath, { replace: true });
    }
  }, [user, navigate]);

  // ✅ Handle input with auto-trim for email, first_name, last_name
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For email, first_name, last_name: prevent leading/trailing spaces
    if (name === 'email' || name === 'first_name' || name === 'last_name') {
      setForm((prev) => ({ ...prev, [name]: value.trim() }));
    } 
    // For password: prevent ANY spaces
    else if (name === 'password' || name === 'password_confirm') {
      const noSpaces = value.replace(/\s/g, ''); // Remove all spaces
      setForm((prev) => ({ ...prev, [name]: noSpaces }));
    } 
    else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Validate all fields are filled
    if (!form.email || !form.password || !form.password_confirm || !form.first_name || !form.last_name) {
      setError("All fields are required");
      return;
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // ✅ Validate first name and last name (no numbers/special chars)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(form.first_name)) {
      setError("First name should only contain letters");
      return;
    }
    if (!nameRegex.test(form.last_name)) {
      setError("Last name should only contain letters");
      return;
    }

    // ✅ Validate password
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // ✅ Check for spaces in password
    if (/\s/.test(form.password)) {
      setError("Password cannot contain spaces");
      return;
    }

    // ✅ Validate passwords match
    if (form.password !== form.password_confirm) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        email: form.email.trim().toLowerCase(), // Normalize email
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        full_name: `${form.first_name.trim()} ${form.last_name.trim()}`.trim()
      };

      console.log('Registration payload:', payload); // For debugging

      await api.post('/auth/register/', payload);
      
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err.response?.data); // For debugging
      
      const errorMsg = 
        err.response?.data?.email?.[0] || 
        err.response?.data?.password?.[0] ||
        err.response?.data?.first_name?.[0] ||
        err.response?.data?.last_name?.[0] ||
        err.response?.data?.detail || 
        err.response?.data?.error || 
        'Registration failed. Please try again.';
      
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Registration Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <UserPlus className="h-6 w-6 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign up to create and track support tickets
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="John"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Doe"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters, no spaces"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirm"
                  value={form.password_confirm}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
