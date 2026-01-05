import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  MessageSquareText,
  TrendingUp,
  Search,
  AlertCircle
} from 'lucide-react';
import { 
  fetchCannedResponses, 
  createCannedResponse, 
  updateCannedResponse, 
  deleteCannedResponse 
} from '../services/cannedResponseApi';
import { useAuth } from '../context/AuthContext';

const CannedResponseManagement = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    search_tags: '',
    canned_response: '',
    is_active: true
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchCannedResponses(searchQuery);
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTemplates();
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({
      search_tags: '',
      canned_response: '',
      is_active: true
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (template) => {
    // Only allow editing own templates (or admin can edit all)
    if (user.role !== 1 && template.created_by !== user.id) {
      setError('You can only edit your own templates');
      return;
    }

    setEditingId(template.id);
    setFormData({
      search_tags: template.search_tags,
      canned_response: template.canned_response,
      is_active: template.is_active
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      search_tags: '',
      canned_response: '',
      is_active: true
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.search_tags.trim()) {
      setFormError('Shortcut is required');
      return;
    }
    
    if (!formData.canned_response.trim()) {
      setFormError('Response content is required');
      return;
    }

    try {
      setSaving(true);
      setFormError('');
      
      if (editingId) {
        await updateCannedResponse(editingId, formData);
      } else {
        await createCannedResponse(formData);
      }
      
      await loadTemplates();
      closeForm();
    } catch (err) {
      console.error('Save error:', err);
      setFormError(err.response?.data?.message || 'Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      setError('');
      await deleteCannedResponse(id);
      await loadTemplates();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete template. Please try again.');
    }
  };

  const filteredTemplates = templates;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquareText className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-slate-900">Quick Response Templates</h1>
        </div>
        <p className="text-sm text-slate-600">
          Manage your canned responses. Use shortcuts like <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-primary-700">/hi</code> when commenting on tickets.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search & Create Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
        >
          Search
        </button>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Loading templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-300 rounded-lg">
          <MessageSquareText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm text-slate-600 mb-2">No templates yet</p>
          <button
            onClick={openCreateForm}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Create your first template
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const canEdit = user.role === 1 || template.created_by === user.id;
            
            return (
              <div
                key={template.id}
                className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-sm font-mono text-primary-600 bg-primary-50 px-2 py-1 rounded">
                    /{template.search_tags}
                  </span>
                  <div className="flex items-center gap-1">
                    {template.usage_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <TrendingUp className="h-3 w-3" />
                        {template.usage_count}
                      </span>
                    )}
                    {!template.is_active && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-700 mb-3 line-clamp-3">
                  {template.canned_response}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>By {template.created_by_name || 'Unknown'}</span>
                  <span>{new Date(template.created_at).toLocaleDateString()}</span>
                </div>

                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(template)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? 'Edit Template' : 'Create New Template'}
              </h2>
              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Shortcut <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600 font-mono">/</span>
                  <input
                    type="text"
                    value={formData.search_tags}
                    onChange={(e) => setFormData({ ...formData, search_tags: e.target.value.toLowerCase() })}
                    placeholder="hi, thanks, password"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Type this after "/" in comments to insert this template
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Response Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.canned_response}
                  onChange={(e) => setFormData({ ...formData, canned_response: e.target.value })}
                  placeholder="Hello {customer_name}! I'm {agent_name} and I'll help you with ticket #{ticket_id}."
                  rows={6}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Available variables: <code className="px-1 bg-slate-100 rounded">{'{customer_name}'}</code>, <code className="px-1 bg-slate-100 rounded">{'{ticket_id}'}</code>, <code className="px-1 bg-slate-100 rounded">{'{agent_name}'}</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="is_active" className="text-sm text-slate-700">
                  Active (show in autocomplete)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CannedResponseManagement;
