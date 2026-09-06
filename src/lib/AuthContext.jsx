import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "@/api/auth";
import { ApiError } from "@/api/client";
import { clearStoredOrgId, getStoredOrgId, setStoredOrgId } from "@/lib/orgStorage";

const AuthContext = createContext(null);

function hydrateOrgId(organizations) {
  const list = Array.isArray(organizations) ? organizations : [];
  if (!list.length) {
    clearStoredOrgId();
    return null;
  }
  const stored = getStoredOrgId();
  if (stored && list.some((o) => o.org_id === stored)) {
    return stored;
  }
  const primary = list[0]?.org_id;
  if (primary) {
    setStoredOrgId(primary);
    return primary;
  }
  clearStoredOrgId();
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [orgId, setOrgIdState] = useState(() => getStoredOrgId());

  const setOrgId = useCallback((id) => {
    setStoredOrgId(id);
    setOrgIdState(id);
  }, []);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const me = await authApi.me();
      const organizations = me.organizations || [];
      const resolvedOrgId = hydrateOrgId(organizations);
      const profile = {
        id: me.user_id,
        email: me.email,
        full_name: me.full_name || me.email?.split("@")[0] || "User",
        country: me.country,
        website: me.website,
        account_type: me.account_type,
        has_organization: !!me.has_organization || organizations.length > 0,
        providers: me.providers || [],
        organizations,
        is_admin: me.is_admin || false,
      };
      setUser(profile);
      setIsAuthenticated(true);
      setOrgIdState(resolvedOrgId);
      return profile;
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setAuthError({ type: "auth_required", message: "Authentication required" });
      } else if (err?.status === 401 || err?.status === 403) {
        setAuthError({ type: "auth_required", message: "Authentication required" });
      } else if (err) {
        setAuthError({ type: "unknown", message: err.message || "Failed to load session" });
      }
      return null;
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  const login = async (email, password, portal) => {
    const res = await authApi.login(email, password, portal);
    if (res?.user_id) {
      const organizations = res.organizations || [];
      const resolvedOrgId = hydrateOrgId(organizations);
      const profile = {
        id: res.user_id,
        email: res.email,
        full_name: res.full_name || res.email?.split("@")[0] || "User",
        account_type: res.account_type,
        has_organization: !!res.has_organization || organizations.length > 0,
        organizations,
        is_admin: res.is_admin || false,
      };
      setUser(profile);
      setIsAuthenticated(true);
      setOrgIdState(resolvedOrgId);
      return profile;
    }
    return await checkUserAuth();
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    setUser(null);
    setIsAuthenticated(false);
    clearStoredOrgId();
    setOrgIdState(null);
    if (shouldRedirect) {
      window.location.href = "/login";
    }
  };

  const navigateToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        authChecked,
        authError,
        orgId,
        setOrgId,
        login,
        logout,
        navigateToLogin,
        checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
