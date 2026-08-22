import { apiFetch } from "@/api/client";

/** Public signer APIs — JWT lives in the path; no org header. */
export const signApi = {
  get: (token) => apiFetch(`/sign/${encodeURIComponent(token)}`),
  requestOtp: (token) =>
    apiFetch(`/sign/${encodeURIComponent(token)}/otp`, { method: "POST" }),
  verifyOtp: (token, code) =>
    apiFetch(`/sign/${encodeURIComponent(token)}/otp/verify`, {
      method: "POST",
      body: { code },
    }),
  submit: (token, signatureConsent = "I consent to sign this document electronically") =>
    apiFetch(`/sign/${encodeURIComponent(token)}/submit`, {
      method: "POST",
      body: { signature_consent: signatureConsent },
    }),
};
