import React, { useEffect, useState, useCallback } from "react";
import { Building2, Ban, Loader2, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { orgsApi } from "@/api/orgs";

export default function SuspendedOrgs() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reinstatingId, setReinstatingId] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const fetchSuspended = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await orgsApi.getSuspended();
      setOrgs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load suspended organizations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuspended();
  }, [fetchSuspended]);

  const handleReinstate = async (orgId, orgName) => {
    if (reinstatingId) return;
    setReinstatingId(orgId);
    try {
      await orgsApi.verify(orgId);
      await fetchSuspended();
      setToastMsg(`✓ "${orgName}" has been reinstated and returned to Verified Issuers.`);
      setTimeout(() => setToastMsg(""), 4000);
    } catch (err) {
      setToastMsg(`✗ Failed to reinstate "${orgName}": ${err.message}`);
      setTimeout(() => setToastMsg(""), 4000);
    } finally {
      setReinstatingId(null);
    }
  };

  return (
    <div className="space-y-6">
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
            Suspended Organizations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organizations whose document issuance privileges are currently suspended.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSuspended} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* SUSPENDED LIST */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Suspended Accounts</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              These organizations are temporarily restricted from issuing certificates.
            </p>
          </div>
          {!loading && orgs.length > 0 && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
              {orgs.length} suspended
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
              <Ban className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">No suspended organizations</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No organizations are currently under suspension.
            </p>
          </div>
        )}

        {!loading && !error && orgs.length > 0 && (
          <ul className="divide-y divide-border">
            {orgs.map((org) => {
              const orgId = org.ID || org.id;
              const orgName = org.Name || org.name;
              const orgSlug = org.Slug || org.slug;
              const reason = org.suspension_reason || org.SuspensionReason;

              return (
                <li key={orgId} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-red-50">
                      <Building2 className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{orgName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        Slug: {orgSlug} &middot; ID: {orgId?.slice(0, 8)}…
                      </p>
                      {reason && (
                        <p className="mt-1 text-xs text-red-600 font-medium bg-red-50/80 border border-red-100 rounded px-2 py-0.5 inline-block">
                          Reason: {reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status="suspended" size="sm" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReinstate(orgId, orgName)}
                      disabled={reinstatingId === orgId}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      {reinstatingId === orgId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                          Reinstate
                        </>
                      )}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

