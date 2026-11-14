import axios from 'axios';

const api = axios.create({
  baseURL: 'https://quizmaster-64bw.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling auth expirations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');
      if (!isAuthRoute && localStorage.getItem('qm_token')) {
        localStorage.removeItem('qm_token');
        localStorage.removeItem('qm_user');
        window.dispatchEvent(new Event('auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
};

// Quiz endpoints
export const quizApi = {
  getQuizzes: (params) => api.get('/quizzes', { params }),
  getQuizById: (id) => api.get(`/quizzes/${id}`),
  submitQuiz: (id, payload) => api.post(`/quizzes/${id}/submit`, payload),
};

// Attempt endpoints
export const attemptApi = {
  getUserAttempts: () => api.get('/attempts'),
  getAttemptById: (id) => api.get(`/attempts/${id}`),
  getUserStats: () => api.get('/attempts/stats'),
};

// Admin endpoints
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  createQuiz: (quizData) => api.post('/admin/quizzes', quizData),
  updateQuiz: (id, quizData) => api.put(`/admin/quizzes/${id}`, quizData),
  deleteQuiz: (id) => api.delete(`/admin/quizzes/${id}`),
  getQuizQuestions: (quizId) => api.get(`/admin/quizzes/${quizId}/questions`),
  addQuestion: (quizId, questionData) =>
    api.post(`/admin/quizzes/${quizId}/questions`, questionData),
  updateQuestion: (id, questionData) =>
    api.put(`/admin/questions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),
};

export default api;
