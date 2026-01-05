import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Search, 
  AlertCircle, 
  Filter, 
  ArrowUpDown, 
  Ticket, 
  Clock, 
  CheckCircle, 
  Plus,
  Sparkles,
  Check,
  X
} from "lucide-react";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import TicketCard from "../components/tickets/TicketCard";
import { 
  createTicket, 
  getMyTickets, 
  getMyTicketStats,
  suggestTicketCategory
} from "../services/ticketApi";


const StatCard = ({ label, value, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-800 border-blue-100",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-100",
    green: "bg-green-50 text-green-800 border-green-100",
    slate: "bg-slate-50 text-slate-800 border-slate-100",
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
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


const UserDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // ✅ CHANGE 1: Added category and priority
  const [form, setForm] = useState({
    subject: "",
    description: "",
    category: 4,    // Default to General
    priority: 3     // Default to Low
  });

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAISuggestion, setShowAISuggestion] = useState(false);

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    sort: '-created_at'
  });

  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getMyTicketStats();
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
      const data = await getMyTickets(filters);
      setTickets(data);
      setError("");
    } catch (err) {
      console.error("Ticket load error:", err);
      setError("Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getAISuggestion = async () => {
  if (!form.subject && !form.description) {
    return;
  }

  setLoadingAI(true);
  try {
    const result = await suggestTicketCategory(form.subject, form.description);
    
    // ✅ Update BOTH category and priority
    setForm(prev => ({
      ...prev,
      category: result.category,
      priority: result.priority || 3  // ✅ Add priority
    }));
    
    setAiSuggestion({
      category: result.category,
      priority: result.priority,  // ✅ Add priority
      confidence: result.confidence,
      reasoning: result.reasoning
    });
    
    setShowAISuggestion(true);

  } catch (error) {
    console.error('AI suggestion error:', error);
  } finally {
    setLoadingAI(false);
  }
};


  const getCategoryLabel = (category) => {
    const labels = { 1: 'HR', 2: 'IT', 3: 'Facilities', 4: 'General' };
    return labels[category] || 'General';
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    setCreating(true);
    setError("");
    try {
      await createTicket(form);
      setForm({ subject: "", description: "", category: 4, priority: 3 });
      setShowCreateForm(false);
      setAiSuggestion(null);
      setShowAISuggestion(false);
      await loadTickets();
      await loadStats();
    } catch (err) {
      setError("Unable to create ticket. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage your support requests
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </button>
      </div>

      {/* KB Hint Banner */}
      {showCreateForm && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Before creating a ticket
              </p>
              <p className="text-sm text-blue-700 mb-3">
                Check our Knowledge Base for instant answers to common questions
              </p>
              <button
                onClick={() => navigate('/kb')}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
              >
                <Search className="h-4 w-4" />
                Search Knowledge Base
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Form */}
      {showCreateForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Create a new ticket
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Describe your issue briefly. An agent will pick it up from the queue.
          </p>

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Subject
              </label>
              <Input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Short summary of your issue"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Description
              </label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Add any details that will help the support team understand your request."
                required
              />
            </div>

            {/* ✅ CHANGE 2: Added category and priority dropdowns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="1">HR</option>
                  <option value="2">IT</option>
                  <option value="3">Facilities</option>
                  <option value="4">General</option>
                </select>
              </div>
              
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Priority
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="1">High</option>
                  <option value="2">Medium</option>
                  <option value="3">Low</option>
                </select>
              </div>
            </div>

            {/* AI Suggestion Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={getAISuggestion}
                disabled={loadingAI || (!form.subject && !form.description)}
                className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-4 w-4" />
                {loadingAI ? 'Analyzing with AI...' : 'Get AI Category Suggestion'}
              </button>
              <span className="text-xs text-slate-500">
                Powered by Gemini AI
              </span>
            </div>

            {/* AI Suggestion Display */}
{showAISuggestion && aiSuggestion && (
  <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span className="font-semibold text-purple-900">AI Suggestion Applied!</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            aiSuggestion.confidence === 'high' ? 'bg-green-100 text-green-700' :
            aiSuggestion.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {aiSuggestion.confidence} confidence
          </span>
        </div>
        
        {/* ✅ UPDATED PART - Shows both category and priority */}
        <p className="text-sm text-slate-900 mb-2">
          Suggested Category: <strong className="text-purple-700">{getCategoryLabel(aiSuggestion.category)}</strong>
          <br />
          Suggested Priority: <strong className="text-purple-700">
            {aiSuggestion.priority === 1 ? 'High' : aiSuggestion.priority === 2 ? 'Medium' : 'Low'}
          </strong>
        </p>
        
        <p className="text-xs text-slate-600 italic">"{aiSuggestion.reasoning}"</p>
      </div>
      <button
        type="button"
        onClick={() => setShowAISuggestion(false)}
        className="text-slate-400 hover:text-slate-600 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  </div>
)}


            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setAiSuggestion(null);
                  setShowAISuggestion(false);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <Button type="submit" disabled={creating}>
                {creating ? "Submitting..." : "Submit ticket"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* Stats Section */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-3">Overview</h2>
        {statsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Tickets" value={stats.total || 0} icon={Ticket} color="slate" />
            <StatCard label="Open" value={stats.open || 0} icon={Clock} color="blue" />
            <StatCard label="In Progress" value={stats.in_progress || 0} icon={Clock} color="yellow" />
            <StatCard label="Resolved" value={stats.resolved || 0} icon={CheckCircle} color="green" />
          </div>
        )}
      </section>

      {/* Filter Bar */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search your tickets..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
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

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-slate-500" />
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="-updated_at">Recently Updated</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Tickets List */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Your Tickets</h2>
            {tickets.length > 0 && (
              <span className="text-xs text-slate-500">
                {tickets.length} ticket{tickets.length !== 1 && "s"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
              <Ticket className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-900 mb-1">No tickets found</p>
              <p className="text-xs text-slate-500 mb-4">
                {filters.status || filters.priority || filters.search 
                  ? "Try adjusting your filters" 
                  : "Create your first support ticket"}
              </p>
              {!filters.status && !filters.priority && !filters.search && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  Create Ticket
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </section>

        <aside className="lg:col-span-1">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sticky top-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-primary-600" />
              <h2 className="text-base font-semibold text-slate-900">Need Help?</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Search our knowledge base for guides and common solutions
            </p>
            <button
              onClick={() => navigate('/kb')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Browse Knowledge Base
            </button>
            
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                Find answers to common questions instantly
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default UserDashboard;
