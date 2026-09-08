import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Mail,
  ShieldAlert,
  Award,
  FileCheck,
  CheckCircle2,
  Save,
  Check,
} from "lucide-react";

export default function NotificationPreferences() {
  const STORAGE_KEY = "trustdocs_student_notification_prefs";

  const [prefs, setPrefs] = useState({
    emailOnNewCredential: true,
    emailOnVerification: true,
    emailOnStatusChange: true,
    emailOnSecurityAlert: true,
    weeklyDigest: false,
  });

  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPrefs((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleToggle = (key) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      setSavedMsg("Preferences saved successfully!");
      setTimeout(() => setSavedMsg(""), 3500);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
            Notification Preferences
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure when and how TrustDocs delivers notifications to your registered email.
          </p>
        </div>
        <Button size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-1.5" />
          Save Changes
        </Button>
      </div>

      {/* FEEDBACK BANNER */}
      {savedMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* NOTIFICATION GROUPS */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Credential & Verification Events
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Notifications triggered by actions taken by institutions or verifiers.
          </p>
        </div>

        <div className="divide-y divide-border/60">
          {/* ITEM 1 */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">New Credential Issued</h3>
                <p className="text-xs text-muted-foreground">
                  Receive an instant email when a university or accredited institution issues you a new certificate.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("emailOnNewCredential")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefs.emailOnNewCredential ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  prefs.emailOnNewCredential ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* ITEM 2 */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <FileCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Credential Verification Alerts</h3>
                <p className="text-xs text-muted-foreground">
                  Receive an alert when an employer, recruiter, or third party scans or verifies one of your shared links.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("emailOnVerification")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefs.emailOnVerification ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  prefs.emailOnVerification ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* ITEM 3 */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shrink-0">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Status Changes & Updates</h3>
                <p className="text-xs text-muted-foreground">
                  Notify me if an issuer institution updates metadata or issues a revocation notice.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("emailOnStatusChange")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefs.emailOnStatusChange ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  prefs.emailOnStatusChange ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SECURITY ALERTS GROUP */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            Security & Authentication Alerts
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Critical security events affecting your account access.
          </p>
        </div>

        <div className="divide-y divide-border/60">
          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Security & Password Changes</h3>
              <p className="text-xs text-muted-foreground">
                Always send critical alerts whenever your password is changed or a new session is established.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("emailOnSecurityAlert")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefs.emailOnSecurityAlert ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  prefs.emailOnSecurityAlert ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
