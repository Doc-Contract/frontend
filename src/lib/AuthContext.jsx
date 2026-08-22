import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "@/api/auth";
import { ApiError } from "@/api/client";
import { clearStoredOrgId, getStoredOrgId, setStoredOrgId } from "@/lib/orgStorage";

const AuthContext = createContext(null);

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
      setUser({
        id: me.user_id,
        email: me.email,
        full_name: me.email?.split("@")[0] || "User",
        has_organization: !!me.has_organization,
        providers: me.providers || [],
      });
      setIsAuthenticated(true);
      if (me.has_organization && !getStoredOrgId()) {
        // Org exists server-side but client lost org_id — user must re-select/create is not available;
        // keep null; DashboardRouter will still treat has_organization as onboarded org path when org_id present.
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setAuthError({ type: "auth_required", message: "Authentication required" });
      } else if (err) {
        setAuthError({ type: "unknown", message: err.message || "Failed to load session" });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

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
