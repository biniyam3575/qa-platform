import axios from 'axios';

const axiosBase = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically add token to headers if it exists
axiosBase.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosBase;