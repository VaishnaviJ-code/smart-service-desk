import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Edit, Trash2, Eye, Search, Sparkles, Loader2 } from 'lucide-react';
import { fetchKBArticles, deleteKBArticle, rebuildRAGIndex } from '../services/kbApi';
import { useAuth } from '../context/AuthContext';

const categoryMap = {
  1: { label: 'HR', color: 'bg-indigo-50 text-indigo-700' },
  2: { label: 'IT', color: 'bg-emerald-50 text-emerald-700' },
  3: { label: 'Facilities', color: 'bg-amber-50 text-amber-700' },
  4: { label: 'General', color: 'bg-slate-50 text-slate-700' }
};

const AdminKBManagement = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rebuildLoading, setRebuildLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const handleRebuildIndex = async () => {
    if (!window.confirm('Rebuild the AI search index? This may take a few moments.')) return;
    
    setRebuildLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const result = await rebuildRAGIndex(token);
      alert(`Success! Indexed ${result.count} articles.`);
    } catch (err) {
      alert('Failed to rebuild index: ' + err.message);
    } finally {
      setRebuildLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchKBArticles(selectedCategory, searchQuery);
      setArticles(Array.isArray(data) ? data : data.results || []);
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

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await deleteKBArticle(id);
      setArticles(articles.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete article');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-primary-600" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Knowledge Base Management</h1>
            <p className="text-sm text-slate-500">Create and manage help articles</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRebuildIndex}
            disabled={rebuildLoading}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rebuildLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rebuilding...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Rebuild AI Index
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/admin/kb/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
          >
            <Plus className="h-4 w-4" />
            New Article
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
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
      </div>

      {/* Articles Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {searchQuery ? 'No articles found matching your search' : 'No articles yet. Create your first one!'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Views</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Updated</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {articles.map((article) => {
                const category = categoryMap[article.category];
                return (
                  <tr 
                    key={article.id} 
                    onClick={() => navigate(`/kb/${article.id}`)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{article.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {article.content.substring(0, 80)}...
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${category.color}`}>
                        {category.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Eye className="h-3 w-3" />
                        {article.views_count}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(article.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/kb/${article.id}`)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/kb/edit/${article.id}`)}
                          className="rounded-lg border border-slate-200 p-2 text-blue-600 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          className="rounded-lg border border-slate-200 p-2 text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminKBManagement;
