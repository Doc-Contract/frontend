import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { signApi } from "@/api/sign";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/StatusBadge";
import {
  FilePenLine,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Mail,
} from "lucide-react";

export default function SignDocument() {
  const { token } = useParams();
  const [phase, setPhase] = useState("loading"); // loading | ready | otp_sent | otp_ok | done | error
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const load = useCallback(async () => {
    if (!token) {
      setPhase("error");
      setError("Missing signing token");
      return;
    }
    setPhase("loading");
    setError("");
    try {
      const data = await signApi.get(token);
      setInfo(data);
      const st = (data.status || "").toLowerCase();
      if (st === "signed") {
        setPhase("done");
        setResult({ envelope_id: data.envelope_id, message: "Already signed" });
      } else if (st === "otp_verified") {
        setPhase("otp_ok");
      } else {
        setPhase("ready");
      }
    } catch (err) {
      setPhase("error");
      setError(err.message || "Invalid or expired signing link");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const requestOtp = async () => {
    setBusy(true);
    setError("");
    setDevCode("");
    try {
      const res = await signApi.requestOtp(token);
      if (res?.dev_code) setDevCode(res.dev_code);
      setPhase("otp_sent");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signApi.verifyOtp(token, otpCode.trim());
      setPhase("otp_ok");
    } catch (err) {
      setError(err.message || "Invalid code");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await signApi.submit(token);
      setResult(res);
      setPhase("done");
    } catch (err) {
      setError(err.message || "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  if (phase === "loading") {
    return (
      <AuthLayout icon={FilePenLine} title="Opening signing link">
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Validating token…
        </div>
      </AuthLayout>
    );
  }

  if (phase === "error") {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Cannot open signing link"
        subtitle="This link may be invalid, expired, or revoked"
        footer={
          <Link to="/" className="text-primary font-medium hover:underline">
            Back to home
          </Link>
        }
      >
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      </AuthLayout>
    );
  }

  if (phase === "done") {
    const envelopeId = result?.envelope_id || info?.envelope_id;
    return (
      <AuthLayout
        icon={CheckCircle2}
        title="Signed"
        subtitle="Thank you — your signature was recorded"
        footer={
          <Link to="/" className="text-primary font-medium hover:underline">
            Back to home
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground text-center mb-4">
          {result?.message || "Signature submitted successfully."}
        </p>
        {envelopeId && (
          <Link to={`/verify?envelope_id=${encodeURIComponent(envelopeId)}`} className="block">
            <Button className="w-full h-12">View public verification</Button>
          </Link>
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={FilePenLine}
      title="Sign document"
      subtitle="Verify your email with a one-time code, then confirm consent"
      footer={
        <Link to="/" className="text-primary font-medium hover:underline">
          Cancel
        </Link>
      }
    >
      <div className="space-y-4">
        {info && (
          <div className="rounded-lg border border-border p-3 text-sm space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={info.status} size="sm" />
            </div>
            {info.envelope_id && (
              <p className="text-xs text-muted-foreground font-mono break-all">Envelope {info.envelope_id}</p>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        {phase === "ready" && (
          <Button className="w-full h-12" onClick={requestOtp} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending code…
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Email me a verification code
              </>
            )}
          </Button>
        )}

        {phase === "otp_sent" && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code we emailed you.
            </p>
            {devCode && (
              <div className="p-3 rounded-lg bg-muted text-xs font-mono">
                Dev code: {devCode}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="otp">Verification code</Label>
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="h-12 tracking-widest text-center text-lg"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12" disabled={busy || otpCode.trim().length < 6}>
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify code"
              )}
            </Button>
            <button
              type="button"
              className="w-full text-sm text-primary hover:underline"
              onClick={requestOtp}
              disabled={busy}
            >
              Resend code
            </button>
          </form>
        )}

        {phase === "otp_ok" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Email verified. Confirm you agree to sign this document electronically.
            </p>
            <Button className="w-full h-12" onClick={submit} disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                "I consent — submit signature"
              )}
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
