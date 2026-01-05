import api from "./api";

// Get all FAQs (public)
export const fetchFAQs = async (query = '') => {
    const url = query ? `/kb/faq/search/?q=${query}` : '/kb/faq/';
    const res = await api.get(url);
    return res.data;
};

// Get single FAQ
export const fetchFAQById = async (id) => {
    const res = await api.get(`/kb/faq/${id}/`);
    return res.data;
};

// Create FAQ (Admin only)
export const createFAQ = async (data) => {
    const res = await api.post('/kb/faq/', data);
    return res.data;
};

// Update FAQ (Admin only)
export const updateFAQ = async (id, data) => {
    const res = await api.put(`/kb/faq/${id}/`, data);
    return res.data;
};

// Delete FAQ (Admin only)
export const deleteFAQ = async (id) => {
    const res = await api.delete(`/kb/faq/${id}/`);
    return res.data;
};
