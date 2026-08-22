import { apiFetch } from "@/api/client";

export const verifyApi = {
  byEnvelopeId: (envelopeId) => apiFetch(`/verify/${encodeURIComponent(envelopeId)}`),
};
