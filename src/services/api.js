// Central place for all calls to the backend API.
// Every other file should import from here rather than calling fetch()
// directly, so the base URL and auth header logic only exist in one place.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || (data.errors && data.errors.join(', ')) || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),

  // Listings (backend route path is /posts; each item is a marketplace listing)
  // Supports optional category filter, text search, sort, and pagination -
  // all via query params on the same GET /posts endpoint.
  getPosts: ({ page = 1, limit = 10, category = '', search = '', sort = '' } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    return request(`/posts?${params.toString()}`);
  },
  getPost: (id) => request(`/posts/${id}`),
  createPost: (payload) => request('/posts', { method: 'POST', body: JSON.stringify(payload) }),
  updatePost: (id, payload) => request(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  toggleLike: (id) => request(`/posts/${id}/like`, { method: 'PATCH' }),
  toggleDislike: (id) => request(`/posts/${id}/dislike`, { method: 'PATCH' }),

  // Comments (nested under a listing)
  getComments: (postId) => request(`/posts/${postId}/comments`),
  createComment: (postId, payload) =>
    request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteComment: (postId, commentId) =>
    request(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),

  // Users
  getUser: (id) => request(`/users/${id}`),
  getUserPosts: (id) => request(`/users/${id}/posts`),
  updateMe: (payload) => request('/users/me', { method: 'PUT', body: JSON.stringify(payload) }),
  exportData: () => request('/users/export'),
  importData: (payload) => request('/users/import', { method: 'POST', body: JSON.stringify(payload) }),

  // Health
  health: () => request('/health'),
};

export default request;
