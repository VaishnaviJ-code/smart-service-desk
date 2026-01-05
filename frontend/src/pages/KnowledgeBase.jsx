import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Search, BookOpen, Eye } from 'lucide-react';
import { fetchKBArticles } from '../services/kbApi';

const categoryMap = {
  1: { label: 'HR', color: 'bg-indigo-50 text-indigo-700' },
  2: { label: 'IT', color: 'bg-emerald-50 text-emerald-700' },
  3: { label: 'Facilities', color: 'bg-amber-50 text-amber-700' },
  4: { label: 'General', color: 'bg-slate-50 text-slate-700' },
};

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Read initial values from URL query params
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') ? parseInt(searchParams.get('category')) : null
  );

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchKBArticles(selectedCategory, searchQuery);
      
      // Handle both array and paginated responses
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

  const handleSearch = (e) => {
    e.preventDefault();
    loadArticles();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-slate-900">Knowledge Base</span>
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
            >
              Login
            </Link>
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
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
          >
            Search
          </button>
        </form>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
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
              onClick={() => setSelectedCategory(parseInt(key))}
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

        {/* Articles List */}
        <div className="space-y-3">
          {articles.length === 0 ? (
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
                      {article.views_count} views
                    </span>
                    <span>•</span>
                    <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
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
