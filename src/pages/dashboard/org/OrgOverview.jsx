import React, { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { LoadingState, EmptyState } from "@/components/StateViews";
import { Button } from "@/components/ui/button";
import {
  FileCheck2,
  BadgeCheck,
  ShieldCheck,
  PenLine,
  CheckCircle2,
  Ban,
  ArrowRight,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";

const MOCK_STATS = {
  documents_issued: 1284,
  active_credentials: 1190,
  verification_checks: 8420,
  pending_signatures: 7,
  completed_signatures: 312,
  revoked_documents: 14,
};

const MOCK_ACTIVITY = [
  { id: 1, action: "Document issued", target: "B.Sc. Computer Science — A. Mehta", time: "2 hours ago", status: "active" },
  { id: 2, action: "Verification performed", target: "Envelope verified by third party", time: "5 hours ago", status: "verified" },
  { id: 3, action: "Signature completed", target: "Service Agreement — J. Rao", time: "Yesterday", status: "completed" },
  { id: 4, action: "Document revoked", target: "Prior credential revoked", time: "2 days ago", status: "revoked" },
];

export default function OrgOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setStats(MOCK_STATS);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of your organization's document trust activity.
        </p>
      </div>

      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
        <Building2 className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">Organization verification in progress</p>
            <StatusBadge status="Pending Verification" size="sm" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Your organization is being reviewed. You can explore the platform; live envelope APIs wire in next.
          </p>
        </div>
        <Link to="/app/organization/verification">
          <Button variant="outline" size="sm">
            View status
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Documents Issued"
          value={loading ? null : stats?.documents_issued}
          icon={FileCheck2}
          tone="blue"
          loading={loading}
        />
        <StatCard
          label="Active Credentials"
          value={loading ? null : stats?.active_credentials}
          icon={BadgeCheck}
          tone="green"
          loading={loading}
        />
        <StatCard
          label="Verification Checks"
          value={loading ? null : stats?.verification_checks}
          icon={ShieldCheck}
          tone="indigo"
          loading={loading}
        />
        <StatCard
          label="Pending Signatures"
          value={loading ? null : stats?.pending_signatures}
          icon={PenLine}
          tone="amber"
          loading={loading}
        />
        <StatCard
          label="Completed Signatures"
          value={loading ? null : stats?.completed_signatures}
          icon={CheckCircle2}
          tone="green"
          loading={loading}
        />
        <StatCard
          label="Revoked Documents"
          value={loading ? null : stats?.revoked_documents}
          icon={Ban}
          tone="red"
          loading={loading}
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Recent activity</h2>
          <Link
            to="/app/organization/audit"
            className="text-sm text-secondary hover:underline inline-flex items-center gap-1"
          >
            View audit trail <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <LoadingState />
        ) : MOCK_ACTIVITY.length === 0 ? (
          <EmptyState title="No activity yet" description="Actions your organization takes will appear here." />
        ) : (
          <ul className="divide-y divide-border">
            {MOCK_ACTIVITY.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.action}</p>
                  <p className="text-sm text-muted-foreground truncate">{a.target}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={a.status} size="sm" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
