import { apiFetch } from "@/api/client";

export const documentsApi = {
  upload: (file, orgId) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch("/documents/upload", {
      method: "POST",
      body: form,
      orgId,
      withOrg: true,
    });
  },
};

export const envelopesApi = {
  list: (orgId) => apiFetch("/envelopes", { withOrg: true, orgId }),
  create: (body, orgId) =>
    apiFetch("/envelopes", { method: "POST", body, withOrg: true, orgId }),
  send: (id, orgId) =>
    apiFetch(`/envelopes/${id}/send`, { method: "POST", withOrg: true, orgId }),
};
