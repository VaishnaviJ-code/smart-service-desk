import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { fetchKBArticleById, createKBArticle, updateKBArticle } from '../services/kbApi';

const AdminKBForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '1',
    is_published: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadArticle();
    }
  }, [id]);

  const loadArticle = async () => {
    try {
      const data = await fetchKBArticleById(id);
      setForm({
        title: data.title,
        content: data.content,
        category: data.category.toString(),
        is_published: data.is_published
      });
    } catch (err) {
      setError('Failed to load article');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        category: parseInt(form.category)
      };
      
      if (isEdit) {
        await updateKBArticle(id, payload);
      } else {
        await createKBArticle(payload);
      }
      navigate('/admin/kb');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/kb')}
          className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEdit ? 'Edit Article' : 'New Article'}
          </h1>
          <p className="text-sm text-slate-500">
            {isEdit ? 'Update existing KB article' : 'Create a new knowledge base article'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="How to Submit a Leave Request"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              required
            >
              <option value="1">HR</option>
              <option value="2">IT</option>
              <option value="3">Facilities</option>
              <option value="4">General</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={16}
              placeholder="Write your article content here..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Use plain text. Line breaks will be preserved.
            </p>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_published"
              name="is_published"
              checked={form.is_published}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="is_published" className="text-sm font-medium text-slate-700">
              Publish article (visible to users)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/kb')}
            className="rounded-lg border border-slate-200 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : isEdit ? 'Update Article' : 'Create Article'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminKBForm;
