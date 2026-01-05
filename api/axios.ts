import axios from 'axios';
import { setAccessToken,getAccessToken,removeAccessToken } from '../utils/cookies';
import {isTokenExpired, willTokenExpireSoon} from '../utils/jwt';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(async (config) => {
  const token = getAccessToken();

  if (token) {
    if (isTokenExpired(token)) {
      removeAccessToken();
    } else if (willTokenExpireSoon(token, 300)) {
      // Token sắp hết hạn (còn < 5 phút) → refresh trước
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await axios.get(`${API_BASE_URL}/auth/refresh`, {
            withCredentials: true,
          });
          const newAccessToken = data.accessToken;
          setAccessToken(newAccessToken);
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
        } catch (error) {
          removeAccessToken();
          processQueue(error, null);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Đang refresh, đợi kết quả
        await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        const newToken = getAccessToken();
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.get(`${API_BASE_URL}/auth/refresh`, {
          withCredentials: true,
        });
      
        const newAccessToken = data.accessToken;
        
        // Lưu vào cookie với thời gian expire (ví dụ 15 phút)
        setAccessToken(newAccessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        processQueue(null, newAccessToken);
        
        return api(originalRequest);
      }
      catch (refreshError) {
        processQueue(refreshError, null);
        removeAccessToken();
        return Promise.reject(refreshError);
      }
      finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);