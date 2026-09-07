import { apiFetch } from "@/api/client";

export const adminApi = {
  getAuditLogs: ({ page = 1, limit = 20, search = "", action = "" } = {}) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (search) params.append("search", search);
    if (action && action !== "all") params.append("action", action);
    const qs = params.toString();
    return apiFetch(`/admin/audit-logs${qs ? `?${qs}` : ""}`, { method: "GET" });
  },

  getSettings: () =>
    apiFetch("/admin/settings", { method: "GET" }),

  updateSettings: (payload) =>
    apiFetch("/admin/settings", {
      method: "PUT",
      body: payload,
    }),
};
