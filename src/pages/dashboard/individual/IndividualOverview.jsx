import React, { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { LoadingState, EmptyState } from "@/components/StateViews";
import { Link } from "react-router-dom";
import {
  Inbox,
  BadgeCheck,
  PenLine,
  CheckCircle2,
  ArrowRight,
  Share2,
  Download,
} from "lucide-react";

const MOCK_STATS = {
  received_documents: 12,
  active_credentials: 10,
  awaiting_signature: 2,
  completed_signatures: 8,
};

const MOCK_DOCS = [
  { id: "demo-1", title: "B.Sc. Computer Science", issuer: "Northgate University", status: "active", date: "2025-06-14" },
  { id: "demo-2", title: "AWS Cloud Practitioner", issuer: "CloudSkill Institute", status: "active", date: "2025-03-02" },
  { id: "demo-3", title: "Service Agreement", issuer: "Acme Corp", status: "awaiting", date: "2025-08-10" },
];

export default function IndividualOverview() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your credentials, documents and signatures in one place.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Received Documents"
          value={loading ? null : MOCK_STATS.received_documents}
          icon={Inbox}
          tone="blue"
          loading={loading}
        />
        <StatCard
          label="Active Credentials"
          value={loading ? null : MOCK_STATS.active_credentials}
          icon={BadgeCheck}
          tone="green"
          loading={loading}
        />
        <StatCard
          label="Awaiting My Signature"
          value={loading ? null : MOCK_STATS.awaiting_signature}
          icon={PenLine}
          tone="amber"
          loading={loading}
        />
        <StatCard
          label="Completed Signatures"
          value={loading ? null : MOCK_STATS.completed_signatures}
          icon={CheckCircle2}
          tone="green"
          loading={loading}
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Recent documents</h2>
          <Link
            to="/app/individual/received"
            className="text-sm text-secondary hover:underline inline-flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <LoadingState />
        ) : MOCK_DOCS.length === 0 ? (
          <EmptyState title="No documents yet" description="Documents issued to you will appear here." />
        ) : (
          <ul className="divide-y divide-border">
            {MOCK_DOCS.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {d.issuer} · {d.date}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={d.status} size="sm" />
                  <button
                    type="button"
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
