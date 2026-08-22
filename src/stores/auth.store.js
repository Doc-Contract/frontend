import { create } from 'zustand';
import { authApi } from '@/api/auth';
import { getStoredOrgId, setStoredOrgId, clearStoredOrgId } from '@/lib/orgStorage';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  authChecked: false,
  authError: null,
  orgId: getStoredOrgId(),

  setOrgId: (id) => {
    setStoredOrgId(id);
    set({ orgId: id });
  },

  checkUserAuth: async () => {
    set({ isLoadingAuth: true, authError: null });
    try {
      const me = await authApi.me();
      set({
        user: {
          id: me.user_id,
          email: me.email,
          full_name: me.email?.split("@")[0] || "User",
          has_organization: !!me.has_organization,
          providers: me.providers || [],
        },
        isAuthenticated: true,
      });
      // Optionally handle missing client org_id here if needed
    } catch (err) {
      set({ user: null, isAuthenticated: false });
      if (err.status === 401 || err.status === 403) {
        set({ authError: { type: "auth_required", message: "Authentication required" } });
      } else if (err) {
        set({ authError: { type: "unknown", message: err.message || "Failed to load session" } });
      }
    } finally {
      set({ isLoadingAuth: false, authChecked: true });
    }
  },

  login: async (email, password) => {
    await authApi.login(email, password);
    await get().checkUserAuth();
  },

  logout: async (shouldRedirect = true) => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    set({ user: null, isAuthenticated: false, orgId: null });
    clearStoredOrgId();
    if (shouldRedirect) {
      window.location.href = "/login";
    }
  },

  navigateToLogin: () => {
    window.location.href = "/login";
  }
}));
