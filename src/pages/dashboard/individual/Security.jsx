import React, { useState, useEffect } from "react";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Send,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Security() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [changingPassword, setChangingPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resetSentMsg, setResetSentMsg] = useState("");

  useEffect(() => {
    authApi.me().then((res) => setProfile(res.data)).catch(() => {});
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setSuccessMsg("Your password has been changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!profile?.email) return;
    setSendingReset(true);
    setResetSentMsg("");
    setError("");
    try {
      await authApi.forgotPassword(profile.email);
      setResetSentMsg(`Password reset instructions have been sent to ${profile.email}`);
      setTimeout(() => setResetSentMsg(""), 6000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send password reset email");
    } finally {
      setSendingReset(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    navigate("/auth/login");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
          Security & Authentication
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your login password, manage session authorization, and review account security.
        </p>
      </div>

      {/* FEEDBACK BANNERS */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {resetSentMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
          <span>{resetSentMsg}</span>
        </div>
      )}

      {/* CHANGE PASSWORD CARD */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-5 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Change Password</h2>
            <p className="text-xs text-muted-foreground">
              Choose a strong password with at least 8 characters.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="mt-5 space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <Label htmlFor="current_password" className="text-xs font-medium text-muted-foreground">
              Current Password
            </Label>
            <Input
              id="current_password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new_password" className="text-xs font-medium text-muted-foreground">
              New Password
            </Label>
            <Input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm_password" className="text-xs font-medium text-muted-foreground">
              Confirm New Password
            </Label>
            <Input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="text-sm"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" size="sm" disabled={changingPassword}>
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* PASSWORD RESET LINK BACKUP */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Forgot Current Password?</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                We can send a secure password reset link to your registered email address ({profile?.email || "your email"}).
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendResetEmail}
            disabled={sendingReset || !profile?.email}
          >
            {sendingReset ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Sending Link...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1.5" />
                Send Reset Email
              </>
            )}
          </Button>
        </div>
      </div>

      {/* SESSION & ACTIVE LOGINS */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Active Session</h2>
              <p className="text-xs text-muted-foreground">
                You are currently authenticated with an encrypted HTTP-only session cookie.
              </p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1.5" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
