import React, { useState, useEffect, useRef } from 'react';
import { Zap, TrendingUp, X } from 'lucide-react';
import { autocompleteCannedResponses, trackCannedResponseUsage, substituteVariables } from '../../services/cannedResponseApi';

const CannedResponseAutocomplete = ({ 
  value, 
  onChange, 
  customerName, 
  ticketId, 
  agentName,
  ...textareaProps 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const textareaRef = useRef(null);

  // Detect trigger character (/) and fetch suggestions
  useEffect(() => {
    const detectTrigger = () => {
      if (!value) {
        setShowSuggestions(false);
        return;
      }

      const cursorPos = textareaRef.current?.selectionStart || value.length;
      const textBeforeCursor = value.substring(0, cursorPos);
      
      // Match /word at the end (no spaces after /)
      const match = textBeforeCursor.match(/\/(\w+)$/);
      
      if (match) {
        const query = match[1];
        fetchSuggestions(query);
      } else {
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(detectTrigger, 200);
    return () => clearTimeout(debounce);
  }, [value]);

  const fetchSuggestions = async (query) => {
    try {
      const results = await autocompleteCannedResponses(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(0);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setShowSuggestions(false);
    }
  };

  const insertTemplate = async (template) => {
    try {
      // Track usage
      await trackCannedResponseUsage(template.id);
    } catch (err) {
      console.error('Failed to track usage:', err);
    }

    // Substitute variables
    const variables = {
      customer_name: customerName || 'Customer',
      ticket_id: ticketId || 'N/A',
      agent_name: agentName || 'Support Agent',
    };
    const substitutedContent = substituteVariables(template.canned_response, variables);

    // Replace /shortcut with template content
    const cursorPos = textareaRef.current?.selectionStart || value.length;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);
    
    const updatedBefore = textBeforeCursor.replace(/\/\w+$/, substitutedContent);
    const newValue = updatedBefore + textAfterCursor;
    
    onChange({ target: { value: newValue } });
    
    // Close suggestions
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = updatedBefore.length;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
      case 'Tab':
        if (showSuggestions) {
          e.preventDefault();
          insertTemplate(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        {...textareaProps}
        placeholder={textareaProps.placeholder || "Type your comment... (Type / for quick responses)"}
      />

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowSuggestions(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute left-0 bottom-full mb-2 w-full max-w-lg bg-white border border-slate-300 rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Zap className="w-3 h-3 text-primary-600" />
                <span>Quick responses - Press <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">Tab</kbd> or <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">Enter</kbd></span>
              </div>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Templates List */}
            <div className="max-h-64 overflow-y-auto">
              {suggestions.map((template, index) => (
                <button
                  key={template.id}
                  onClick={() => insertTemplate(template)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left p-3 border-b border-slate-100 last:border-b-0 transition-colors ${
                    index === selectedIndex ? 'bg-primary-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-mono text-primary-600 bg-primary-100 px-2 py-0.5 rounded">
                      /{template.search_tags}
                    </span>
                    {template.usage_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <TrendingUp className="w-3 h-3" />
                        {template.usage_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-2">
                    {template.canned_response.substring(0, 100)}...
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CannedResponseAutocomplete;
