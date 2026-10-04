import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach user id header on every request if logged in
apiClient.interceptors.request.use((config) => {
  try {
    const u = JSON.parse(localStorage.getItem('rechargex_user') || 'null');
    if (u?.id) config.headers['X-User-Id'] = u.id;
  } catch { /* silent */ }
  return config;
});

// Normalise error responses
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
