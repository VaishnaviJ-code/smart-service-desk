import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Calendar, User, BookOpen, Edit, Trash2 } from 'lucide-react'; // ✅ ADD Edit, Trash2
import { fetchKBArticleById, incrementKBView, deleteKBArticle } from '../services/kbApi'; // ✅ ADD deleteKBArticle
import { useAuth } from '../context/AuthContext'; // ✅ ADD

const categoryMap = {
  1: { label: 'HR', color: 'bg-indigo-50 text-indigo-700' },
  2: { label: 'IT', color: 'bg-emerald-50 text-emerald-700' },
  3: { label: 'Facilities', color: 'bg-amber-50 text-amber-700' },
  4: { label: 'General', color: 'bg-slate-50 text-slate-700' },
};

const KBArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ ADD
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ ADD: Track where user came from
  const isFromAdmin = document.referrer.includes('/admin/kb');

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await fetchKBArticleById(id);
      setArticle(data);
      await incrementKBView(id);
    } catch (err) {
      console.error('Article load error:', err);
      setError('Unable to load article');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD: Delete handler
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${article.title}"?`)) return;
    
    try {
      await deleteKBArticle(id);
      navigate('/admin/kb');
    } catch (err) {
      alert('Failed to delete article');
    }
  };

  // ✅ ADD: Smart back navigation
  const handleBack = () => {
    if (isFromAdmin && user?.role === 1) {
      navigate('/admin/kb');
    } else {
      navigate('/kb');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/kb" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-slate-900">Knowledge Base</span>
            </Link>
            <Link to="/login" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition">
              Login
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="h-8 w-40 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/kb" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-slate-900">Knowledge Base</span>
            </Link>
            <Link to="/login" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition">
              Login
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-primary-700 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Knowledge Base
          </button>
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">{error || 'Article not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const category = categoryMap[article.category];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/kb" className="flex items-center gap-2 hover:opacity-80 transition">
            <BookOpen className="h-6 w-6 text-primary-600" />
            <span className="font-semibold text-slate-900">Knowledge Base</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/kb" className="text-sm text-slate-700 hover:text-slate-900">
              Browse Articles
            </Link>
            <Link to="/login" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* ✅ UPDATED: Back Button + Admin Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {isFromAdmin && user?.role === 1 ? 'Admin KB' : 'Knowledge Base'}</span>
          </button>

          {/* ✅ ADD: Admin-only action buttons */}
          {user?.role === 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/admin/kb/edit/${id}`)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Article Content */}
        <article className="rounded-xl border border-slate-200 bg-white p-8 space-y-6">
          {/* Header */}
          <header className="space-y-3 border-b border-slate-200 pb-6">
            <h1 className="text-2xl font-bold text-slate-900">{article.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${category.color}`}>
                {category.label}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views_count} views
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Updated {new Date(article.updated_at).toLocaleDateString()}
              </span>
            </div>
            {article.created_by_name && (
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <User className="h-3 w-3" />
                Written by {article.created_by_name}
              </p>
            )}
          </header>

          {/* Article Body */}
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {article.content}
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-slate-200 pt-6">
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="h-3 w-3" />
              Last updated: {new Date(article.updated_at).toLocaleString()}
            </p>
          </footer>
        </article>

        {/* Helpful Action */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">
            Was this article helpful?{' '}
            <button className="text-primary-700 hover:underline font-medium">
              Let us know
            </button>
          </p>
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

export default KBArticleDetail;
