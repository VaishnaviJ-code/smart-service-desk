import React, { useEffect, useState } from "react";
import { fetchTickets, fetchTicketStats, assignTicketToMe } from "../services/ticketApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Filter, ArrowUpDown, Ticket, Clock, CheckCircle, AlertCircle } from "lucide-react";


// Stats Card Component
const StatCard = ({ label, value, icon: Icon, color = "teal" }) => {
  const colorClasses = {
    teal: "bg-teal-50 text-teal-800 border-teal-100",
    blue: "bg-blue-50 text-blue-800 border-blue-100",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-100",
    green: "bg-green-50 text-green-800 border-green-100",
    red: "bg-red-50 text-red-800 border-red-100",
    slate: "bg-slate-50 text-slate-800 border-slate-100",
  };

  const iconColorClasses = {
    teal: "text-teal-600",
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
    red: "text-red-600",
    slate: "text-slate-600",
  };

  return (
    <div className={`flex items-center justify-between rounded-xl border p-4 ${colorClasses[color]} transition hover:shadow-sm`}>
      <div>
        <span className="text-xs text-slate-600 mb-1 block">{label}</span>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      {Icon && <Icon className={`h-8 w-8 ${iconColorClasses[color]}`} />}
    </div>
  );
};


const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigning, setAssigning] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    assignedToMe: false,
    sort: '-created_at'
  });

  // Debounced search
  const [searchInput, setSearchInput] = useState('');

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Load tickets when filters change (with debounce for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets();
    }, searchInput !== filters.search ? 500 : 0);

    return () => clearTimeout(timer);
  }, [filters]);

  // Update search filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const data = await fetchTicketStats();
      setStats(data);
    } catch (err) {
      console.error("Stats load error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await fetchTickets(filters);
      setTickets(data);
      setError("");
    } catch (err) {
      console.error("Ticket load error:", err);
      setError("Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (ticketId) => {
    try {
      setAssigning(ticketId);
      await assignTicketToMe(ticketId);
      await loadTickets();
      await loadStats(); // Refresh stats after assignment
    } catch (err) {
      console.error("Assign error:", err);
      setError("Failed to assign ticket.");
    } finally {
      setAssigning(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Separate tickets for display
  const unassigned = tickets.filter(t => !t.assigned_to);
  const inProgress = tickets.filter(t => t.assigned_to && t.status !== 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agent Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Section */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-3">Today at a glance</h2>
        {statsLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard 
              label="Open tickets" 
              value={stats.open || 0} 
              icon={Ticket}
              color="blue" 
            />
            <StatCard 
              label="In Progress" 
              value={stats.in_progress || 0} 
              icon={Clock}
              color="yellow" 
            />
            <StatCard 
              label="Resolved" 
              value={stats.resolved || 0} 
              icon={CheckCircle}
              color="green" 
            />
            <StatCard 
              label="High Priority" 
              value={stats.high_priority || 0} 
              icon={AlertCircle}
              color="red" 
            />
          </div>
        )}
      </section>

      {/* Filter Bar */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, subject, or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="1">Open</option>
                <option value="2">In Progress</option>
                <option value="3">Resolved</option>
                <option value="4">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Priority</option>
              <option value="1">High</option>
              <option value="2">Medium</option>
              <option value="3">Low</option>
            </select>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-slate-500" />
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="priority">High Priority First</option>
                <option value="-priority">Low Priority First</option>
                <option value="-updated_at">Recently Updated</option>
              </select>
            </div>

            {/* My Tickets Toggle */}
            <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 cursor-pointer hover:bg-slate-50 transition">
              <input
                type="checkbox"
                checked={filters.assignedToMe}
                onChange={(e) => handleFilterChange('assignedToMe', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-slate-700">My Tickets Only</span>
            </label>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      )}

      {/* Tickets Display */}
      {!loading && (
        <>
          {/* Unassigned Tickets */}
          {!filters.assignedToMe && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Unassigned tickets</h2>
                <span className="text-sm text-slate-500">{unassigned.length} waiting</span>
              </div>

              {unassigned.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  No unassigned tickets matching filters
                </div>
              ) : (
                <div className="space-y-3">
                  {unassigned.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition"
                    >
                      {/* Make header clickable to view details */}
                      <div 
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="flex items-start justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1 hover:text-primary-600 transition">
                            #{ticket.id} · {ticket.subject}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-1 mb-2">
                            {ticket.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-700">
                              {ticket.category === 1 ? 'HR' : ticket.category === 2 ? 'IT' : ticket.category === 3 ? 'Facilities' : 'Others'}
                            </span>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 font-medium ${
                              ticket.priority === 1 ? 'bg-red-50 text-red-700' :
                              ticket.priority === 2 ? 'bg-amber-50 text-amber-700' :
                              'bg-emerald-50 text-emerald-700'
                            }`}>
                              Priority: {ticket.priority === 1 ? 'High' : ticket.priority === 2 ? 'Medium' : 'Low'}
                            </span>
                            <span className="text-slate-500">
                              {new Date(ticket.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Assign button - prevents card click with stopPropagation */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent navigation when clicking button
                            handleAssign(ticket.id);
                          }}
                          disabled={assigning === ticket.id}
                          className="flex-shrink-0 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 transition"
                        >
                          {assigning === ticket.id ? "Assigning..." : "Assign to me"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Tickets in Progress */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                {filters.assignedToMe ? 'My Tickets' : 'Tickets in progress'}
              </h2>
              <span className="text-sm text-slate-500">{inProgress.length} active</span>
            </div>

            {inProgress.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No tickets in progress matching filters
              </div>
            ) : (
              <div className="space-y-3">
                {inProgress.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1 hover:text-primary-600 transition">
                          #{ticket.id} · {ticket.subject}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                          {ticket.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 font-medium ${
                            ticket.status === 1 ? 'bg-blue-50 text-blue-700' :
                            ticket.status === 2 ? 'bg-yellow-50 text-yellow-700' :
                            ticket.status === 3 ? 'bg-green-50 text-green-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {ticket.status === 1 ? 'Open' : ticket.status === 2 ? 'In Progress' : ticket.status === 3 ? 'Resolved' : 'Closed'}
                          </span>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 font-medium ${
                            ticket.priority === 1 ? 'bg-red-50 text-red-700' :
                            ticket.priority === 2 ? 'bg-amber-50 text-amber-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}>
                            {ticket.priority === 1 ? 'High' : ticket.priority === 2 ? 'Medium' : 'Low'}
                          </span>
                          {ticket.assigned_to_name && (
                            <span className="text-slate-500">
                              • Assigned to: {ticket.assigned_to_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default AgentDashboard;
