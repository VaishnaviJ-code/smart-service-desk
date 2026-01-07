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
  AlertCircle,
  CheckCircle,
  PauseCircle,
  BarChart3
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
  const isAdmin = user.role === 1;
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCreator, setFilterCreator] = useState('all');
  const [error, setError] = useState('');
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    search_tags: '',
    canned_response: '',
    is_active: true
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Stats (admin only)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalUsage: 0,
    byAgents: 0,
    byAdmins: 0
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      calculateStats();
    }
  }, [templates, isAdmin]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchCannedResponses(isAdmin ? '' : searchQuery);
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const active = templates.filter(t => t.is_active).length;
    const inactive = templates.filter(t => !t.is_active).length;
    const totalUsage = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);
    const byAgents = templates.filter(t => t.created_by !== user.id).length;
    const byAdmins = templates.filter(t => t.created_by === user.id).length;

    setStats({
      total: templates.length,
      active,
      inactive,
      totalUsage,
      byAgents,
      byAdmins
    });
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
    if (!isAdmin && template.created_by !== user.id) {
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

  const openViewModal = (template) => {
    setViewingTemplate(template);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingTemplate(null);
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
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
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

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!template.search_tags.toLowerCase().includes(query) && 
          !template.canned_response.toLowerCase().includes(query)) {
        return false;
      }
    }

    if (isAdmin) {
      if (filterStatus === 'active' && !template.is_active) return false;
      if (filterStatus === 'inactive' && template.is_active) return false;
      if (filterCreator === 'agents' && template.created_by === user.id) return false;
      if (filterCreator === 'admins' && template.created_by !== user.id) return false;
    }

    return true;
  });

  return (
    <div className={`mx-auto px-4 py-8 ${isAdmin ? 'max-w-7xl' : 'max-w-6xl'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <MessageSquareText className="h-6 w-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-slate-900">
              {isAdmin ? 'Canned Response Management' : 'Quick Response Templates'}
            </h1>
            {isAdmin && (
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                Admin
              </span>
            )}
          </div>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>
        <p className="text-sm text-slate-600">
          {isAdmin 
            ? 'Manage all canned response templates across the organization. View usage analytics and control template availability.'
            : <>Manage your canned responses. Use shortcuts like <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-primary-700">/hi</code> when commenting on tickets.</>
          }
        </p>
      </div>

      {/* Stats Cards - Admin Only */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquareText className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-slate-600">Active</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <PauseCircle className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-slate-600">Inactive</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.inactive}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-slate-600">Total Usage</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.totalUsage}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-slate-600">By Agents</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.byAgents}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              <span className="text-xs text-slate-600">By Admins</span>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{stats.byAdmins}</p>
          </div>
        </div>
      )}

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

      {/* Search & Filters */}
      {isAdmin ? (
        <div className="mb-6 bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search templates by shortcut or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <select
              value={filterCreator}
              onChange={(e) => setFilterCreator(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Creators</option>
              <option value="agents">Agents Only</option>
              <option value="admins">Admins Only</option>
            </select>
          </div>
        </div>
      ) : (
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
        </div>
      )}

      {/* Templates List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Loading templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-300 rounded-lg bg-white">
          <MessageSquareText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm text-slate-600 mb-2">No templates found</p>
          <button
            onClick={openCreateForm}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Create your first template
          </button>
        </div>
      ) : isAdmin ? (
        /* Admin Table View */
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Shortcut</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Response</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Creator</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Usage</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Created</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center text-sm font-mono text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      /{template.search_tags}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p 
                      className="text-sm text-slate-700 line-clamp-2 max-w-md cursor-pointer hover:text-primary-600 transition"
                      onClick={() => openViewModal(template)}
                    >
                      {template.canned_response}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">{template.created_by_name || 'Unknown'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{template.usage_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {template.is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                        <PauseCircle className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500">
                      {new Date(template.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openViewModal(template)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="View"
                      >
                        <MessageSquareText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditForm(template)}
                        className="p-1.5 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded transition"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Agent Card View */
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

                <p 
                  className="text-sm text-slate-700 mb-3 line-clamp-3 cursor-pointer hover:text-primary-600 transition"
                  onClick={() => openViewModal(template)}
                >
                  {template.canned_response}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>By {template.created_by_name || 'Unknown'}</span>
                  <span>{new Date(template.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openViewModal(template)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition"
                  >
                    <MessageSquareText className="h-3 w-3" />
                    View
                  </button>
                  
                  {canEdit && (
                    <>
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
                    </>
                  )}
                </div>
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
                  Active (show in autocomplete{isAdmin ? ' for agents' : ''})
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

      {/* View Modal */}
      {isViewModalOpen && viewingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Quick Response</h2>
                <span className="inline-flex items-center gap-1 text-sm font-mono text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  /{viewingTemplate.search_tags}
                </span>
              </div>
              <button
                onClick={closeViewModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Response Content
                </label>
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">
                    {viewingTemplate.canned_response}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Created By
                  </label>
                  <p className="text-sm text-slate-900">{viewingTemplate.created_by_name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Created On
                  </label>
                  <p className="text-sm text-slate-900">
                    {new Date(viewingTemplate.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Usage Count
                  </label>
                  <p className="text-sm text-slate-900 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-slate-400" />
                    {viewingTemplate.usage_count || 0} times
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Status
                  </label>
                  <p className="text-sm">
                    {viewingTemplate.is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                        <AlertCircle className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-900 mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-2">
                  <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 text-blue-700">
                    {'{customer_name}'}
                  </code>
                  <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 text-blue-700">
                    {'{ticket_id}'}
                  </code>
                  <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 text-blue-700">
                    {'{agent_name}'}
                  </code>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeViewModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Close
                </button>
                {(isAdmin || viewingTemplate.created_by === user.id) && (
                  <button
                    onClick={() => {
                      closeViewModal();
                      openEditForm(viewingTemplate);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Template
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CannedResponseManagement;
