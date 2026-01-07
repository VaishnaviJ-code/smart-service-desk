import api from "./api";


export const fetchAgents = async () => {
  const res = await api.get("/auth/agents/");
  return res.data;
};


export const createAgent = async (agentData) => {
  const res = await api.post("/auth/agents/create/", agentData);
  return res.data;
};


export const fetchAdminStats = async () => {
  const res = await api.get("/auth/adminstats/");  // 👈 FIXED
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


// Get all users with full details (Admin only)
export const fetchAllUsers = async () => {
  const res = await api.get('/auth/users-manage/');
  return res.data;
};


// Get single user by ID
export const fetchUserById = async (id) => {
  const res = await api.get(`/auth/users-manage/${id}/`);
  return res.data;
};


// Update user (Admin only)
export const updateUser = async (id, userData) => {
  const res = await api.put(`/auth/users-manage/${id}/`, userData);
  return res.data;
};


// Delete user (Admin only)
export const deleteUser = async (id) => {
  await api.delete(`/auth/users-manage/${id}/`);
};


// Change user role (Admin only) - Legacy endpoint
export const changeUserRole = async (userId, role) => {
  const res = await api.patch(`/auth/users-manage/${userId}/`, { role });
  return res.data;
};
