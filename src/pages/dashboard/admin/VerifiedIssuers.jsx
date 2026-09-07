import React, { useEffect, useState, useCallback } from "react";
import { Building2, BadgeCheck, Loader2, AlertCircle, RefreshCw, Ban, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { orgsApi } from "@/api/orgs";

export default function VerifiedIssuers() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Suspension modal & action state
  const [selectedOrgForSuspend, setSelectedOrgForSuspend] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspending, setSuspending] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const fetchVerified = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await orgsApi.getVerified();
      setOrgs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load verified organizations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerified();
  }, [fetchVerified]);

  const handleOpenSuspendModal = (org) => {
    setSelectedOrgForSuspend(org);
    setSuspendReason("");
  };

  const handleCloseSuspendModal = () => {
    if (suspending) return;
    setSelectedOrgForSuspend(null);
    setSuspendReason("");
  };

  const handleConfirmSuspend = async (e) => {
    e.preventDefault();
    if (!selectedOrgForSuspend || suspending) return;
    const orgId = selectedOrgForSuspend.ID || selectedOrgForSuspend.id;
    const orgName = selectedOrgForSuspend.Name || selectedOrgForSuspend.name;
    const reason = suspendReason.trim() || "Suspended by administrator";

    setSuspending(true);
    try {
      await orgsApi.suspend(orgId, reason);
      setSelectedOrgForSuspend(null);
      setSuspendReason("");
      await fetchVerified();
      setToastMsg(`✓ "${orgName}" has been suspended.`);
      setTimeout(() => setToastMsg(""), 4000);
    } catch (err) {
      setToastMsg(`✗ Failed to suspend "${orgName}": ${err.message}`);
      setTimeout(() => setToastMsg(""), 4000);
    } finally {
      setSuspending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TOAST */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-medium shadow-xl transition-all ${toastMsg.startsWith("✓") ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">Verified Issuers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organizations and institutions approved to issue verifiable documents.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchVerified} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* VERIFIED LIST */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Approved Organizations</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              These organizations hold verified status and can issue credentials.
            </p>
          </div>
          {!loading && orgs.length > 0 && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              {orgs.length} verified
            </span>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 p-6 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && orgs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">No verified issuers yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Organizations approved from the Pending Review queue will appear here.
            </p>
          </div>
        )}

        {!loading && !error && orgs.length > 0 && (
          <ul className="divide-y divide-border">
            {orgs.map((org) => (
              <li key={org.ID || org.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-emerald-50">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{org.Name || org.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Slug: {org.Slug || org.slug} &middot; ID: {(org.ID || org.id)?.slice(0, 8)}…
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status="verified" size="sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenSuspendModal(org)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Ban className="mr-1.5 h-3.5 w-3.5" />
                    Suspend
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* SUSPENSION MODAL */}
      {selectedOrgForSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Ban className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Suspend Organization</h3>
                  <p className="text-xs text-muted-foreground">
                    Revoke credential issuance rights for this organization.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseSuspendModal}
                disabled={suspending}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-lg border border-red-100 bg-red-50/50 p-3.5 text-sm text-foreground space-y-1">
              <p className="text-xs text-muted-foreground">Target Organization:</p>
              <p className="font-semibold text-red-950">
                {selectedOrgForSuspend.Name || selectedOrgForSuspend.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Slug: {selectedOrgForSuspend.Slug || selectedOrgForSuspend.slug}
              </p>
            </div>

            <form onSubmit={handleConfirmSuspend} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Suspension Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Provide a reason for suspension (e.g. Terms violation, security review, invalid documentation)..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  disabled={suspending}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseSuspendModal}
                  disabled={suspending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={suspending || !suspendReason.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white min-w-[130px]"
                >
                  {suspending ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Suspending...
                    </>
                  ) : (
                    <>
                      <Ban className="mr-1.5 h-3.5 w-3.5" />
                      Suspend Organization
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

