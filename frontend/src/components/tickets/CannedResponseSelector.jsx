import React, { useState, useEffect } from 'react';
import { MessageSquareText, Search, X, ChevronDown, TrendingUp } from 'lucide-react';
import { fetchCannedResponses, trackCannedResponseUsage, substituteVariables } from '../../services/cannedResponseApi';

const CannedResponseSelector = ({ onSelect, ticketCategory, customerName, ticketId, agentName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, ticketCategory]);

  useEffect(() => {
    // Filter templates based on search query
    if (searchQuery.trim()) {
      const filtered = templates.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTemplates(filtered);
    } else {
      setFilteredTemplates(templates);
    }
  }, [searchQuery, templates]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // Fetch templates for this ticket's category (includes universal templates)
      const data = await fetchCannedResponses(ticketCategory);
      setTemplates(data);
      setFilteredTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (template) => {
    try {
      // Track usage
      await trackCannedResponseUsage(template.id);

      // Substitute variables
      const variables = {
        customer_name: customerName || 'Customer',
        ticket_id: ticketId || 'N/A',
        agent_name: agentName || 'Support Agent',
      };

      const substitutedContent = substituteVariables(template.content, variables);

      // Pass to parent component
      onSelect(substitutedContent);

      // Close dropdown
      setIsOpen(false);
      setSearchQuery('');
    } catch (err) {
      console.error('Failed to use template:', err);
      // Still insert template even if tracking fails
      onSelect(template.content);
      setIsOpen(false);
    }
  };

  const getCategoryBadge = (category) => {
    const badges = {
      0: { label: 'All', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      1: { label: 'HR', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      2: { label: 'IT', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      3: { label: 'Facilities', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      4: { label: 'General', color: 'bg-slate-50 text-slate-700 border-slate-200' },
    };
    return badges[category] || badges[4];
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
        title="Insert canned response"
      >
        <MessageSquareText className="w-4 h-4" />
        <span>Quick Reply</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute left-0 bottom-full mb-2 w-96 max-h-96 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4 text-primary-600" />
                  Quick Responses
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Templates List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Loading templates...
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  {searchQuery ? 'No templates match your search' : 'No templates available'}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredTemplates.map((template) => {
                    const badge = getCategoryBadge(template.category);
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className="w-full text-left p-3 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-medium text-slate-900 group-hover:text-primary-700">
                            {template.title}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {template.usage_count > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                <TrendingUp className="w-3 h-3" />
                                {template.usage_count}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {template.content.substring(0, 120)}...
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CannedResponseSelector;
