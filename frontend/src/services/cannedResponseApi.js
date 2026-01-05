import api from './api';

/**
 * Fetch all canned responses
 */
export const fetchCannedResponses = async (search = '') => {
  let url = '/canned-responses/';
  if (search) url += `?search=${encodeURIComponent(search)}`;
  
  const res = await api.get(url);
  return Array.isArray(res.data) ? res.data : res.data.results || [];
};

/**
 * Fetch single canned response by ID
 */
export const fetchCannedResponseById = async (id) => {
  const res = await api.get(`/canned-responses/${id}/`);
  return res.data;
};

/**
 * Create new canned response
 */
export const createCannedResponse = async (data) => {
  const res = await api.post('/canned-responses/', data);
  return res.data;
};

/**
 * Update canned response
 */
export const updateCannedResponse = async (id, data) => {
  const res = await api.patch(`/canned-responses/${id}/`, data);
  return res.data;
};

/**
 * Delete canned response (soft delete)
 */
export const deleteCannedResponse = async (id) => {
  await api.delete(`/canned-responses/${id}/`);
};

/**
 * Track usage when agent uses a template
 */
export const trackCannedResponseUsage = async (id) => {
  const res = await api.post(`/canned-responses/${id}/use/`);
  return res.data;
};

/**
 * Autocomplete search for shortcuts
 */
export const autocompleteCannedResponses = async (query) => {
  const res = await api.get(`/canned-responses/autocomplete/?q=${encodeURIComponent(query)}`);
  return Array.isArray(res.data) ? res.data : res.data.results || [];
};

/**
 * Substitute variables in template content
 * @param {string} content - Template content with {variables}
 * @param {object} variables - Key-value pairs for substitution
 * @returns {string}
 */
export const substituteVariables = (content, variables) => {
  let result = content;
  
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, variables[key] || `{${key}}`);
  });
  
  return result;
};
