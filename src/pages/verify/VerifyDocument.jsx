import React, { useState } from "react";
import { Link } from "react-router-dom";
import { verifyApi } from "@/api/verify";
import { ApiError } from "@/api/client";
import Logo from "@/components/Logo";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Hash,
  FileUp,
  QrCode,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  FileX2,
  HelpCircle,
  Loader2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

const TABS = [
  { id: "id", label: "Document ID", icon: Hash },
  { id: "pdf", label: "Upload PDF", icon: FileUp, soon: true },
  { id: "qr", label: "Scan QR", icon: QrCode, soon: true },
];

const RESULT_CONFIG = {
  verified: {
    icon: CheckCircle2,
    title: "Verified",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  not_verified: {
    icon: AlertTriangle,
    title: "Not fully verified",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  not_found: {
    icon: FileX2,
    title: "Not Found",
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
  },
  unable_to_verify: {
    icon: HelpCircle,
    title: "Unable to Verify",
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
  },
};

function verifyUiUrl(envelopeId) {
  return `http://localhost:8080/verify-ui?envelope_id=${encodeURIComponent(envelopeId)}`;
}

export default function VerifyDocument() {
  const [tab, setTab] = useState("id");
  const [envelopeId, setEnvelopeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showProof, setShowProof] = useState(false);

  const runVerification = async (id) => {
    const value = (id || "").trim();
    setLoading(true);
    setResult(null);
    setError("");
    setShowProof(false);
    if (!value) {
      setLoading(false);
      setResult({ kind: "unable_to_verify" });
      return;
    }
    try {
      const data = await verifyApi.byEnvelopeId(value);
      setResult({
        kind: data.verified ? "verified" : "not_verified",
        envelope_id: data.envelope_id || value,
        verified: !!data.verified,
        chain_integrity: data.chain_integrity,
        tsa_status: data.tsa_status,
        tsa_anchor_match: data.tsa_anchor_match,
        cms_signature_verified: data.cms_signature_verified,
        blockchain_anchored: data.blockchain_anchored,
        blockchain_txid: data.blockchain_txid,
        blockchain_network: data.blockchain_network,
        event_count: data.event_count ?? (Array.isArray(data.events) ? data.events.length : undefined),
        events: data.events,
        final_event_hash: data.final_event_hash,
        document_hashes: data.document_hashes,
        raw: data,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setResult({ kind: "not_found", envelope_id: value });
      } else {
        setError(err.message || "Verification request failed");
        setResult({ kind: "unable_to_verify", envelope_id: value });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIdSubmit = (e) => {
    e.preventDefault();
    runVerification(envelopeId);
  };

  const cfg = result ? RESULT_CONFIG[result.kind] : null;
  const ResIcon = cfg?.icon;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/10 text-secondary mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground font-heading">Verify a document</h1>
          <p className="mt-2 text-muted-foreground">
            Check authenticity via Doc-Contract public verify. No account required.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setResult(null);
                setError("");
              }}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
          {tab === "id" && (
            <form onSubmit={handleIdSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="envelopeId">Envelope UUID</Label>
                <Input
                  id="envelopeId"
                  value={envelopeId}
                  onChange={(e) => setEnvelopeId(e.target.value)}
                  placeholder="e.g. a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
                  className="h-12 font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Use the envelope ID from DEMO or your send flow. PDF upload and QR scanning come later.
                </p>
              </div>
              <Button type="submit" className="w-full h-12" disabled={loading || !envelopeId.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" /> Verify document
                  </>
                )}
              </Button>
            </form>
          )}

          {(tab === "pdf" || tab === "qr") && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-2xl border-2 border-dashed border-border bg-muted/40 flex items-center justify-center text-muted-foreground mb-4">
                {tab === "pdf" ? <FileUp className="w-8 h-8" /> : <QrCode className="w-8 h-8" />}
              </div>
              <p className="text-sm font-medium text-foreground">Coming soon</p>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
                {tab === "pdf"
                  ? "PDF hash verification will land in a later phase. For now, verify by envelope UUID."
                  : "Camera QR scanning will land in a later phase. For now, verify by envelope UUID."}
              </p>
              <Button type="button" variant="outline" className="mt-5" onClick={() => setTab("id")}>
                Use document ID instead
              </Button>
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-secondary" /> Checking Doc-Contract evidence…
          </div>
        )}

        {error && !loading && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        {!loading && result && cfg && (
          <div className={`mt-6 rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-6`}>
            <div className="flex items-start gap-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${cfg.bg} ${cfg.color} shrink-0`}>
                <ResIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className={`text-xl font-semibold ${cfg.color}`}>{cfg.title}</h2>
                  {result.kind === "verified" && <StatusBadge status="verified" />}
                  {result.kind === "not_verified" && <StatusBadge status="unable to verify" />}
                  {result.kind === "not_found" && <StatusBadge status="not found" />}
                </div>
                {result.kind === "not_found" ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    No envelope was found for this ID. Confirm the UUID from DEMO or your API response.
                  </p>
                ) : result.kind === "unable_to_verify" ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    We couldn't complete verification. Check the envelope ID and try again.
                  </p>
                ) : result.kind === "verified" ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Chain and evidence checks passed. Optional blockchain witness is not required for verified status.
                  </p>
                ) : (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    The envelope exists, but one or more evidence checks did not pass. Review the fields below.
                  </p>
                )}
              </div>
            </div>

            {result.kind !== "not_found" && result.kind !== "unable_to_verify" && (
              <>
                <dl className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <Detail label="Envelope ID" value={result.envelope_id} mono />
                  <Detail label="Verified" value={String(!!result.verified)} />
                  <Detail
                    label="Chain integrity"
                    value={result.chain_integrity == null ? "—" : String(result.chain_integrity)}
                  />
                  <Detail label="TSA status" value={result.tsa_status || "—"} />
                  <Detail
                    label="TSA anchor match"
                    value={result.tsa_anchor_match == null ? "—" : String(result.tsa_anchor_match)}
                  />
                  <Detail
                    label="CMS signature verified"
                    value={result.cms_signature_verified == null ? "—" : String(result.cms_signature_verified)}
                  />
                  <Detail
                    label="Blockchain anchored"
                    value={result.blockchain_anchored == null ? "—" : String(result.blockchain_anchored)}
                  />
                  <Detail
                    label="Events"
                    value={result.event_count == null ? "—" : String(result.event_count)}
                  />
                  {result.final_event_hash && (
                    <Detail label="Final event hash" value={result.final_event_hash} mono />
                  )}
                  {result.blockchain_txid && (
                    <Detail label="Blockchain txid" value={result.blockchain_txid} mono />
                  )}
                  {result.blockchain_network && (
                    <Detail label="Blockchain network" value={result.blockchain_network} />
                  )}
                </dl>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setShowProof((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline"
                  >
                    {showProof ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Proof details
                  </button>
                  {showProof && (
                    <div className="mt-3 rounded-xl border border-border bg-card p-4 text-xs space-y-2">
                      {result.document_hashes?.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Document hashes</span>
                          <ul className="mt-1 space-y-1 font-mono text-foreground break-all">
                            {result.document_hashes.map((h) => (
                              <li key={h}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(result.events) && result.events.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Event timeline ({result.events.length})</span>
                          <ul className="mt-1 space-y-1 text-foreground">
                            {result.events.slice(0, 8).map((ev, i) => (
                              <li key={i} className="font-mono truncate">
                                {ev.event_type || ev.type || "event"}
                                {ev.event_hash ? ` · ${String(ev.event_hash).slice(0, 16)}…` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="pt-1 text-muted-foreground leading-relaxed">
                        Evidence is recomputed from the hash-chained audit log and optional TSA / blockchain witnesses.
                      </p>
                    </div>
                  )}
                </div>

                {result.envelope_id && (
                  <a
                    href={verifyUiUrl(result.envelope_id)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline"
                  >
                    Open backend verify-ui <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </>
            )}

            {result.kind === "not_found" && result.envelope_id && (
              <a
                href={verifyUiUrl(result.envelope_id)}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline"
              >
                Open backend verify-ui <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          TrustDocs reports evidence status for known envelopes — it never labels an unknown ID as fake.
        </p>
      </main>
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 font-medium text-foreground break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
