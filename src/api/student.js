import { apiFetch } from "@/api/client";

export const studentApi = {
  getCertificates: () => apiFetch("/student/certificates", { method: "GET" }),
  getStats: () => apiFetch("/student/certificates/stats", { method: "GET" }),
};
