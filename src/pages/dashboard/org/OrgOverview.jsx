import React, { useCallback, useEffect, useMemo, useState } from "react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { LoadingState, EmptyState } from "@/components/StateViews";
import { Button } from "@/components/ui/button";
import {
  FileCheck2,
  BadgeCheck,
  PenLine,
  CheckCircle2,
  Ban,
  ArrowRight,
  FileEdit,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { envelopesApi } from "@/api/documents";

function countBy(envelopes, pred) {
  return envelopes.filter(pred).length;
}

export default function OrgOverview() {
  const { orgId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [envelopes, setEnvelopes] = useState([]);

  const load = useCallback(async () => {
    if (!orgId) {
      setEnvelopes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await envelopesApi.list(orgId);
      setEnvelopes(Array.isArray(data?.envelopes) ? data.envelopes : []);
    } catch (err) {
      setError(err.message || "Failed to load envelopes");
      setEnvelopes([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const status = (e) => (e.status || "").toLowerCase();
    return {
      total: envelopes.length,
      draft: countBy(envelopes, (e) => status(e) === "draft"),
      pending: countBy(envelopes, (e) => ["pending", "sent", "in_progress", "awaiting"].includes(status(e))),
      completed: countBy(envelopes, (e) => ["completed", "signed"].includes(status(e))),
      revoked: countBy(envelopes, (e) => ["voided", "revoked", "cancelled"].includes(status(e))),
    };
  }, [envelopes]);

  const recent = useMemo(() => envelopes.slice(0, 8), [envelopes]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live envelope counts for your organization.
          </p>
        </div>
        <Link to="/app/organization/send">
          <Button size="sm">Send for signature</Button>
        </Link>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total envelopes" value={loading ? null : stats.total} icon={FileCheck2} tone="blue" loading={loading} />
        <StatCard label="Drafts" value={loading ? null : stats.draft} icon={FileEdit} tone="amber" loading={loading} />
        <StatCard label="Active credentials" value={loading ? null : stats.completed} icon={BadgeCheck} tone="green" loading={loading} />
        <StatCard label="Pending signatures" value={loading ? null : stats.pending} icon={PenLine} tone="amber" loading={loading} />
        <StatCard label="Completed" value={loading ? null : stats.completed} icon={CheckCircle2} tone="green" loading={loading} />
        <StatCard label="Voided / revoked" value={loading ? null : stats.revoked} icon={Ban} tone="red" loading={loading} />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Recent envelopes</h2>
          <Link
            to="/app/organization/issued"
            className="text-sm text-secondary hover:underline inline-flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <LoadingState />
        ) : recent.length === 0 ? (
          <EmptyState
            title="No envelopes yet"
            description="Upload a PDF and send it for signature to see activity here."
            action={
              <Link to="/app/organization/issue">
                <Button size="sm">Issue document</Button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((env) => (
              <li key={env.envelope_id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{env.title || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">{env.envelope_id}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={env.status} size="sm" />
                  <Link
                    to={`/verify?envelope_id=${encodeURIComponent(env.envelope_id)}`}
                    className="text-sm text-secondary hover:underline"
                  >
                    Verify
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
