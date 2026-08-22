import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { getStoredOrgId } from "@/lib/orgStorage";
import { Loader2 } from "lucide-react";

const ACCOUNT_TYPE_KEY = "trustdocs_account_type";
const SHELL_KEY = "trustdocs_shell";

function readAccountType() {
  try {
    return sessionStorage.getItem(ACCOUNT_TYPE_KEY);
  } catch {
    return null;
  }
}

function readShell() {
  try {
    return sessionStorage.getItem(SHELL_KEY);
  } catch {
    return null;
  }
}

export default function DashboardRouter() {
  const { user, isAuthenticated, authChecked } = useAuth();
  const [state, setState] = useState("loading");

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated || !user) {
      setState("login");
      return;
    }

    // Never set trustdocs_shell=admin in app code; only honor if already present.
    if (readShell() === "admin") {
      setState("admin");
      return;
    }

    const accountType = readAccountType();
    const orgId = getStoredOrgId();

    if (accountType === "organization") {
      // Need an org on the server (or a stored org_id from create). Lost org_id alone still allows shell.
      if (!user.has_organization && !orgId) {
        setState("onboard");
      } else {
        setState("org");
      }
      return;
    }

    if (accountType === "individual") {
      setState("individual");
      return;
    }

    // No account_type yet — prefer onboarding unless org context already exists.
    if (orgId || user.has_organization) {
      setState("org");
      return;
    }

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
  if (state === "org") return <Navigate to="/app/organization" replace />;
  if (state === "admin") return <Navigate to="/app/admin" replace />;
  return <Navigate to="/app/individual" replace />;
}
