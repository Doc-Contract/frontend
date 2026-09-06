import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { documentsApi, envelopesApi } from "@/api/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Send, CheckCircle2, ExternalLink, Copy, ShieldAlert, Wallet } from "lucide-react";

/**
 * Upload PDF → create draft envelope → add signer → send.
 * Used by Issue Document and Send for Signature routes.
 */
export default function IssueEnvelope({
  title = "Send for signature",
  subtitle = "Upload a PDF, add a signer, and email a signing link.",
}) {
  const { orgId, user, organizations } = useAuth();
  const [docTitle, setDocTitle] = useState("");
  const [file, setFile] = useState(null);
  const [signerEmail, setSignerEmail] = useState("");
  const [signerName, setSignerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Check if current org is verified
  const currentOrg = (user?.organizations || []).find((o) => o.org_id === orgId);
  const isOrgVerified = currentOrg?.is_verified === true;

  // Check if user has a linked Ethereum wallet
  const hasWallet = (user?.providers || []).some((p) => p.provider === "ethereum");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!orgId) {
      setError("No organization selected. Finish onboarding or refresh the session.");
      return;
    }
    if (!file) {
      setError("Choose a PDF file to upload.");
      return;
    }
    setLoading(true);
    try {
      const uploaded = await documentsApi.upload(file, orgId);
      const documentHash = uploaded.document_hash;
      if (!documentHash) {
        throw new Error("Upload succeeded but no document_hash was returned");
      }

      const envelope = await envelopesApi.create(
        {
          title: docTitle.trim() || file.name || "Untitled envelope",
          document_hash: documentHash,
        },
        orgId
      );

      await envelopesApi.addSigner(
        envelope.envelope_id,
        { email: signerEmail.trim(), name: signerName.trim() },
        orgId
      );

      const sent = await envelopesApi.send(envelope.envelope_id, orgId);
      setResult({
        envelope_id: sent.envelope_id || envelope.envelope_id,
        status: sent.status || "pending",
        invites: sent.invites || [],
      });
      setDocTitle("");
      setFile(null);
      setSignerEmail("");
      setSignerName("");
    } catch (err) {
      setError(err.message || "Failed to create and send envelope");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* Guard: Org not verified */}
      {!isOrgVerified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Organization pending verification</p>
              <p className="mt-1 text-sm leading-6 text-amber-700">
                Your organization must be verified by a TrustDocs admin before you can issue documents.
                Please contact support or wait for admin approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Guard: No wallet linked */}
      {isOrgVerified && !hasWallet && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-900">Wallet connection required</p>
              <p className="mt-1 text-sm leading-6 text-red-700">
                A MetaMask wallet must be linked to your account before you can issue documents.
                Please link your wallet in account settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {result ? (
        <div className="rounded-xl border border-success/30 bg-success/5 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Envelope sent</p>
              <p className="mt-1 text-sm text-muted-foreground break-all">
                ID: {result.envelope_id}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Status: {result.status}</p>
            </div>
          </div>
          {result.invites?.length > 0 && (
            <ul className="space-y-3">
              {result.invites.map((inv) => (
                <li key={inv.signer_id || inv.email} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-sm font-medium text-foreground">{inv.email}</p>
                  {inv.signing_url && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <a
                        href={inv.signing_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-secondary hover:underline inline-flex items-center gap-1"
                      >
                        Open signing link <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <Button type="button" variant="ghost" size="sm" onClick={() => copyText(inv.signing_url)}>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setResult(null)}>
              Send another
            </Button>
            <Link to="/app/organization/awaiting">
              <Button type="button" variant="secondary">
                View awaiting
              </Button>
            </Link>
            <Link to={`/verify?envelope_id=${encodeURIComponent(result.envelope_id)}`}>
              <Button type="button" variant="outline">
                Public verify
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Document title</Label>
            <Input
              id="title"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Service Agreement"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">PDF file</Label>
            <Input
              id="file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signerEmail">Signer email</Label>
            <Input
              id="signerEmail"
              type="email"
              autoComplete="email"
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              placeholder="signer@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signerName">Signer name (optional)</Label>
            <Input
              id="signerName"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading || !orgId || !isOrgVerified || !hasWallet}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading and sending…
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Upload and send
              </>
            )}
          </Button>
          {(!isOrgVerified || !hasWallet) && !loading && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              {!isOrgVerified
                ? "Your organization must be verified by an admin before issuing documents."
                : "A connected MetaMask wallet is required to issue documents."}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
