import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, BookOpen, MessageCircle, HelpCircle, ChevronDown, Lock, Users, Laptop, Building2, FileText, ArrowRight, X, Sparkles, Lightbulb, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchKBStats, searchKBWithAI } from '../services/kbApi';
import { fetchFAQs } from '../services/faqApi';

const categoryData = {
  1: { label: 'HR', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100', icon: Users },
  2: { label: 'IT', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', icon: Laptop },
  3: { label: 'Facilities', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', icon: Building2 },
  4: { label: 'General', color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100', icon: FileText }
};

const SupportPortalHome = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [categoryStats, setCategoryStats] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Search State
  const [showAISearch, setShowAISearch] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // AUTO-LOGOUT when logged-in user visits home page
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔒 User is logged in, logging out...');
      logout();
    }
  }, [user, authLoading, logout]);

  useEffect(() => {
    loadCategoryStats();
    loadFAQs();
  }, []);

  useEffect(() => {
    loadFAQs();
  }, [faqSearchQuery]);

const loadCategoryStats = async () => {
  try {
    const stats = await fetchKBStats();
    console.log('Category stats loaded:', stats); // Debug log
    setCategoryStats(stats);
  } catch (err) {
    console.error('Failed to load category stats:', err);
    setCategoryStats({ 1: 0, 2: 0, 3: 0, 4: 0 });
  }
};

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const data = await fetchFAQs(faqSearchQuery);
      setFaqs(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error('FAQ load error:', err);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  // ALWAYS use AI/RAG search
  const handleAISearch = async (e) => {
    if (e) e.preventDefault();
    
    if (searchQuery.trim().length < 3) {
      alert('Please enter at least 3 characters');
      return;
    }

    setAiLoading(true);
    setAiResults(null);
    setShowAISearch(true);

    try {
      const results = await searchKBWithAI(searchQuery.trim());
      setAiResults(results);
    } catch (err) {
      console.error('AI search error:', err);
      alert('AI search failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const closeAISearch = () => {
    setShowAISearch(false);
    setAiResults(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Always trigger AI search instead of regular search
    handleAISearch(e);
  };

  const handleCreateTicket = () => {
    navigate('/login', { state: { returnUrl: '/dashboard' } });
  };

  // Show loading while checking auth
  if (authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header - Always show Login/Register on home */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-slate-900">Smart Service Desk</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                to="/kb"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary-600"
              >
                <BookOpen className="h-4 w-4" />
                Knowledge Base
              </Link>
              
              {/* Home page always shows Login/Register */}
              <Link
                to="/login"
                className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary-600 py-16">
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              How can we help you today?
            </h1>
            <p className="mt-4 text-lg text-primary-100">
              Search our knowledge base or browse by category
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for articles, FAQs, or ask a question..."
                  className="w-full rounded-xl border-0 bg-white py-4 pl-12 pr-4 text-slate-900 shadow-xl ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-white px-8 py-4 font-semibold text-primary-700 shadow-xl hover:bg-primary-50"
              >
                Search
              </button>
            </div>
            <p className="mt-3 text-center text-sm text-primary-100 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              Get instant answers powered by AI
            </p>
          </form>
        </div>
      </section>

      {/* AI Search Modal */}
      {showAISearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mb-20 relative">
            <button
              onClick={closeAISearch}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
                AI Search Results for "{searchQuery}"
              </h2>

              {aiLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
              )}

              {aiResults && (
                <div className="space-y-6">
                  {/* AI Answer */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          AI Answer
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                          {aiResults.ai_answer}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Related Articles */}
                  {aiResults.articles && aiResults.articles.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Related Articles ({aiResults.found_count})
                      </h3>
                      
                      <div className="space-y-3">
                        {aiResults.articles.map((article) => (
                          <div
                            key={article.id}
                            onClick={() => {
                              closeAISearch();
                              navigate(`/kb/${article.id}`);
                            }}
                            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-300 cursor-pointer transition"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                                  {article.title}
                                </h4>
                                <p className="text-gray-600 mb-3 text-sm">
                                  {article.snippet}...
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {article.relevance_score}% match
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    categoryData[article.category]?.color || 'bg-gray-100'
                                  }`}>
                                    {categoryData[article.category]?.label || 'General'}
                                  </span>
                                </div>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        closeAISearch();
                        if (searchQuery.trim()) {
                          navigate(`/kb?search=${encodeURIComponent(searchQuery)}`);
                        } else {
                          navigate('/kb');
                        }
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-5 h-5" />
                      Browse All Articles
                    </button>
                    <button
                      onClick={() => {
                        closeAISearch();
                        handleCreateTicket();
                      }}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Create Support Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Browse by Category */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Browse by Category</h2>
          <p className="mt-2 text-slate-600">Find answers organized by department</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(categoryData).map(([key, { label, color, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => navigate(`/kb?category=${key}`)}
              className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-left hover:shadow-lg ${color}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Icon className="h-8 w-8 mb-3" />
                  <h3 className="text-lg font-semibold mb-1">{label}</h3>
                  <p className="text-sm opacity-80">
                    {categoryStats[key] || 0} articles
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8 text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-primary-600 mb-3" />
            <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="mt-2 text-slate-600">Quick answers to common questions</p>
          </div>

          {/* FAQ Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                <p className="text-sm text-slate-500">Loading FAQs...</p>
              </div>
            ) : faqs.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                <p className="text-sm text-slate-500">No FAQs found</p>
              </div>
            ) : (
              faqs.slice(0, 5).map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-900">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${
                        expandedFAQ === faq.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                      <p className="text-sm text-slate-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {faqs.length > 5 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/kb')}
                className="text-sm font-medium text-primary-700 hover:text-primary-800"
              >
                View all FAQs →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-center shadow-xl">
          <MessageCircle className="mx-auto h-12 w-12 text-white mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Can't find what you're looking for?
          </h2>
          <p className="text-primary-100 mb-6">
            Our support team is here to help you resolve any issues
          </p>
          <button
            onClick={handleCreateTicket}
            className="rounded-lg bg-white px-8 py-3 font-semibold text-primary-700 hover:bg-primary-50 shadow-lg"
          >
            Create Support Ticket
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
          <p>© 2026 Smart Service Desk. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link to="/kb" className="hover:text-slate-700">Knowledge Base</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-slate-700">Support</Link>
            <span>•</span>
            <a href="#" className="hover:text-slate-700">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SupportPortalHome;
