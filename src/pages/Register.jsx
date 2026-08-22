import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const returnTo = safeReturnTo("/app");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authApi.signup(email, password);
      setCheckEmail(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendMessage("");
    try {
      await authApi.resendVerification(email);
      setResendMessage("Verification email sent. Check your inbox.");
    } catch (err) {
      setError(err.message || "Failed to resend verification email");
    }
  };

  const handleGoogle = () => {
    authApi.startGoogle();
  };

  if (checkEmail) {
    return (
      <AuthLayout
        icon={Mail}
        title="Check your email"
        subtitle={`We sent a verification link to ${email}`}
        footer={
          <Link to="/login" className="text-primary font-medium hover:underline">
            Back to log in
          </Link>
        }
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 text-success">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Click the link in the email to verify your account, then sign in. No code needed — Doc-Contract uses an email link.
          </p>
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-left">{error}</div>
          )}
          {resendMessage && (
            <div className="p-3 rounded-lg bg-success/10 text-success text-sm">{resendMessage}</div>
          )}
          <p className="text-sm text-muted-foreground">
            Didn't get it?{" "}
            <button type="button" onClick={handleResend} className="text-primary font-medium hover:underline">
              Resend verification email
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={"/login" + (returnTo !== "/app" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <Button variant="outline" className="w-full h-12 text-sm font-medium mb-6" onClick={handleGoogle}>
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
