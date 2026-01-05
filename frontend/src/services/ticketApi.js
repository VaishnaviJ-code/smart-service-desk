import api from "./api";

export const fetchTickets = async (filters = {}) => {
  // Build query parameters
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.category) params.append('category', filters.category);
  if (filters.assignedToMe !== undefined) params.append('assigned_to_me', filters.assignedToMe);
  if (filters.sort) params.append('sort', filters.sort);
  
  const queryString = params.toString();
  const url = queryString ? `/tickets/?${queryString}` : '/tickets/';
  
  const res = await api.get(url);
  
  // Handle both paginated and non-paginated responses
  const data = res.data;
  if (Array.isArray(data)) {
    return data;
  } else if (data.results && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
};

export const createTicket = async (payload) => {
  const res = await api.post("/tickets/", payload);
  return res.data;
};

export const fetchDashboardStats = async () => {
  const res = await api.get("/dashboard/stats/");
  return res.data;
};

// NEW: Fetch ticket statistics
export const fetchTicketStats = async () => {
  const res = await api.get("/tickets-stats/");
  return res.data;
};

export const fetchAgentQueue = async (filters = {}) => {
  // Use the enhanced fetchTickets function
  return fetchTickets(filters);
};

export const assignTicketToMe = async (ticketId) => {
  const res = await api.post(`/tickets/${ticketId}/assign/`, {});
  return res.data;
};

export const getTicketById = async (ticketId) => {
  const res = await api.get(`/tickets/${ticketId}/`);
  return res.data;
};

export const addComment = async (ticketId, commentText) => {
  const res = await api.post(`/tickets/${ticketId}/add_comment/`, {
    comment_text: commentText
  });
  return res.data;
};

export const changeTicketStatus = async (ticketId, newStatus) => {
  const res = await api.post(`/tickets/${ticketId}/change_status/`, {
    status: newStatus
  });
  return res.data;
};

// Get user's own tickets with filters
export const getMyTickets = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.sort) params.append('sort', filters.sort);
  
  const queryString = params.toString();
  const url = queryString ? `/my-tickets/?${queryString}` : '/my-tickets/';
  
  const res = await api.get(url);
  return Array.isArray(res.data) ? res.data : res.data.results || [];
};

// Get user's ticket statistics
export const getMyTicketStats = async () => {
  const res = await api.get('/my-tickets/stats/');
  return res.data;
};

// Admin: Get dashboard statistics
export const getAdminDashboardStats = async () => {
  const res = await api.get('/admin/dashboard-stats/');
  return res.data;
};

// Admin: Get all agents with ticket counts
export const getAgents = async () => {
  const res = await api.get('/admin/agents/');
  return res.data;
};

// Admin: Reassign ticket to another agent
export const reassignTicket = async (ticketId, agentId) => {
  const res = await api.post(`/tickets/${ticketId}/reassign/`, {
    agent_id: agentId
  });
  return res.data;
};

// Admin: Get analytics data
export const getTicketAnalytics = async () => {
  const res = await api.get('/admin/analytics/');
  return res.data;
};

export const suggestTicketCategory = async (subject, description) => {
  const response = await api.post('/suggest-category/', {  // ✅ Remove 'tickets/'
    subject,
    description
  });
  return response.data;
};

