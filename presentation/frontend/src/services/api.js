import axios from "axios";
import { getAccessToken, getRefreshToken, setAuthSession, clearAuthSession } from "./tokenStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error?.response?.status === 401;
    if (!isUnauthorized || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = axios
        .post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })
        .then((res) => {
          const nextAccessToken = res.data.accessToken;
          setAuthSession({ accessToken: nextAccessToken });
          return nextAccessToken;
        })
        .catch((refreshError) => {
          clearAuthSession();
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newAccessToken = await refreshPromise;
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return api(originalRequest);
  }
);

export default api;
