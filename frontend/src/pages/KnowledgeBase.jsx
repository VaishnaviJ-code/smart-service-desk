import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Search, BookOpen, Eye, Sparkles, Lightbulb, Loader2, X, ArrowRight, ArrowLeft, Zap } from 'lucide-react';
import { fetchKBArticles, searchKBWithAI } from '../services/kbApi';
import { useAuth } from '../context/AuthContext';

const categoryMap = {
  1: { label: 'HR', color: 'bg-indigo-50 text-indigo-700' },
  2: { label: 'IT', color: 'bg-emerald-50 text-emerald-700' },
  3: { label: 'Facilities', color: 'bg-amber-50 text-amber-700' },
  4: { label: 'General', color: 'bg-slate-50 text-slate-700' },
};

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') ? parseInt(searchParams.get('category')) : null
  );

  // AI Search State
  const [useAI, setUseAI] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Role-aware back navigation
  const handleBack = () => {
    if (!user) {
      navigate('/');
    } else if (user.role === 3) {
      navigate('/agent/dashboard');
    } else if (user.role === 2) {
      navigate('/user/dashboard');
    } else if (user.role === 1) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  // Load articles on mount and category change
  useEffect(() => {
    if (!useAI) {
      loadArticles();
    }
  }, [selectedCategory, useAI]);

  // Auto-search as user types (with debounce)
  useEffect(() => {
    if (!useAI && searchQuery.length > 0) {
      const timer = setTimeout(() => {
        loadArticles();
      }, 500);
      return () => clearTimeout(timer);
    } else if (!useAI && searchQuery.length === 0) {
      loadArticles();
    }
  }, [searchQuery, useAI]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchKBArticles(selectedCategory, searchQuery);
      
      if (Array.isArray(data)) {
        setArticles(data);
      } else if (data.results) {
        setArticles(data.results);
      } else {
        setArticles([]);
      }
    } catch (err) {
      console.error('KB load error:', err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAISearch = async () => {
    if (searchQuery.trim().length < 3) {
      alert('Please enter at least 3 characters for AI search');
      return;
    }

    setAiLoading(true);
    setAiResults(null);

    try {
      const results = await searchKBWithAI(searchQuery.trim());
      setAiResults(results);
    } catch (err) {
      console.error('AI search error:', err);
      alert('AI search failed. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger AI search automatically when AI mode is on
  useEffect(() => {
    if (useAI && searchQuery.trim().length >= 3) {
      const timer = setTimeout(() => {
        handleAISearch();
      }, 800);
      return () => clearTimeout(timer);
    } else if (useAI && searchQuery.trim().length < 3) {
      setAiResults(null);
    }
  }, [searchQuery, useAI]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (useAI) {
      handleAISearch();
    } else {
      loadArticles();
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setAiResults(null);
  };

  if (loading && !useAI && articles.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-slate-900">Knowledge Base</span>
            </Link>
            {user ? (
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
              >
                Login
              </Link>
            )}
          </div>
        </header>
        
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <BookOpen className="h-6 w-6 text-primary-600" />
            <span className="font-semibold text-slate-900">Knowledge Base</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/"
                  className="text-sm text-slate-700 hover:text-slate-900"
                >
                  Back to Home
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <header className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-primary-600" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Knowledge Base</h1>
            <p className="mt-1 text-sm text-slate-500">
              Find answers to common questions and detailed guides
            </p>
          </div>
        </header>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={useAI ? "Ask anything... (type at least 3 characters)" : "Search articles..."}
                className="w-full rounded-lg border border-slate-300 pl-10 pr-10 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              {(loading || aiLoading) && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-600 animate-spin" />
              )}
            </div>
            
            <button
              type="submit"
              disabled={aiLoading || loading}
              className="hidden sm:block rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 transition disabled:opacity-50"
            >
              {aiLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* AI Toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => {
                  setUseAI(e.target.checked);
                  setAiResults(null);
                }}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
              />
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-slate-700">
                AI-Powered Search
              </span>
            </label>
            
            <span className="flex items-center gap-1 text-xs text-slate-500">
              {useAI ? (
                <>
                  <Zap className="w-3 h-3" />
                  AI searches as you type
                </>
              ) : (
                <>
                  <Search className="w-3 h-3" />
                  Live search enabled
                </>
              )}
            </span>
          </div>
        </form>

        {/* Category Filter - Only show when not using AI */}
        {!useAI && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                selectedCategory === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {Object.entries(categoryMap).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => handleCategoryChange(parseInt(key))}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  selectedCategory === parseInt(key)
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* AI Search Results */}
        {useAI && aiResults && (
          <div className="space-y-6">
            {/* AI Answer */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">
                    AI Answer
                  </h2>
                  <p className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">
                    {aiResults.ai_answer}
                  </p>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {aiResults.articles && aiResults.articles.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Related Articles ({aiResults.found_count})
                </h2>
                <div className="space-y-3">
                  {aiResults.articles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => navigate(`/kb/${article.id}`)}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md hover:border-primary-300 transition-all duration-150"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-slate-900 hover:text-primary-700">
                            {article.title}
                          </h3>
                          <p className="mt-2 text-sm text-slate-600">
                            {article.snippet}...
                          </p>
                          <div className="mt-3 flex items-center gap-3 text-xs">
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                              {article.relevance_score}% match
                            </span>
                            <span className={`px-2 py-1 rounded-full font-medium ${
                              categoryMap[article.category]?.color || 'bg-slate-100'
                            }`}>
                              {categoryMap[article.category]?.label || 'General'}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Regular Articles List */}
        {!useAI && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 text-primary-600 animate-spin mx-auto" />
                <p className="mt-2 text-sm text-slate-500">Loading articles...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">
                  {searchQuery ? 'No articles found matching your search' : 'No articles available'}
                </p>
              </div>
            ) : (
              articles.map((article) => {
                const category = categoryMap[article.category];
                return (
                  <div
                    key={article.id}
                    onClick={() => navigate(`/kb/${article.id}`)}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition-all duration-150"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-slate-900 hover:text-primary-700">
                          {article.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {article.content.substring(0, 200)}...
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${category.color}`}>
                        {category.label}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views_count || 0} views
                      </span>
                      <span>•</span>
                      <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          Need help? <Link to="/login" className="text-primary-700 hover:underline font-medium">Contact Support</Link>
        </div>
      </footer>
    </div>
  );
};

export default KnowledgeBase;
