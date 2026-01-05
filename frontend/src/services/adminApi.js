import api from "./api";

export const fetchAgents = async () => {
  const res = await api.get("/auth/agents/");  // 👈 /auth/, not /accounts/
  return res.data;
};

export const createAgent = async (agentData) => {
  const res = await api.post("/auth/agents/create/", agentData);
  return res.data;
};

export const fetchAdminStats = async () => {
  const res = await api.get("/auth/admin/stats/");  // 👈 /auth/
  return res.data;
};

// Optional SLA
export const fetchSLAConfig = async () => {
  const res = await api.get("/admin/sla/");
  return res.data;
};

export const fetchRecentTickets = async () => {
  const res = await api.get("/tickets/admin/recent/");
  return res.data;
};

// Get all users (admin only)
export const getAllUsers = async () => {
  const res = await api.get('/auth/users/');
  return res.data;
};

// Change user role (admin only)
export const changeUserRole = async (userId, role) => {
  const res = await api.patch(`/auth/users/${userId}/role/`, { role });
  return res.data;
};