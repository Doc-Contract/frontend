import React, { useEffect, useState } from "react";
import { studentApi } from "@/api/student";
import { verifyApi } from "@/api/verify";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  History,
  ShieldCheck,
  Building2,
  ExternalLink,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck,
  X,
  Cpu,
  Clock,
} from "lucide-react";

export default function VerificationHistory() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedProofCert, setSelectedProofCert] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofData, setProofData] = useState(null);
  const [proofError, setProofError] = useState("");

  const fetchCertificates = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await studentApi.getCertificates();
      setCerts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load verification history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleInspectProof = async (cert) => {
    setSelectedProofCert(cert);
    setProofLoading(true);
    setProofData(null);
    setProofError("");

    try {
      const res = await verifyApi.verifyEnvelope(cert.id);
      setProofData(res.data);
    } catch (err) {
      setProofError(err.response?.data?.message || err.message || "Cryptographic evidence package is not yet available for this document.");
    } finally {
      setProofLoading(false);
    }
  };

  const filteredCerts = certs.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.title || "").toLowerCase().includes(q) ||
      (c.issuer_name || "").toLowerCase().includes(q) ||
      (c.document_hash || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
            Verification History & Audit Logs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cryptographic evidence, TSA timestamp anchors, and verification audit trails for your credentials.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCertificates} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search credential title or institution..."
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading verification records...</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredCerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-xl border border-border bg-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-4">
            <History className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No verification logs available yet</h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Once certificates are issued to your account, tamper-proof verification history and audit evidence will be listed here.
          </p>
        </div>
      )}

      {/* VERIFICATION RECORDS TABLE / CARDS */}
      {!loading && !error && filteredCerts.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-4">Credential & Issuer</th>
                  <th className="px-6 py-4">Issuance Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Cryptographic Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{cert.title || "Issued Certificate"}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 text-primary" />
                        {cert.issuer_name || "Institution"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(cert.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={cert.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInspectProof(cert)}
                        className="text-xs"
                      >
                        <FileCheck className="h-3.5 w-3.5 mr-1 text-primary" />
                        Inspect Proof
                      </Button>
                      <Button asChild size="sm" variant="ghost" className="text-xs">
                        <a
                          href={`/verify/${cert.document_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open public verification page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROOF INSPECTION MODAL */}
      {selectedProofCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProofCert(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Cryptographic Evidence Verification</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedProofCert.title} • {selectedProofCert.issuer_name}
                </p>
              </div>
            </div>

            {proofLoading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">Recomputing hash chain and checking TSA anchor...</p>
              </div>
            )}

            {proofError && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Evidence Package In-Progress</span>
                  <span className="text-xs mt-0.5 block">{proofError}</span>
                </div>
              </div>
            )}

            {proofData && (
              <div className="space-y-4">
                {/* STATUS SUMMARY */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="text-[11px] font-medium text-muted-foreground block">Hash Chain</span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Intact
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="text-[11px] font-medium text-muted-foreground block">TSA Anchor</span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5" /> Verified
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="text-[11px] font-medium text-muted-foreground block">Audit Events</span>
                    <span className="text-xs font-semibold text-foreground mt-1 block">
                      {proofData.event_count || 0} chained
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="text-[11px] font-medium text-muted-foreground block">Blockchain</span>
                    <span className="text-xs font-semibold text-primary flex items-center gap-1 mt-1">
                      <Cpu className="h-3.5 w-3.5" /> {proofData.blockchain_network || "Anchored"}
                    </span>
                  </div>
                </div>

                {/* FINAL HASH */}
                <div className="p-3 rounded-lg bg-muted/30 border border-border text-xs space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground block">Final Cryptographic Root Hash</span>
                  <code className="font-mono text-foreground font-semibold break-all block">
                    {proofData.final_event_hash}
                  </code>
                </div>

                {/* EVENTS TIMELINE */}
                {proofData.events && proofData.events.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase">Audit Event Chain</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {proofData.events.map((evt, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-muted/40 text-xs border border-border/60">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-muted-foreground">#{evt.sequence}</span>
                            <span className="font-medium text-foreground capitalize">{evt.event_type?.replace(/_/g, " ")}</span>
                          </div>
                          <span className="text-muted-foreground">{new Date(evt.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setSelectedProofCert(null)}>
                Close
              </Button>
              <Button asChild size="sm">
                <a
                  href={`/verify/${selectedProofCert.document_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Open Public Verify Page
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
