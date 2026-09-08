import React, { useEffect, useState } from "react";
import { studentApi } from "@/api/student";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Building2,
  Download,
  ExternalLink,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Award,
} from "lucide-react";

export default function ReceivedDocuments() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchCertificates = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await studentApi.getCertificates();
      setCerts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleDownload = async (cert) => {
    setDownloadingId(cert.id);
    try {
      const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");
      const res = await fetch(`${API_BASE}/documents/file/${cert.document_hash}.pdf`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Could not retrieve certificate file");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${(cert.title || "certificate").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
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

  const filteredCerts = certs.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (c.title || "").toLowerCase().includes(q) ||
      (c.issuer_name || "").toLowerCase().includes(q) ||
      (c.document_hash || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (filter === "all") return true;
    if (filter === "completed") return c.status === "completed";
    if (filter === "pending") return c.status === "pending";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
            Received Documents
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verifiable credentials and certificates issued specifically to you by approved institutions.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCertificates} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, university, or hash..."
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["all", "completed", "pending"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {f === "all" ? `All (${certs.length})` : f}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Loading your certificates...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 p-6 text-sm text-red-600 bg-red-50/50">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && certs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <p className="mt-4 text-base font-semibold text-foreground">No certificates yet</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              No certificates have been issued to you yet.
            </p>
          </div>
        )}

        {/* Search Empty State */}
        {!loading && !error && certs.length > 0 && filteredCerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Search className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">No certificates match your search</p>
            <p className="mt-1 text-xs text-muted-foreground">Try clearing filters or search terms.</p>
          </div>
        )}

        {/* Certificate List */}
        {!loading && !error && filteredCerts.length > 0 && (
          <ul className="divide-y divide-border">
            {filteredCerts.map((cert) => {
              const formattedDate = cert.created_at
                ? new Date(cert.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—";

              return (
                <li
                  key={cert.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-blue-50/80 text-blue-700 mt-0.5">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="text-base font-semibold text-foreground truncate">
                          {cert.title}
                        </p>
                        <StatusBadge status={cert.status} size="sm" />
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {cert.issuer_name}
                        </span>
                        <span>&middot;</span>
                        <span>Issued: {formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <a
                      href={`/verify/${cert.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      title="View public cryptographic verification"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Verify
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>

                    <Button
                      size="sm"
                      onClick={() => handleDownload(cert)}
                      disabled={downloadingId === cert.id}
                      className="gap-1.5"
                    >
                      {downloadingId === cert.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download PDF
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
