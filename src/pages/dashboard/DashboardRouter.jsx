import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { getStoredOrgId } from "@/lib/orgStorage";
import { Loader2 } from "lucide-react";

export default function DashboardRouter() {
  const { user, isAuthenticated, authChecked } = useAuth();
  const [state, setState] = useState("loading");

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated || !user) {
      setState("login");
      return;
    }

    if (user.is_admin) {
      setState("admin");
      return;
    }

    const accountType = user.account_type;
    const orgId = getStoredOrgId();

    if (accountType === "organization") {
      // Need an org on the server (or a stored org_id from create). Lost org_id alone still allows shell.
      if (!user.has_organization && !orgId) {
        setState("onboard");
      } else {
        const org = user.organizations?.[0];
        if (org && org.status === "pending") {
          setState("pending");
        } else {
          setState("org");
        }
      }
      return;
    }

    if (accountType === "individual") {
      setState("individual");
      return;
    }

    // Unset or unknown account_type means they haven't completed onboarding
    setState("onboard");
  }, [authChecked, isAuthenticated, user]);

  if (!authChecked || state === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-secondary" />
      </div>
    );
  }
  if (state === "login") return <Navigate to="/login" replace />;
  if (state === "onboard") return <Navigate to="/onboarding" replace />;
  if (state === "pending") return <Navigate to="/app/organization/pending" replace />;
  if (state === "org") return <Navigate to="/app/organization" replace />;
  if (state === "admin") return <Navigate to="/app/admin" replace />;
  return <Navigate to="/app/individual" replace />;
}
