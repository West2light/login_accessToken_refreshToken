import axios from 'axios';
import { getAccessToken, removeAccessToken } from '../utils/cookies';
import { isTokenExpired } from '../utils/jwt';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    if (isTokenExpired(token)) {
      removeAccessToken();
      window.location.href = '/login';
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAccessToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);