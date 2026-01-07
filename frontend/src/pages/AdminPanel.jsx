import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAgents,
  createAgent,
  fetchAdminStats,
  fetchRecentTickets,
} from "../services/adminApi";
import {
  getAdminDashboardStats,
  getAgents,
  reassignTicket,
  getTicketAnalytics,
  fetchTickets
} from "../services/ticketApi";
import {
  Users,
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  EyeOff
} from "lucide-react";

const StatCard = ({ label, value, icon: Icon, tone = "default", subtitle }) => {
  const toneClasses = {
    primary: "bg-primary-50 text-primary-800 border-primary-100",
    blue: "bg-blue-50 text-blue-800 border-blue-100",
    green: "bg-green-50 text-green-800 border-green-100",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-100",
    red: "bg-red-50 text-red-800 border-red-100",
    default: "bg-slate-50 text-slate-800 border-slate-200",
  };

  const iconColors = {
    primary: "text-primary-600",
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    default: "text-slate-600",
  };

  return (
    <div className={`flex items-center justify-between rounded-xl border ${toneClasses[tone]} p-4 transition hover:shadow-sm`}>
      <div>
        <span className="text-xs text-slate-600">{label}</span>
        <div className="mt-1 text-2xl font-bold">{value}</div>
        {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
      </div>
      {Icon && <Icon className={`h-8 w-8 ${iconColors[tone]}`} />}
    </div>
  );
};

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // ADD THIS - Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Filter state for tickets
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    sort: '-created_at'
  });
  const [searchInput, setSearchInput] = useState('');

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [filters]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, agentsData, analyticsData, ticketsData] = await Promise.all([
        getAdminDashboardStats(),
        getAgents(),
        getTicketAnalytics(),
        fetchTickets({ sort: '-created_at' })
      ]);

      setStats(statsData);
      setAgents(Array.isArray(agentsData) ? agentsData : []);
      setRecentTickets(Array.isArray(ticketsData) ? ticketsData.slice(0, 10) : []);
      setAnalytics(analyticsData);
      setError("");
    } catch (err) {
      console.error("Admin data load error:", err);
      setError("Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const data = await fetchTickets(filters);
      setAllTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Tickets load error:", err);
      setAllTickets([]);
    }
  };

  // UPDATED - Validation function with no leading/trailing spaces
const validateForm = () => {
  const errors = {};
  
  // Trim and check first name - no leading/trailing spaces
  const trimmedFirstName = formData.first_name.trim();
  if (!trimmedFirstName) {
    errors.first_name = "First name cannot be empty or just spaces";
  } else if (formData.first_name !== trimmedFirstName) {
    errors.first_name = "First name cannot start or end with spaces";
  }
  
  // Trim and check last name - no leading/trailing spaces
  const trimmedLastName = formData.last_name.trim();
  if (!trimmedLastName) {
    errors.last_name = "Last name cannot be empty or just spaces";
  } else if (formData.last_name !== trimmedLastName) {
    errors.last_name = "Last name cannot start or end with spaces";
  }
  
  // Check email
  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Invalid email format";
  }
  
  // Check password - NO spaces at all (leading, trailing, or middle)
  if (!formData.password || formData.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (formData.password.includes(' ')) {
    errors.password = "Password cannot contain any spaces";
  } else if (formData.password !== formData.password.trim()) {
    errors.password = "Password cannot start or end with spaces";
  }
  
  // Check password confirmation
  if (formData.password !== formData.password_confirm) {
    errors.password_confirm = "Passwords do not match";
  }
  
  return errors;
};


  // UPDATED - handleCreateAgent with validation
  const handleCreateAgent = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    setError("");
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // Trim the form data before sending
      const cleanedData = {
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        password: formData.password,
        password_confirm: formData.password_confirm,
      };

      await createAgent(cleanedData);
      setShowModal(false);
      setFormData({
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        password_confirm: "",
      });
      setFormErrors({});
      await loadData();
      setError("");
    } catch (err) {
      console.error("Create agent error:", err);
      const errorMsg = err.response?.data?.email?.[0] || 
                       err.response?.data?.message || 
                       err.message ||
                       "Failed to create agent. Please try again.";
      setError(errorMsg);
    }
  };

  const handleReassign = async () => {
    if (!selectedTicket || !selectedAgent) return;

    try {
      await reassignTicket(selectedTicket.id, selectedAgent);
      setShowReassignModal(false);
      setSelectedTicket(null);
      setSelectedAgent("");
      await loadTickets();
      await loadData();
      setError("");
    } catch (err) {
      console.error("Reassign error:", err);
      setError("Failed to reassign ticket.");
    }
  };

  const getStatusLabel = (status) => {
    const labels = { 1: 'Open', 2: 'In Progress', 3: 'Resolved', 4: 'Closed' };
    return labels[status] || 'Unknown';
  };

  const getStatusColor = (status) => {
    const colors = {
      1: 'bg-blue-50 text-blue-700',
      2: 'bg-yellow-50 text-yellow-700',
      3: 'bg-green-50 text-green-700',
      4: 'bg-slate-100 text-slate-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getPriorityLabel = (priority) => {
    const labels = { 1: 'High', 2: 'Medium', 3: 'Low' };
    return labels[priority] || 'Unknown';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      1: 'bg-red-50 text-red-700',
      2: 'bg-amber-50 text-amber-700',
      3: 'bg-emerald-50 text-emerald-700'
    };
    return colors[priority] || 'bg-slate-100 text-slate-700';
  };

  const getCategoryLabel = (c) => {
    const labels = { 1: 'HR', 2: 'IT', 3: 'Facilities', 4: 'Others' };
    return labels[c] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-100" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            System overview and management
          </p>
        </div>
        <div className="text-sm text-slate-500 self-center hidden lg:block">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Enhanced Stats Grid */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          System Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Tickets"
            value={stats?.total_tickets || 0}
            icon={Ticket}
            tone="blue"
          />
          <StatCard
            label="Open & In Progress"
            value={(stats?.open || 0) + (stats?.in_progress || 0)}
            icon={Clock}
            tone="yellow"
            subtitle={`${stats?.unassigned || 0} unassigned`}
          />
          <StatCard
            label="Resolved"
            value={stats?.resolved || 0}
            icon={CheckCircle}
            tone="green"
            subtitle={stats?.avg_resolution_hours ? `Avg: ${stats.avg_resolution_hours}h` : ''}
          />
          <StatCard
            label="High Priority"
            value={stats?.high_priority || 0}
            icon={AlertTriangle}
            tone="red"
            subtitle="Needs attention"
          />
        </div>
      </section>

      {/* Analytics Section */}
      {analytics && (
        <section className="grid gap-4 lg:grid-cols-2">
          {/* Tickets by Category */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Tickets by Category</h3>
            <div className="space-y-2">
              {Object.entries(analytics.tickets_by_category || {}).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{category}</span>
                  <span className="font-medium text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tickets by Priority */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Tickets by Priority</h3>
            <div className="space-y-2">
              {Object.entries(analytics.tickets_by_priority || {}).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{priority}</span>
                  <span className={`font-medium ${priority === 'High' ? 'text-red-700' :
                    priority === 'Medium' ? 'text-amber-700' :
                      'text-green-700'
                    }`}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Agent Management */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Support Agents
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
          >
            <Users className="h-4 w-4" />
            Add Agent
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Open</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">In Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Resolved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {agents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-sm text-slate-500">
                    No agents yet.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {agent.full_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{agent.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{agent.total_tickets || 0}</td>
                    <td className="px-4 py-3 text-sm text-blue-700">{agent.open_tickets || 0}</td>
                    <td className="px-4 py-3 text-sm text-yellow-700">{agent.in_progress_tickets || 0}</td>
                    <td className="px-4 py-3 text-sm text-green-700">{agent.resolved_tickets || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* All Tickets with Filters */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">All Tickets</h2>

        {/* Filter Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="1">Open</option>
                <option value="2">In Progress</option>
                <option value="3">Resolved</option>
                <option value="4">Closed</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">All Priority</option>
                <option value="1">High</option>
                <option value="2">Medium</option>
                <option value="3">Low</option>
              </select>

              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="priority">High Priority First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {allTickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-sm text-slate-500">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                allTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600">#{ticket.id}</td>
                    <td
                      className="px-4 py-3 text-sm text-slate-900 cursor-pointer hover:text-primary-600"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      {ticket.subject}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {ticket.assigned_to_name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowReassignModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Reassign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* UPDATED - Add Agent Modal with validation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Create Agent</h3>
            
            {/* Show general errors */}
            {error && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateAgent} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => {
                    setFormData({ ...formData, first_name: e.target.value });
                    setFormErrors({ ...formErrors, first_name: "" });
                  }}
                  className={`mt-1 w-full rounded-lg border ${formErrors.first_name ? 'border-red-300' : 'border-slate-300'} px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                />
                {formErrors.first_name && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => {
                    setFormData({ ...formData, last_name: e.target.value });
                    setFormErrors({ ...formErrors, last_name: "" });
                  }}
                  className={`mt-1 w-full rounded-lg border ${formErrors.last_name ? 'border-red-300' : 'border-slate-300'} px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                />
                {formErrors.last_name && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setFormErrors({ ...formErrors, email: "" });
                  }}
                  className={`mt-1 w-full rounded-lg border ${formErrors.email ? 'border-red-300' : 'border-slate-300'} px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-slate-700">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setFormErrors({ ...formErrors, password: "" });
                  }}
                  className={`mt-1 w-full rounded-lg border ${formErrors.password ? 'border-red-300' : 'border-slate-300'} px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {formErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-slate-700">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password_confirm}
                  onChange={(e) => {
                    setFormData({ ...formData, password_confirm: e.target.value });
                    setFormErrors({ ...formErrors, password_confirm: "" });
                  }}
                  className={`mt-1 w-full rounded-lg border ${formErrors.password_confirm ? 'border-red-300' : 'border-slate-300'} px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {formErrors.password_confirm && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.password_confirm}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError("");
                    setFormErrors({});
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
                >
                  Create Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {showReassignModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Reassign Ticket</h3>
            <p className="mt-2 text-sm text-slate-600">
              Ticket #{selectedTicket.id}: {selectedTicket.subject}
            </p>
            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Select Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Choose an agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.full_name} ({agent.total_tickets || 0} tickets)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowReassignModal(false);
                  setSelectedTicket(null);
                  setSelectedAgent("");
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!selectedAgent}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition"
              >
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
