import api from './api';

export const fetchKBArticles = async (category = null, search = null) => {
  let url = '/kb/articles/';
  const params = new URLSearchParams();
  
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  
  if (params.toString()) url += `?${params.toString()}`;
  
  const res = await api.get(url);
  return res.data;
};

export const fetchKBArticleById = async (id) => {
  const res = await api.get(`/kb/articles/${id}/`);
  return res.data;
};

export const incrementKBView = async (id) => {
  const res = await api.post(`/kb/articles/${id}/increment_view/`);
  return res.data;
};

export const createKBArticle = async (articleData) => {
  const res = await api.post('/kb/articles/', articleData);
  return res.data;
};

export const updateKBArticle = async (id, articleData) => {
  const res = await api.patch(`/kb/articles/${id}/`, articleData);
  return res.data;
};

export const deleteKBArticle = async (id) => {
  await api.delete(`/kb/articles/${id}/`);
};

export const searchKBArticles = async (query) => {
  const res = await api.get(`/kb/articles/?search=${encodeURIComponent(query)}`);
  return res.data;
};

// Get category stats for Support Portal Home page
export const fetchKBStats = async () => {
  try {
    const data = await fetchKBArticles();
    const articles = Array.isArray(data) ? data : data.results || [];
    
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0 };
    articles.forEach(article => {
      if (stats[article.category] !== undefined) {
        stats[article.category]++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('KB stats fetch error:', error);
    return { 1: 0, 2: 0, 3: 0, 4: 0 };
  }
};
