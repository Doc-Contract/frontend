import React, { useEffect, useState, useCallback } from "react";
import { Building2, Clock, BadgeCheck, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orgsApi } from "@/api/orgs";

export default function AdminOverview() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingId, setApprovingId] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await orgsApi.getPending();
      setOrgs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load pending organizations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleVerify = async (orgId, orgName) => {
    setApprovingId(orgId);
    try {
      await orgsApi.verify(orgId);
      setOrgs((prev) => prev.filter((o) => o.ID !== orgId));
      setToastMsg(`✓ "${orgName}" has been verified and can now issue documents.`);
      setTimeout(() => setToastMsg(""), 4000);
    } catch (err) {
      setToastMsg(`✗ Failed to verify "${orgName}": ${err.message}`);
      setTimeout(() => setToastMsg(""), 4000);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* TOAST */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-medium shadow-xl transition-all
          ${toastMsg.startsWith("✓")
            ? "bg-emerald-600 text-white"
            : "bg-red-600 text-white"
          }`}
        >
          {toastMsg.startsWith("✓")
            ? <CheckCircle2 className="h-4 w-4 shrink-0" />
            : <AlertCircle className="h-4 w-4 shrink-0" />
          }
          {toastMsg}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">Admin Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and approve organization applications before they can issue documents.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPending} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{loading ? "—" : orgs.length}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <BadgeCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">—</p>
              <p className="text-xs text-muted-foreground">Verified Issuers</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">—</p>
              <p className="text-xs text-muted-foreground">Total Organizations</p>
            </div>
          </div>
        </div>
      </div>

      {/* PENDING LIST */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Pending Verification</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              These organizations are awaiting admin approval to issue documents.
            </p>
          </div>
          {!loading && orgs.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              {orgs.length} pending
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <BadgeCheck className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">All clear!</p>
            <p className="mt-1 text-sm text-muted-foreground">No organizations are pending verification.</p>
          </div>
        )}

        {!loading && !error && orgs.length > 0 && (
          <ul className="divide-y divide-border">
            {orgs.map((org) => (
              <li key={org.ID} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{org.Name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Slug: {org.Slug} &middot; ID: {org.ID?.slice(0, 8)}…
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                    Pending
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleVerify(org.ID, org.Name)}
                    disabled={approvingId === org.ID}
                    className="min-w-[90px]"
                  >
                    {approvingId === org.ID ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
