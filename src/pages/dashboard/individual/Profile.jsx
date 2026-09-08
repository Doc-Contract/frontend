import React, { useEffect, useState } from "react";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserCircle,
  Mail,
  Globe,
  MapPin,
  Shield,
  Key,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authApi.me();
      const data = res?.user_id ? res : (res?.data || {});
      setProfile(data);
      setFullName(data.full_name || "");
      setCountry(data.country || "");
      setWebsite(data.website || "");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      await authApi.updateProfile({
        full_name: fullName.trim(),
        country: country.trim(),
        website: website.trim(),
        account_type: profile?.account_type || "individual",
      });
      setSuccessMsg("Profile information updated successfully!");
      // Reload to ensure state parity
      const res = await authApi.me();
      const data = res?.user_id ? res : (res?.data || {});
      setProfile(data);
      setFullName(data.full_name || "");
      setCountry(data.country || "");
      setWebsite(data.website || "");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const copyUserId = () => {
    if (!profile?.user_id) return;
    navigator.clipboard.writeText(profile.user_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
            Account Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal identity, display name, and verified student account credentials.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadProfile} disabled={loading || saving}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading account profile...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* USER OVERVIEW CARD */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <UserCircle className="h-10 w-10" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">
                      {fullName || profile?.email?.split("@")[0] || "Individual User"}
                    </h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                      {profile?.account_type || "Individual"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3.5 w-3.5" />
                    {profile?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* IDENTITY METADATA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60">
                <span className="text-xs font-medium text-muted-foreground block">User ID (TrustDocs UUID)</span>
                <div className="flex items-center justify-between mt-1">
                  <code className="text-xs font-mono text-foreground font-semibold truncate max-w-[240px]">
                    {profile?.user_id}
                  </code>
                  <button
                    onClick={copyUserId}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy User ID"
                  >
                    {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60">
                <span className="text-xs font-medium text-muted-foreground block">Linked Auth Providers</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-background border border-border text-foreground">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    Email Password
                  </span>
                  {profile?.providers && profile.providers.map((p, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-background border border-border text-foreground capitalize">
                      <Sparkles className="h-3 w-3 text-secondary" />
                      {p.provider}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* EDIT PROFILE FORM */}
          <form onSubmit={handleSave} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-xs font-medium text-muted-foreground">
                  Full Name / Display Name
                </Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                  Registered Email (Fixed ID)
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    disabled
                    className="pl-9 text-sm bg-muted/50 cursor-not-allowed opacity-90"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-xs font-medium text-muted-foreground">
                  Country / Region
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States, India, Germany"
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="website" className="text-xs font-medium text-muted-foreground">
                  Personal Website / LinkedIn URL
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="pl-9 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadProfile}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Profile Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
