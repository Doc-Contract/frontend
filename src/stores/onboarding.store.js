import { create } from 'zustand';
import { authApi } from '@/api/auth';
import { orgsApi } from '@/api/orgs';
import { slugify } from '@/lib/utils';

export const useOnboardingStore = create((set) => ({
  isSaving: false,
  error: null,

  completeSetup: async (data, setOrgId) => {
    set({ isSaving: true, error: null });

    try {
      // 1. Update the user profile details
      await authApi.updateProfile({
        full_name: data.full_name,
        country: data.country,
        website: data.website,
        account_type: data.account_type,
      });

      // 2. Create organization if applicable
      if (data.account_type === "organization") {
        const name = data.org_name.trim();
        const org = await orgsApi.create({
          name,
          slug: slugify(name),
        });
        
        if (setOrgId) {
          setOrgId(org.org_id);
        }
        
        return "organization";
      }

      return "individual";
    } catch (err) {
      const errorMessage = err.message || "Something went wrong saving your setup. Please try again.";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isSaving: false });
    }
  },

  clearError: () => set({ error: null })
}));
