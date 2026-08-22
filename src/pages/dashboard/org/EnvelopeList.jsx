import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { envelopesApi } from "@/api/documents";
import StatusBadge from "@/components/StatusBadge";
import { LoadingState, EmptyState } from "@/components/StateViews";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw } from "lucide-react";

const STATUS_FILTERS = {
  all: null,
  draft: ["draft"],
  awaiting: ["pending", "sent", "in_progress", "awaiting"],
  completed: ["completed", "signed"],
  revoked: ["voided", "revoked", "cancelled"],
};

function matchesFilter(status, filterKey) {
  const allowed = STATUS_FILTERS[filterKey];
  if (!allowed) return true;
  const s = (status || "").toLowerCase();
  return allowed.includes(s);
}

export default function EnvelopeList({
  title = "Envelopes",
  subtitle = "Envelopes for your organization.",
  filter = "all",
  emptyTitle = "No envelopes yet",
  emptyDescription = "Create one from Issue Document or Send for Signature.",
}) {
  const { orgId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [envelopes, setEnvelopes] = useState([]);

  const load = useCallback(async () => {
    if (!orgId) {
      setEnvelopes([]);
      setLoading(false);
      setError("No organization selected.");
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

  const filtered = useMemo(
    () => envelopes.filter((e) => matchesFilter(e.status, filter)),
    [envelopes, filter]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={
              <Link to="/app/organization/send">
                <Button size="sm">Send for signature</Button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((env) => (
              <li key={env.envelope_id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{env.title || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                    {env.envelope_id}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={env.status} size="sm" />
                  <Link
                    to={`/verify?envelope_id=${encodeURIComponent(env.envelope_id)}`}
                    className="text-sm text-secondary hover:underline inline-flex items-center gap-1"
                  >
                    Verify <ExternalLink className="w-3.5 h-3.5" />
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
