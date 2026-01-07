import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import { useAuth } from "./context/AuthContext";
import TicketDetail from "./pages/TicketDetail";
import AdminPanel from "./pages/AdminPanel";
import UserManagement from "./pages/UserManagement";
import KnowledgeBase from './pages/KnowledgeBase';
import KBArticleDetail from './pages/KBArticleDetail';
import SupportPortalHome from './pages/SupportPortalHome';
import AdminKBManagement from './pages/AdminKBManagement';
import AdminKBForm from './pages/AdminKBForm';
import AdminFAQManagement from './pages/AdminFAQManagement';
import AdminFAQForm from './pages/AdminFAQForm';
import AdminFAQDetail from './pages/AdminFAQDetail';
import Register from './pages/Register';
import CannedResponseManagement from './components/CannedResponseManagement';
import { useEffect } from "react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    window.onpageshow = function (event) {
      if (event.persisted) {
        window.location.reload();
      }
    };
    return () => {
      window.onpageshow = null;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const dashboardPath = user.role === 1 ? '/admin' : user.role === 3 ? '/agent/dashboard' : '/user/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES - No login required */}
      <Route path="/" element={<SupportPortalHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/kb" element={<KnowledgeBase />} />
      <Route path="/kb/:id" element={<KBArticleDetail />} />

      {/* PROTECTED ROUTES - Require authentication */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        {/* USER ROUTES */}
        <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={[2]}><UserDashboard /></ProtectedRoute>} />
        
        {/* AGENT ROUTES */}
        <Route path="/agent/dashboard" element={<ProtectedRoute allowedRoles={[3]}><AgentDashboard /></ProtectedRoute>} />
        <Route path="/agent/quick-responses" element={<ProtectedRoute allowedRoles={[1, 3]}><CannedResponseManagement /></ProtectedRoute>} />
        
        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={[1]}><AdminPanel /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[1]}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/quick-responses" element={<ProtectedRoute allowedRoles={[1]}><CannedResponseManagement /></ProtectedRoute>} />
        
        {/* Admin KB Routes */}
        <Route path="/admin/kb" element={<ProtectedRoute allowedRoles={[1]}><AdminKBManagement /></ProtectedRoute>} />
        <Route path="/admin/kb/new" element={<ProtectedRoute allowedRoles={[1]}><AdminKBForm /></ProtectedRoute>} />
        <Route path="/admin/kb/edit/:id" element={<ProtectedRoute allowedRoles={[1]}><AdminKBForm /></ProtectedRoute>} />
        
        {/* Admin FAQ Routes */}
        <Route path="/admin/faq" element={<ProtectedRoute allowedRoles={[1]}><AdminFAQManagement /></ProtectedRoute>} />
        <Route path="/admin/faq/new" element={<ProtectedRoute allowedRoles={[1]}><AdminFAQForm /></ProtectedRoute>} />
        <Route path="/admin/faq/:id" element={<ProtectedRoute allowedRoles={[1]}><AdminFAQDetail /></ProtectedRoute>} />
        <Route path="/admin/faq/edit/:id" element={<ProtectedRoute allowedRoles={[1]}><AdminFAQForm /></ProtectedRoute>} />

        {/* SHARED ROUTES */}
        <Route path="/tickets/:id" element={<ProtectedRoute allowedRoles={[1, 2, 3]}><TicketDetail /></ProtectedRoute>} />
      </Route>

      {/* Catch-all redirects to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
