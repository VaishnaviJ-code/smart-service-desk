import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  MessageCircle, 
  HelpCircle, 
  ChevronDown, 
  Lock,
  Users,
  Laptop,
  Building2,
  FileText,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchKBStats } from '../services/kbApi';

const categoryData = {
  1: { 
    label: 'HR', 
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100', 
    icon: Users 
  },
  2: { 
    label: 'IT', 
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', 
    icon: Laptop 
  },
  3: { 
    label: 'Facilities', 
    color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', 
    icon: Building2 
  },
  4: { 
    label: 'General', 
    color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100', 
    icon: FileText 
  }
};

const hardcodedFAQs = [
  {
    question: 'How do I reset my password?',
    answer: 'Click on "Forgot Password" on the login page. Enter your email address and follow the instructions sent to your inbox.'
  },
  {
    question: 'How long does it take to get a response to my ticket?',
    answer: 'Response times vary by priority: High priority (1 hour), Medium (4 hours), Low (8 hours). You\'ll receive email notifications on updates.'
  },
  {
    question: 'Can I track the status of my ticket?',
    answer: 'Yes! Log in to your dashboard to view all your tickets and their current status in real-time.'
  },
  {
    question: 'Who can I contact for urgent issues?',
    answer: 'For critical issues, create a High Priority ticket or contact IT Support directly at support@company.com or ext. 1234.'
  },
  {
    question: 'How do I submit a leave request?',
    answer: 'Visit the Knowledge Base and search for "Leave Request" to find the step-by-step guide for submitting leave through the HR portal.'
  }
];

const SupportPortalHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [categoryStats, setCategoryStats] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });

  useEffect(() => {
    loadCategoryStats();
  }, []);

  const loadCategoryStats = async () => {
    const stats = await fetchKBStats();
    setCategoryStats(stats);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/kb?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/kb');
    }
  };

  const handleCreateTicket = () => {
    if (!user) {
      navigate('/login', { state: { returnUrl: '/dashboard' } });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      {/* Header */}
<header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
  <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <BookOpen className="h-6 w-6 text-primary-600" />
      <span className="text-lg font-semibold text-slate-900">Support Portal</span>
    </div>
    
    {/* ✅ NEW: CTA-style buttons */}
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate('/login')}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
      >
        Login
      </button>
      <button
        onClick={() => navigate('/register')}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 shadow-sm transition"
      >
        Register
      </button>
    </div>
  </div>
</header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          How can we help you today?
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Search our knowledge base or browse by category
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help articles..."
              className="w-full rounded-lg border border-slate-300 pl-12 pr-4 py-4 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            />
          </div>
        </form>
      </section>

      {/* Category Cards */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Browse by Category</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {Object.entries(categoryData).map(([key, { label, color, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => navigate(`/kb?category=${key}`)}
              className={`rounded-xl border-2 p-6 text-center transition ${color}`}
            >
              <Icon className="h-10 w-10 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-base font-semibold mb-1">{label}</h3>
              <p className="text-sm opacity-75">{categoryStats[key]} articles</p>
            </button>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-slate-900">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {hardcodedFAQs.map((faq, index) => (
            <div key={index} className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition"
              >
                <span className="font-medium text-slate-900">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ml-2 ${
                    expandedFAQ === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFAQ === index && (
                <div className="px-5 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* AI Chatbot Placeholder */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            AI Assistant (Coming Soon)
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Get instant answers powered by AI — launching in Phase 2
          </p>
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              disabled
              placeholder="Type your question..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-4 pr-12 py-3 text-sm text-slate-400 cursor-not-allowed"
            />
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-xl bg-primary-50 border border-primary-200 p-8 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Still can't find the answer?
          </h3>
          <p className="text-slate-600 mb-6">
            Our support team is here to help you resolve any issues
          </p>
          <button
            onClick={handleCreateTicket}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-3 text-base font-medium text-white hover:bg-primary-700 shadow-sm transition"
          >
            Create a Ticket
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>Need immediate help? Contact us at support@company.com</p>
        </div>
      </footer>
    </div>
  );
};

export default SupportPortalHome;
