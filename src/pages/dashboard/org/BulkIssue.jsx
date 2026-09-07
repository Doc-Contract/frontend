import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { envelopesApi } from "@/api/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileArchive, FileSpreadsheet, Send, ShieldAlert, Wallet, CheckCircle2, XCircle } from "lucide-react";

export default function BulkIssue() {
  const { orgId, user } = useAuth();
  const [zipFile, setZipFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
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
    if (!zipFile || !csvFile) {
      setError("Please provide both a ZIP file and a CSV file.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await envelopesApi.bulkIssue(zipFile, csvFile, orgId);
      setResult(response);
      setZipFile(null);
      setCsvFile(null);
    } catch (err) {
      setError(err.message || "Failed to process bulk issuance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">Bulk Issue via CSV</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload a ZIP file containing PDFs and a CSV file matching them to signers.</p>
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Bulk Processing Complete</h3>
                <p className="text-sm text-muted-foreground">Processed {result.total_processed} records</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <p className="text-sm text-success-foreground font-medium mb-1">Successfully Issued</p>
                <p className="text-3xl font-bold text-success">{result.total_success}</p>
              </div>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive-foreground font-medium mb-1">Failed to Issue</p>
                <p className="text-3xl font-bold text-destructive">{result.total_failed}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h4 className="font-semibold text-foreground">Detailed Results</h4>
            </div>
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {result.results && result.results.map((res, i) => (
                <div key={i} className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                  {res.success ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{res.filename}</p>
                    <p className="text-xs text-muted-foreground mt-1">{res.message}</p>
                    {res.envelope_id && (
                       <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {res.envelope_id}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3">
             <Button type="button" onClick={() => setResult(null)}>
               Issue Another Batch
             </Button>
             <Link to="/app/organization/issued">
               <Button type="button" variant="outline">
                 View Issued Documents
               </Button>
             </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-3 items-start animate-in fade-in">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
             <h4 className="font-medium text-primary text-sm flex items-center gap-2">
               <FileSpreadsheet className="w-4 h-4" />
               CSV Format Requirements
             </h4>
             <p className="text-sm text-muted-foreground leading-relaxed">
               Your CSV file must contain the following columns (in order):<br/>
               <code className="text-xs bg-background px-1.5 py-0.5 rounded border border-border text-foreground">filename</code>, 
               <code className="text-xs bg-background px-1.5 py-0.5 rounded border border-border text-foreground ml-1">signer_email</code>, 
               <code className="text-xs bg-background px-1.5 py-0.5 rounded border border-border text-foreground ml-1">signer_name (optional)</code>, 
               <code className="text-xs bg-background px-1.5 py-0.5 rounded border border-border text-foreground ml-1">document_title (optional)</code>
             </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2 group">
              <Label htmlFor="csvFile" className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                CSV Mapping File
              </Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                required
                className="cursor-pointer file:cursor-pointer hover:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="zipFile" className="flex items-center gap-2">
                <FileArchive className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                ZIP File (PDFs)
              </Label>
              <Input
                id="zipFile"
                type="file"
                accept="application/zip,.zip"
                onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                required
                className="cursor-pointer file:cursor-pointer hover:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full h-12 text-base transition-transform active:scale-[0.98]" disabled={loading || !orgId || !isOrgVerified || !hasWallet}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Bulk Issuance…
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload and Issue Documents
                </>
              )}
            </Button>
            {(!isOrgVerified || !hasWallet) && !loading && (
              <p className="text-xs text-amber-600 flex items-center justify-center mt-3 gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                {!isOrgVerified
                  ? "Your organization must be verified by an admin before issuing documents."
                  : "A connected MetaMask wallet is required to issue documents."}
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
