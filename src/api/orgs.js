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
};
