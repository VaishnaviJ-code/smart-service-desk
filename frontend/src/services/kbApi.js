import api from './api';

const API_BASE_URL = 'http://localhost:8000';

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

// ✅ FIXED: Get category stats from backend endpoint (efficient)
export const fetchKBStats = async () => {
  try {
    const res = await api.get('/kb/stats/');
    return res.data;
  } catch (error) {
    console.error('KB stats fetch error:', error);
    // Fallback to frontend calculation if endpoint doesn't exist
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
    } catch (fallbackError) {
      console.error('Fallback stats calculation error:', fallbackError);
      return { 1: 0, 2: 0, 3: 0, 4: 0 };
    }
  }
};

// ✅ RAG AI Search
export const searchKBWithAI = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/kb/kb-search/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI search failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('AI search error:', error);
    throw error;
  }
};

// ✅ Rebuild RAG index (admin only)
export const rebuildRAGIndex = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/api/kb/kb-rebuild-index/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to rebuild index');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Rebuild index error:', error);
    throw error;
  }
};
