import React, { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { LoadingState, EmptyState } from "@/components/StateViews";
import { Link } from "react-router-dom";
import { studentApi } from "@/api/student";
import {
  Inbox,
  BadgeCheck,
  PenLine,
  CheckCircle2,
  ArrowRight,
  Download,
  ExternalLink,
  ShieldCheck,
  Building2,
  Loader2,
} from "lucide-react";

export default function IndividualOverview() {
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState({
    received_documents: 0,
    active_credentials: 0,
    awaiting_signature: 0,
    completed_signatures: 0,
  });
  const [downloadingId, setDownloadingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [certsData, statsData] = await Promise.allSettled([
        studentApi.getCertificates(),
        studentApi.getStats(),
      ]);

      if (certsData.status === "fulfilled" && Array.isArray(certsData.value)) {
        setDocs(certsData.value);
      }

      if (statsData.status === "fulfilled" && statsData.value) {
        setStats(statsData.value);
      }
    } catch (err) {
      console.error("Failed to load student dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownload = async (doc) => {
    setDownloadingId(doc.id);
    try {
      const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");
      const res = await fetch(`${API_BASE}/documents/file/${doc.document_hash}.pdf`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Could not retrieve certificate file");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${(doc.title || "certificate").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("Failed to download certificate: " + (err.message || "Unknown error"));
    } finally {
      setDownloadingId(null);
    }
  };

  const recentDocs = docs.slice(0, 5);

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
          value={loading ? null : stats.received_documents}
          icon={Inbox}
          tone="blue"
          loading={loading}
        />
        <StatCard
          label="Active Credentials"
          value={loading ? null : stats.active_credentials}
          icon={BadgeCheck}
          tone="green"
          loading={loading}
        />
        <StatCard
          label="Awaiting My Signature"
          value={loading ? null : stats.awaiting_signature}
          icon={PenLine}
          tone="amber"
          loading={loading}
        />
        <StatCard
          label="Completed Signatures"
          value={loading ? null : stats.completed_signatures}
          icon={CheckCircle2}
          tone="green"
          loading={loading}
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recent documents</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Certificates and credentials assigned to you</p>
          </div>
          {docs.length > 0 && (
            <Link
              to="/app/individual/received"
              className="text-sm text-secondary hover:underline inline-flex items-center gap-1 font-medium"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingState />
        ) : docs.length === 0 ? (
          <EmptyState
            title="No certificates yet"
            description="No certificates have been issued to you yet."
          />
        ) : (
          <ul className="divide-y divide-border">
            {recentDocs.map((d) => {
              const formattedDate = d.created_at
                ? new Date(d.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—";

              return (
                <li key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-muted/20 transition-colors">
                  <div className="min-w-0 space-y-1">
                    <p className="text-base font-semibold text-foreground truncate">{d.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {d.issuer_name}
                      </span>
                      <span>&middot;</span>
                      <span>Issued: {formattedDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <StatusBadge status={d.status} size="sm" />

                    <a
                      href={`/verify/${d.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors inline-flex items-center justify-center"
                      title="View public verification"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDownload(d)}
                      disabled={downloadingId === d.id}
                      className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors inline-flex items-center justify-center"
                      title="Download PDF"
                    >
                      {downloadingId === d.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
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
