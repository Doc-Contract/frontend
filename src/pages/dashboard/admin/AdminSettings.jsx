import React, { useEffect, useState, useCallback } from "react";
import {
  Settings,
  ShieldCheck,
  HardDrive,
  Mail,
  Clock,
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/api/admin";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Form state
  const [form, setForm] = useState({
    auto_approve_organizations: false,
    default_storage_quota_mb: 5120,
    support_email: "support@trustdocs.io",
    session_idle_timeout_minutes: 60,
    require_wallet_verification: false,
    updated_at: null,
    updated_by: "",
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.getSettings();
      if (data) {
        setForm({
          auto_approve_organizations: Boolean(data.auto_approve_organizations),
          default_storage_quota_mb: data.default_storage_quota_mb || 5120,
          support_email: data.support_email || "support@trustdocs.io",
          session_idle_timeout_minutes: data.session_idle_timeout_minutes || 60,
          require_wallet_verification: Boolean(data.require_wallet_verification),
          updated_at: data.updated_at,
          updated_by: data.updated_by || "system",
        });
      }
    } catch (err) {
      setError(err.message || "Failed to load platform settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        auto_approve_organizations: form.auto_approve_organizations,
        default_storage_quota_mb: Number(form.default_storage_quota_mb),
        support_email: form.support_email.trim(),
        session_idle_timeout_minutes: Number(form.session_idle_timeout_minutes),
        require_wallet_verification: form.require_wallet_verification,
      };

      const updated = await adminApi.updateSettings(payload);
      if (updated) {
        setForm((prev) => ({
          ...prev,
          ...updated,
        }));
      }
      setToastMsg("✓ Platform settings updated successfully and saved to database.");
      setTimeout(() => setToastMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* TOAST */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-medium shadow-xl transition-all ${
            toastMsg.startsWith("✓") ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toastMsg.startsWith("✓") ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {toastMsg}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
            Platform Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure system-wide organization onboarding, quota thresholds, security, and notification policies.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSettings} disabled={loading || saving}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Reload
        </Button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-border bg-card">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          <p className="mt-2 text-xs text-muted-foreground">Loading configuration from database...</p>
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* CARD 1: ORGANIZATION & ONBOARDING */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Organization Verification Policy</h2>
                <p className="text-xs text-muted-foreground">Control how new tenant organizations gain issuance access.</p>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-foreground cursor-pointer" htmlFor="auto_approve">
                  Auto-Approve Organizations
                </label>
                <p className="text-xs text-muted-foreground max-w-xl">
                  When enabled, newly created organizations bypass the <strong>Pending Review</strong> queue and can immediately issue credentials. When disabled, an administrator must approve them.
                </p>
              </div>
              <input
                id="auto_approve"
                type="checkbox"
                checked={form.auto_approve_organizations}
                onChange={(e) =>
                  setForm((f) => ({ ...f, auto_approve_organizations: e.target.checked }))
                }
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary mt-1 cursor-pointer"
              />
            </div>
          </div>

          {/* CARD 2: STORAGE & QUOTAS */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <HardDrive className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Storage & Resource Limits</h2>
                <p className="text-xs text-muted-foreground">Set default resource boundaries across tenant organizations.</p>
              </div>
            </div>

            <div className="space-y-1.5 max-w-md">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Default Storage Quota (MB)
              </label>
              <input
                type="number"
                min="512"
                max="1048576"
                step="512"
                value={form.default_storage_quota_mb}
                onChange={(e) =>
                  setForm((f) => ({ ...f, default_storage_quota_mb: Number(e.target.value) }))
                }
                required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Storage allocated per organization for documents and evidence packages (e.g., 5120 MB = 5 GiB).
              </p>
            </div>
          </div>

          {/* CARD 3: COMMUNICATIONS & SECURITY */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">System Communications & Security</h2>
                <p className="text-xs text-muted-foreground">Global administrative contact and session policies.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Support & Notice Email
                </label>
                <input
                  type="email"
                  value={form.support_email}
                  onChange={(e) => setForm((f) => ({ ...f, support_email: e.target.value }))}
                  required
                  placeholder="support@trustdocs.io"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Sender address displayed in emails and certificate verification inquiries.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Session Inactivity Timeout (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={form.session_idle_timeout_minutes}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      session_idle_timeout_minutes: Number(e.target.value),
                    }))
                  }
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Admin portal session expiry threshold for security audits.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-foreground cursor-pointer" htmlFor="require_wallet">
                  Require Wallet Verification for Credential Issuance
                </label>
                <p className="text-xs text-muted-foreground max-w-xl">
                  Enforces Web3 MetaMask wallet authentication before any organization member can sign or issue envelopes.
                </p>
              </div>
              <input
                id="require_wallet"
                type="checkbox"
                checked={form.require_wallet_verification}
                onChange={(e) =>
                  setForm((f) => ({ ...f, require_wallet_verification: e.target.checked }))
                }
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary mt-1 cursor-pointer"
              />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-muted-foreground">
              {form.updated_at ? (
                <>
                  Last saved:{" "}
                  <strong>{new Date(form.updated_at).toLocaleString()}</strong>
                  {form.updated_by ? ` by ${form.updated_by}` : ""}
                </>
              ) : (
                "Settings loaded from database"
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchSettings}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saving} className="min-w-[130px]">
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
