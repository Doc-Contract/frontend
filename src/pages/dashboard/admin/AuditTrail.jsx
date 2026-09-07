import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollText,
  RefreshCw,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/api/admin";

const ACTION_OPTIONS = [
  { value: "all", label: "All Events" },
  { value: "ORG_APPROVED", label: "Org Approved" },
  { value: "ORG_SUSPENDED", label: "Org Suspended" },
  { value: "ORG_REINSTATED", label: "Org Reinstated" },
  { value: "SETTINGS_UPDATED", label: "Settings Updated" },
  { value: "ORG_CREATED", label: "Org Created" },
];

function getActionBadge(action) {
  switch (action) {
    case "ORG_APPROVED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          Approved
        </span>
      );
    case "ORG_SUSPENDED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-200">
          <ShieldAlert className="h-3 w-3 text-red-600" />
          Suspended
        </span>
      );
    case "ORG_REINSTATED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 border border-cyan-200">
          <CheckCircle2 className="h-3 w-3 text-cyan-600" />
          Reinstated
        </span>
      );
    case "SETTINGS_UPDATED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
          <Sliders className="h-3 w-3 text-blue-600" />
          Config Changed
        </span>
      );
    case "ORG_CREATED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200">
          <Building2 className="h-3 w-3 text-purple-600" />
          Org Registered
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border">
          {action}
        </span>
      );
  }
}

function formatDetails(details) {
  if (!details || Object.keys(details).length === 0) {
    return <span className="text-muted-foreground italic text-xs">—</span>;
  }
  if (details.reason) {
    return (
      <span className="text-xs text-foreground font-medium">
        Reason: <span className="text-red-700 font-normal">{details.reason}</span>
      </span>
    );
  }
  const keys = Object.keys(details);
  return (
    <div className="text-xs text-muted-foreground space-y-0.5">
      {keys.slice(0, 3).map((k) => (
        <span key={k} className="inline-block mr-2 font-mono text-[11px] bg-muted/60 px-1.5 py-0.5 rounded">
          {k}: {String(details[k])}
        </span>
      ))}
      {keys.length > 3 && <span className="text-[10px] text-muted-foreground">+{keys.length - 3} more</span>}
    </div>
  );
}

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const limit = 15;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getAuditLogs({
        page,
        limit,
        search: search.trim(),
        action: actionFilter,
      });
      setLogs(Array.isArray(res?.logs) ? res.logs : []);
      setTotal(res?.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">Audit Trail</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Immutable log of all administrative actions, policy modifications, and entity status changes.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by actor, target, or action..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
            Total: <strong>{total}</strong> records
          </span>
        </div>
      </div>

      {/* AUDIT TABLE */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            <p className="mt-2 text-xs text-muted-foreground">Loading audit records from database...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 p-6 text-sm text-red-600 bg-red-50/50">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <ScrollText className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">No audit records found</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              {search || actionFilter !== "all"
                ? "No log entries match your filter criteria. Try clearing search or filters."
                : "Administrative actions like approving or suspending organizations will be recorded here."}
            </p>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-5">Actor</th>
                  <th className="py-3.5 px-5">Event</th>
                  <th className="py-3.5 px-5">Target</th>
                  <th className="py-3.5 px-5">Details</th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => {
                  const dateStr = log.created_at
                    ? new Date(log.created_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "—";

                  return (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-5 whitespace-nowrap text-xs text-muted-foreground font-mono">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                            <User className="h-3 w-3" />
                          </div>
                          <span className="text-xs font-medium text-foreground">{log.actor_email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {log.target_name || log.target_id || "System"}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {log.target_type}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 max-w-xs truncate">
                        {formatDetails(log.details)}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                          {log.status || "success"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {!loading && !error && total > limit && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3.5 text-xs text-muted-foreground">
            <span>
              Page {page} of {totalPages} ({total} total entries)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-2.5"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 px-2.5"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
