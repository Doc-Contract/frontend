import { apiFetch, googleOAuthRedirectUrl } from "@/api/client";

export const authApi = {
  me: () => apiFetch("/auth/me"),
  signup: (email, password) =>
    apiFetch("/auth/signup", { method: "POST", body: { email, password } }),
  login: (email, password) =>
    apiFetch("/auth/login", { method: "POST", body: { email, password } }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  verifyEmail: (token) =>
    apiFetch("/auth/verify-email", { method: "POST", body: { token } }),
  resendVerification: (email) =>
    apiFetch("/auth/resend-verification", { method: "POST", body: { email } }),
  forgotPassword: (email) =>
    apiFetch("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token, new_password) =>
    apiFetch("/auth/reset-password", { method: "POST", body: { token, new_password } }),
  startGoogle: () => {
    window.location.href = googleOAuthRedirectUrl();
  },
};
