import axios from "axios";
import { getStoredOrgId } from "@/lib/orgStorage";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Request Interceptor: Inject X-Organization-ID
axiosInstance.interceptors.request.use(
  (config) => {
    const orgId = getStoredOrgId();
    if (orgId) {
      config.headers["X-Organization-ID"] = orgId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format Errors similarly to ApiError
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data; // Return the data directly to simplify components
  },
  (error) => {
    const data = error.response?.data;
    const message = data?.detail || data?.error || data?.message || error.message || "Request failed";
    
    // Attach additional info to the error so existing catch blocks still work somewhat similarly
    error.message = message;
    error.status = error.response?.status;
    error.detail = data?.detail;
    error.errorData = data?.error;
    
    return Promise.reject(error);
  }
);

export function googleOAuthRedirectUrl() {
  return `${API_BASE}/auth/google/redirect`;
}
