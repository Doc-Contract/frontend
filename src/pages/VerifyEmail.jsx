import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState(token ? "loading" : "missing");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        await authApi.verifyEmail(token);
        if (!cancelled) setStatus("success");
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(err.message || "Verification failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "missing") {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Missing verification link"
        subtitle="This email verification link is incomplete"
        footer={
          <Link to="/login" className="text-primary font-medium hover:underline">
            Go to log in
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground text-center">
          Open the link from your verification email, or request a new one from the registration page.
        </p>
      </AuthLayout>
    );
  }

  if (status === "loading") {
    return (
      <AuthLayout icon={Mail} title="Verifying email">
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Confirming your email…
        </div>
      </AuthLayout>
    );
  }

  if (status === "error") {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Verification failed"
        subtitle="We couldn't verify this email"
        footer={
          <Link to="/login" className="text-primary font-medium hover:underline">
            Go to log in
          </Link>
        }
      >
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">{error}</div>
        <p className="text-sm text-muted-foreground text-center">
          The link may have expired. Sign up again or resend verification from registration.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={CheckCircle2}
      title="Email verified"
      subtitle="Your account is ready"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          Continue to log in
        </Link>
      }
    >
      <p className="text-sm text-muted-foreground text-center mb-6">
        Thanks — your email is confirmed. Sign in with your password to continue.
      </p>
      <Link to="/login" className="block">
        <Button className="w-full h-12 font-medium">Go to log in</Button>
      </Link>
    </AuthLayout>
  );
}
