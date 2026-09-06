import { axiosInstance, googleOAuthRedirectUrl } from "@/api/axiosInstance";

export const authApi = {
  me: () => axiosInstance.get("/auth/me"),
  signup: (email, password) =>
    axiosInstance.post("/auth/signup", { email, password }),
  login: (email, password, portal) =>
    axiosInstance.post("/auth/login", { email, password, portal }),
  logout: () => axiosInstance.post("/auth/logout"),
  verifyEmail: (token) =>
    axiosInstance.post("/auth/verify-email", { token }),
  resendVerification: (email) =>
    axiosInstance.post("/auth/resend-verification", { email }),
  forgotPassword: (email) =>
    axiosInstance.post("/auth/forgot-password", { email }),
  resetPassword: (token, new_password) =>
    axiosInstance.post("/auth/reset-password", { token, new_password }),
  updateProfile: (data) => axiosInstance.put("/auth/me", data),
  startGoogle: () => {
    window.location.href = googleOAuthRedirectUrl();
  },
};
