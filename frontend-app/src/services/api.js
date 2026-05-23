import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);

// Tasks
export const getTasks   = ()         => api.get('/tasks');
export const createTask = (data)     => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id)       => api.delete(`/tasks/${id}`);

// Habits
export const getHabits     = ()         => api.get('/habits');
export const createHabit   = (data)     => api.post('/habits', data);
export const updateHabit   = (id, data) => api.put(`/habits/${id}`, data);
export const deleteHabit   = (id)       => api.delete(`/habits/${id}`);
export const toggleHabit   = (id)       => api.post(`/habits/${id}/toggle`);
export const getHabitStats = (id)       => api.get(`/habits/${id}/stats`);
