import { apiFetch } from "@/api/client";

export const walletApi = {
  nonce: (address) =>
    apiFetch("/auth/wallet/nonce", { method: "POST", body: { address } }),
  verify: (address, signature) =>
    apiFetch("/auth/wallet/verify", { method: "POST", body: { address, signature } }),
};
