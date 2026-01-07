import React, { useState, useEffect, useRef } from 'react';
import { fetchCannedResponses } from '../../services/cannedResponseApi';
import { Zap } from 'lucide-react';

const CannedResponseAutocomplete = ({ 
  value, 
  onChange, 
  customerName = '', 
  ticketId = '', 
  agentName = '',
  ...textareaProps 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [triggerText, setTriggerText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await fetchCannedResponses();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setTemplates([]);
    }
  };

  const replaceVariables = (text) => {
    return text
      .replace(/{customer_name}/g, customerName || '[Customer]')
      .replace(/{ticket_id}/g, ticketId || '[Ticket]')
      .replace(/{agent_name}/g, agentName || '[Agent]');
  };

  // ✅ FIXED: Handle selection properly
  const handleSelect = (template) => {
    const beforeTrigger = value.substring(0, cursorPosition - triggerText.length - 1); // Remove "/" and trigger text
    const afterTrigger = value.substring(cursorPosition);
    
    // Replace variables in the template
    const processedText = replaceVariables(template.canned_response);
    
    // Combine: text before + processed template + text after
    const newValue = beforeTrigger + processedText + afterTrigger;
    
    // ✅ Create synthetic event for parent onChange
    const syntheticEvent = {
      target: {
        value: newValue,
        name: textareaProps.name || 'comment'
      }
    };
    
    // ✅ Call parent onChange
    onChange(syntheticEvent);
    
    // ✅ Close dropdown
    setShowDropdown(false);
    setTriggerText('');
    
    // ✅ Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Set cursor after inserted text
        const newCursorPos = beforeTrigger.length + processedText.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleTextareaChange = (e) => {
    const newValue = e.target.value;
    const newCursor = e.target.selectionStart;
    
    setCursorPosition(newCursor);
    onChange(e);

    // Check for "/" trigger
    const textBeforeCursor = newValue.substring(0, newCursor);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    
    if (lastSlashIndex !== -1) {
      const textAfterSlash = textBeforeCursor.substring(lastSlashIndex + 1);
      
      // Only show dropdown if there's no space after "/"
      if (!textAfterSlash.includes(' ')) {
        setTriggerText(textAfterSlash);
        
        // Filter templates
        const activeTemplates = templates.filter(t => t.is_active);
        const filtered = textAfterSlash
          ? activeTemplates.filter(t => 
              t.search_tags.toLowerCase().includes(textAfterSlash.toLowerCase())
            )
          : activeTemplates;
        
        setFilteredTemplates(filtered);
        setShowDropdown(filtered.length > 0);
      } else {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e) => {
    // Close dropdown on Escape
    if (e.key === 'Escape' && showDropdown) {
      e.preventDefault();
      setShowDropdown(false);
      setTriggerText('');
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        {...textareaProps}
      />

      {/* ✅ Autocomplete Dropdown */}
      {showDropdown && filteredTemplates.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="bg-primary-50 px-3 py-2 flex items-center gap-2 border-b border-primary-100">
            <Zap className="h-4 w-4 text-primary-600" />
            <span className="text-xs font-medium text-primary-700">
              Quick Responses
            </span>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                type="button" // ✅ CRITICAL - prevents form submit
                onClick={(e) => {
                  e.preventDefault(); // ✅ Stop form submit
                  e.stopPropagation(); // ✅ Stop event bubbling
                  handleSelect(template);
                }}
                className="w-full text-left px-3 py-2 hover:bg-primary-50 border-b border-slate-100 transition-colors focus:outline-none focus:bg-primary-50"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-mono font-medium text-primary-600">
                    /{template.search_tags}
                  </span>
                  {template.usage_count > 0 && (
                    <span className="text-xs text-slate-400">
                      Used {template.usage_count}×
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 line-clamp-2">
                  {replaceVariables(template.canned_response).substring(0, 100)}
                  {template.canned_response.length > 100 && '...'}
                </div>
              </button>
            ))}
          </div>
          
          <div className="bg-slate-50 px-3 py-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Press <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-xs">ESC</kbd> to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CannedResponseAutocomplete;
