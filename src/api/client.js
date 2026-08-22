import { getStoredOrgId } from "@/lib/orgStorage";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, { status, error, detail, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.error = error;
    this.detail = detail;
    this.data = data;
  }
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/**
 * Cookie-session fetch against Doc-Contract /api/v1.
 * Always sends credentials. Optionally attaches X-Organization-ID.
 */
export async function apiFetch(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    orgId,
    withOrg = false,
    ...rest
  } = options;

  const resolvedOrgId = orgId ?? (withOrg ? getStoredOrgId() : null);
  const finalHeaders = { ...headers };

  if (body != null && !(body instanceof FormData) && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }
  if (resolvedOrgId) {
    finalHeaders["X-Organization-ID"] = resolvedOrgId;
  }

  const res = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
    method,
    credentials: "include",
    headers: finalHeaders,
    body: body == null || body instanceof FormData ? body : JSON.stringify(body),
    ...rest,
  });

  const data = await parseBody(res);

  if (!res.ok) {
    const message =
      data?.detail || data?.error || data?.message || res.statusText || "Request failed";
    throw new ApiError(message, {
      status: res.status,
      error: data?.error,
      detail: data?.detail,
      data,
    });
  }

  return data;
}

export function apiBaseUrl() {
  return API_BASE;
}

export function googleOAuthRedirectUrl() {
  return `${API_BASE}/auth/google/redirect`;
}
