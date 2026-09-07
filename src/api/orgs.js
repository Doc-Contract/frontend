import { apiFetch } from "@/api/client";

export const orgsApi = {
  create: ({ name, slug }) =>
    apiFetch("/orgs", { method: "POST", body: { name, slug } }),
  invite: ({ email, role }, orgId) =>
    apiFetch("/orgs/invite", {
      method: "POST",
      body: { email, role },
      orgId,
      withOrg: true,
    }),
  getPending: () =>
    apiFetch("/admin/orgs/pending", { method: "GET" }),
  getVerified: () =>
    apiFetch("/admin/orgs/verified", { method: "GET" }),
  getSuspended: () =>
    apiFetch("/admin/orgs/suspended", { method: "GET" }),
  getStats: () =>
    apiFetch("/admin/stats", { method: "GET" }),
  verify: (orgId) =>
    apiFetch(`/admin/orgs/${orgId}/verify`, { method: "POST" }),
  suspend: (orgId, reason) =>
    apiFetch(`/admin/orgs/${orgId}/suspend`, {
      method: "POST",
      body: { reason },
    }),
};
