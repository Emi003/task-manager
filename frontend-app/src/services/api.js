import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);

export const getTasks    = ()         => api.get('/tasks');
export const createTask  = (data)     => api.post('/tasks', data);
export const updateTask  = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask  = (id)       => api.delete(`/tasks/${id}`);
