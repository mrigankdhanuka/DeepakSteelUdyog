
// Use environment variable if available, otherwise default to localhost
export const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get headers with JWT
const getHeaders = () => {
  const token = localStorage.getItem('lumina_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  get: async (endpoint: string) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    } catch (error: any) {
      console.error(`API GET Error (${endpoint}):`, error.message);
      throw error;
    }
  },

  post: async (endpoint: string, body: any) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    } catch (error: any) {
      console.error(`API POST Error (${endpoint}):`, error.message);
      throw error;
    }
  },

  put: async (endpoint: string, body: any) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    } catch (error: any) {
      console.error(`API PUT Error (${endpoint}):`, error.message);
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    } catch (error: any) {
      console.error(`API DELETE Error (${endpoint}):`, error.message);
      throw error;
    }
  },

  upload: async (endpoint: string, formData: FormData) => {
    const token = localStorage.getItem('lumina_token');
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    // Content-Type header not set manually for FormData to allow browser to set boundary

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }
      // Returns plain text string (the URL) in JSON format: "url_string"
      return res.json();
    } catch (error: any) {
      console.error(`API UPLOAD Error (${endpoint}):`, error.message);
      throw error;
    }
  }
};

// Helper to map MongoDB _id to frontend id
export const mapData = (data: any) => {
  if (Array.isArray(data)) {
    return data.map(item => ({ ...item, id: item._id }));
  }
  if (data && typeof data === 'object' && data._id) {
    return { ...data, id: data._id };
  }
  return data;
};
