const ORG_STORAGE_KEY = "trustdocs_org_id";

export function getStoredOrgId() {
  try {
    return sessionStorage.getItem(ORG_STORAGE_KEY) || localStorage.getItem(ORG_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredOrgId(orgId) {
  try {
    if (orgId) {
      sessionStorage.setItem(ORG_STORAGE_KEY, orgId);
      localStorage.setItem(ORG_STORAGE_KEY, orgId);
    } else {
      sessionStorage.removeItem(ORG_STORAGE_KEY);
      localStorage.removeItem(ORG_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function clearStoredOrgId() {
  setStoredOrgId(null);
}
