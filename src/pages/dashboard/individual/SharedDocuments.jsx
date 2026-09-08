import React, { useEffect, useState } from "react";
import { studentApi } from "@/api/student";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Share2,
  Copy,
  Check,
  QrCode,
  Download,
  ExternalLink,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Award,
  Building2,
  X,
  Mail,
  MessageCircle,
  Globe,
  CheckCircle2,
} from "lucide-react";

export default function SharedDocuments() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [qrModalCert, setQrModalCert] = useState(null);
  const [shareModalCert, setShareModalCert] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [savingQr, setSavingQr] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await studentApi.getCertificates();
      setCerts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load shareable credentials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const getVerificationUrl = (cert) => {
    const origin = window.location.origin;
    const targetId = cert.id || cert.document_hash;
    return `${origin}/verify/${targetId}`;
  };

  const copyToClipboard = async (text, id) => {
    let success = false;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch (e) {
        // fallback
      }
    }
    if (!success) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch (e) {
        success = false;
      }
    }

    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } else {
      alert("Verification URL: " + text);
    }
  };

  const handleCopyLink = (cert) => {
    const url = getVerificationUrl(cert);
    copyToClipboard(url, cert.id);
  };

  const handleOpenShare = async (cert) => {
    const url = getVerificationUrl(cert);
    if (navigator.share) {
      try {
        await navigator.share({
          title: cert.title || "Verifiable Certificate",
          text: `Verify my certificate "${cert.title}" issued by ${cert.issuer_name} on TrustDocs:`,
          url: url,
        });
        return;
      } catch (err) {
        // If user cancelled, don't open modal; otherwise open modal fallback
        if (err.name === "AbortError") return;
      }
    }
    setShareModalCert(cert);
  };

  const handleDownload = async (cert) => {
    setDownloadingId(cert.id);
    try {
      const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");
      const res = await fetch(`${API_BASE}/documents/file/${cert.document_hash}.pdf`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Could not retrieve certificate file");
      }
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

  const handleSaveQrImage = async (cert) => {
    setSavingQr(true);
    try {
      const url = getVerificationUrl(cert);
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;
      const res = await fetch(qrApiUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${(cert.title || "certificate").replace(/[^a-zA-Z0-9_-]/g, "_")}_qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback
      window.open(
        `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(getVerificationUrl(cert))}`,
        "_blank"
      );
    } finally {
      setSavingQr(false);
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
            Shared Documents
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your cryptographic credentials and certificates with employers, universities, and third-party verifiers.
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
            placeholder="Search credential title or issuer..."
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
          <p className="mt-3 text-sm text-muted-foreground">Loading shareable credentials...</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredCerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-xl border border-border bg-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-4">
            <Share2 className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No credentials available to share yet</h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Certificates issued to you by universities or organizations will appear here ready for instant sharing.
          </p>
        </div>
      )}

      {/* CREDENTIAL LIST CARDS */}
      {!loading && !error && filteredCerts.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {filteredCerts.map((cert) => {
            const verUrl = getVerificationUrl(cert);
            const isCopied = copiedId === cert.id;

            return (
              <div
                key={cert.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* CREDENTIAL INFO */}
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-foreground">
                          {cert.title || "Issued Certificate"}
                        </h3>
                        <StatusBadge status={cert.status} />
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Publicly Verifiable
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                          {cert.issuer_name || "Institution"}
                        </span>
                        <span>•</span>
                        <span>Issued: {new Date(cert.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* SHARING ACTIONS */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* 1. COPY LINK */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(cert)}
                      className={isCopied ? "border-emerald-500 text-emerald-700 bg-emerald-50" : ""}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-4 w-4 mr-1.5 text-emerald-600" />
                          Link Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1.5" />
                          Copy Link
                        </>
                      )}
                    </Button>

                    {/* 2. QR CODE */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQrModalCert(cert)}
                    >
                      <QrCode className="h-4 w-4 mr-1.5" />
                      QR Code
                    </Button>

                    {/* 3. SHARE */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenShare(cert)}
                    >
                      <Share2 className="h-4 w-4 mr-1.5" />
                      Share
                    </Button>

                    {/* 4. PDF DOWNLOAD */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(cert)}
                      disabled={downloadingId === cert.id}
                    >
                      <Download className={`h-4 w-4 mr-1.5 ${downloadingId === cert.id ? "animate-spin" : ""}`} />
                      PDF
                    </Button>

                    {/* 5. VERIFY LIVE */}
                    <Button asChild size="sm">
                      <a href={verUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1.5" />
                        Verify Live
                      </a>
                    </Button>
                  </div>
                </div>

                {/* DIRECT URL DISPLAY */}
                <div className="mt-4 pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-muted/40 p-2.5 rounded-lg">
                  <span className="font-mono text-muted-foreground truncate">{verUrl}</span>
                  <span className="shrink-0 text-muted-foreground font-sans">Anyone with this link can independently verify</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR CODE MODAL */}
      {qrModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <button
              onClick={() => setQrModalCert(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground">Credential QR Code</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {qrModalCert.title} • {qrModalCert.issuer_name}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-border">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  getVerificationUrl(qrModalCert)
                )}`}
                alt="Verification QR Code"
                className="h-48 w-48 object-contain"
              />
              <p className="mt-2 text-[11px] text-gray-500 font-mono text-center">
                Scan with any smartphone camera to verify authenticity
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => copyToClipboard(getVerificationUrl(qrModalCert), "qr_modal")}
              >
                {copiedId === "qr_modal" ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy URL
                  </>
                )}
              </Button>
              <Button
                className="w-full text-xs"
                onClick={() => handleSaveQrImage(qrModalCert)}
                disabled={savingQr}
              >
                <Download className={`h-3.5 w-3.5 mr-1 ${savingQr ? "animate-spin" : ""}`} />
                Save QR Image
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE OPTIONS MODAL */}
      {shareModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <button
              onClick={() => setShareModalCert(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-foreground">Share Verifiable Credential</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share this verifiable link with employers, admissions, or recruiters.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {/* COPY */}
              <button
                onClick={() => copyToClipboard(getVerificationUrl(shareModalCert), "share_modal")}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {copiedId === "share_modal" ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {copiedId === "share_modal" ? "Link Copied to Clipboard!" : "Copy Verification Link"}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono truncate max-w-[280px]">
                      {getVerificationUrl(shareModalCert)}
                    </div>
                  </div>
                </div>
              </button>

              {/* EMAIL */}
              <a
                href={`mailto:?subject=${encodeURIComponent(
                  `Verified Credential: ${shareModalCert.title}`
                )}&body=${encodeURIComponent(
                  `Hello,\n\nPlease find my verified certificate "${shareModalCert.title}" issued by ${shareModalCert.issuer_name}.\n\nYou can independently verify its authenticity on TrustDocs at:\n${getVerificationUrl(
                    shareModalCert
                  )}\n\nBest regards.`
                )}`}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Share via Email</div>
                    <div className="text-xs text-muted-foreground">Send pre-formatted verification email</div>
                  </div>
                </div>
              </a>

              {/* LINKEDIN */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  getVerificationUrl(shareModalCert)
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0077B5]">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Post to LinkedIn</div>
                    <div className="text-xs text-muted-foreground">Share credential on your professional profile</div>
                  </div>
                </div>
              </a>

              {/* WHATSAPP */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Verify my certificate "${shareModalCert.title}" issued by ${shareModalCert.issuer_name}: ${getVerificationUrl(
                    shareModalCert
                  )}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#25D366]">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Send via WhatsApp</div>
                    <div className="text-xs text-muted-foreground">Share directly with contacts or groups</div>
                  </div>
                </div>
              </a>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShareModalCert(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
