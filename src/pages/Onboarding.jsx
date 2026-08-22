import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { orgsApi } from "@/api/orgs";
import { walletApi } from "@/api/wallet";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserRound,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Copy,
  ShieldCheck,
  AlertCircle,
  Wallet,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { cn, slugify } from "@/lib/utils";

const STEPS = [
  { id: "account_type", label: "Account type" },
  { id: "details", label: "Details" },
  { id: "wallet", label: "Wallet" },
  { id: "review", label: "Review" },
];

const ACCOUNT_TYPE_KEY = "trustdocs_account_type";

function linkedWalletAddress(providers) {
  const eth = (providers || []).find((p) => p.provider === "ethereum");
  return eth?.provider_account_id || "";
}

export default function Onboarding() {
  const { user, isAuthenticated, authChecked, checkUserAuth, setOrgId } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [walletBusy, setWalletBusy] = useState(false);

  const [data, setData] = useState({
    account_type: "individual",
    full_name: "",
    org_name: "",
    country: "",
    website: "",
    wallet_consent: false,
    wallet_status: "idle", // idle | linking | linked | failed | skipped
    wallet_address: "",
    wallet_error: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!authChecked || !isAuthenticated || !user) return;
    const existing = linkedWalletAddress(user.providers);
    setData((d) => ({
      ...d,
      full_name: user.full_name || user.email?.split("@")[0] || "",
      wallet_address: existing || d.wallet_address,
      wallet_status: existing ? "linked" : d.wallet_status,
    }));
  }, [authChecked, isAuthenticated, user]);

  const update = (patch) => setData((d) => ({ ...d, ...patch }));

  const validateStep = () => {
    const e = {};
    if (step === 1 && data.account_type === "organization") {
      if (!data.org_name.trim()) e.org_name = "Enter the organization name";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const skipWallet = () => {
    update({ wallet_status: data.wallet_address ? "linked" : "skipped", wallet_error: "" });
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const linkMetaMask = async () => {
    setErrors((e) => ({ ...e, wallet_consent: "" }));
    if (!data.wallet_consent) {
      setErrors((e) => ({ ...e, wallet_consent: "Please consent before linking MetaMask" }));
      return;
    }
    if (!window.ethereum) {
      update({
        wallet_status: "failed",
        wallet_error: "MetaMask not found. Install it, then try again.",
      });
      return;
    }
    setWalletBusy(true);
    update({ wallet_status: "linking", wallet_error: "" });
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts?.[0];
      if (!address) throw new Error("No account selected");
      const nonceRes = await walletApi.nonce(address);
      const message = nonceRes.message;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });
      await walletApi.verify(address, signature);
      await checkUserAuth();
      update({ wallet_status: "linked", wallet_address: nonceRes.address || address });
    } catch (err) {
      update({
        wallet_status: "failed",
        wallet_error: err.message || "Wallet link failed",
      });
    } finally {
      setWalletBusy(false);
    }
  };

  const completeSetup = async () => {
    setSaving(true);
    setErrors((e) => ({ ...e, complete: "" }));
    try {
      try {
        sessionStorage.setItem(ACCOUNT_TYPE_KEY, data.account_type);
      } catch {
        /* ignore */
      }

      if (data.account_type === "organization") {
        const name = data.org_name.trim();
        const org = await orgsApi.create({ name, slug: slugify(name) });
        setOrgId(org.org_id);
        navigate("/app/organization", { replace: true });
      } else {
        navigate("/app/individual", { replace: true });
      }
    } catch (err) {
      setSaving(false);
      setErrors((e) => ({
        ...e,
        complete: err.message || "Something went wrong saving your setup. Please try again.",
      }));
    }
  };

  const displayName = useMemo(
    () => data.full_name || user?.full_name || user?.email || "User",
    [data.full_name, user]
  );

  if (!authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-secondary" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <span className="text-sm text-muted-foreground">Account setup</span>
        </div>
      </header>

      <div className="bg-card border-b border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                      i < step
                        ? "bg-success text-white"
                        : i === step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-xs hidden sm:block",
                      i === step ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-2 rounded", i < step ? "bg-success" : "bg-border")} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8">
        {step === 0 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
              Choose your account type
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">You can finish setup in a few steps.</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <AccountTypeCard
                active={data.account_type === "individual"}
                onClick={() => update({ account_type: "individual" })}
                icon={UserRound}
                title="For myself"
                desc="Receive, verify, share, download and sign documents."
                accent="secondary"
              />
              <AccountTypeCard
                active={data.account_type === "organization"}
                onClick={() => update({ account_type: "organization" })}
                icon={Building2}
                title="For my organization"
                desc="Issue, manage, verify, revoke and send documents for signature."
                accent="indigo"
              />
            </div>
          </div>
        )}

        {step === 1 && data.account_type === "individual" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">Your details</h1>
              <p className="mt-1 text-sm text-muted-foreground">Your account is already created via email or Google.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs text-muted-foreground">Display name</p>
              <p className="mt-1 text-base font-medium text-foreground">{displayName}</p>
              <p className="mt-3 text-xs text-muted-foreground">Email</p>
              <p className="mt-1 text-sm text-foreground">{user?.email}</p>
            </div>
          </div>
        )}

        {step === 1 && data.account_type === "organization" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
                Organization details
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">We'll create your org on Doc-Contract when you finish.</p>
            </div>
            <Field label="Organization name" error={errors.org_name}>
              <Input
                value={data.org_name}
                onChange={(e) => update({ org_name: e.target.value })}
                placeholder="e.g. Northgate University"
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Country (optional)">
                <Input
                  value={data.country}
                  onChange={(e) => update({ country: e.target.value })}
                  placeholder="e.g. United Kingdom"
                />
              </Field>
              <Field label="Website (optional)">
                <Input
                  value={data.website}
                  onChange={(e) => update({ website: e.target.value })}
                  placeholder="https://example.org"
                />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-xl">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
                Optional wallet link
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Link MetaMask as an identity provider. Skip anytime — anchoring does not use your wallet.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-secondary/10 text-secondary shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  TrustDocs never asks for a private key or seed phrase. Linking only proves you control the address.
                </p>
              </div>
            </div>

            <label
              className={cn(
                "mt-5 flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors",
                data.wallet_consent
                  ? "border-secondary bg-secondary/5"
                  : "border-border bg-card hover:border-secondary/50"
              )}
            >
              <input
                type="checkbox"
                checked={data.wallet_consent}
                onChange={(e) => update({ wallet_consent: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-border accent-secondary"
              />
              <span className="text-sm text-foreground">
                I consent to linking my MetaMask wallet to this TrustDocs account for identity only.
              </span>
            </label>
            {errors.wallet_consent && <p className="mt-1.5 text-xs text-destructive">{errors.wallet_consent}</p>}

            <div className="mt-5 space-y-3">
              {data.wallet_status === "linked" && data.wallet_address && (
                <div className="rounded-xl border border-success/30 bg-success/5 p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <p className="text-sm font-medium text-foreground">Wallet linked</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="flex-1 truncate rounded-lg bg-card border border-border px-3 py-2 text-xs font-mono text-foreground">
                      {data.wallet_address}
                    </code>
                    <CopyButton value={data.wallet_address} />
                  </div>
                </div>
              )}

              {data.wallet_status === "linking" && (
                <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-5 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Confirm the signature in MetaMask…</p>
                    <p className="text-xs text-muted-foreground">Signing the SIWE nonce message.</p>
                  </div>
                </div>
              )}

              {data.wallet_status === "failed" && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <p className="text-sm font-medium text-foreground">Wallet link failed</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{data.wallet_error || "Try again or skip."}</p>
                  {!window.ethereum && (
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm text-secondary hover:underline"
                    >
                      Download MetaMask <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {data.wallet_status !== "linked" && (
                <Button onClick={linkMetaMask} disabled={walletBusy} className="w-full h-12">
                  {walletBusy ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wallet className="w-4 h-4 mr-2" />
                  )}
                  Link MetaMask
                </Button>
              )}

              <Button variant="ghost" className="w-full" onClick={skipWallet}>
                Skip for now
              </Button>
            </div>

            <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-secondary" />
                Envelope blockchain anchoring uses the server protocol wallet — never your MetaMask.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
                Review and complete
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Check your details before finishing setup.</p>
            </div>

            <div className="mt-6 space-y-4">
              <ReviewCard title="Account type" onEdit={() => setStep(0)}>
                <p className="text-sm text-foreground capitalize">
                  {data.account_type === "individual" ? "For myself (Individual)" : "For my organization"}
                </p>
              </ReviewCard>

              <ReviewCard
                title={data.account_type === "individual" ? "Your details" : "Organization details"}
                onEdit={() => setStep(1)}
              >
                {data.account_type === "individual" ? (
                  <ReviewRows rows={[["Display name", displayName], ["Email", user?.email]]} />
                ) : (
                  <ReviewRows
                    rows={[
                      ["Organization", data.org_name],
                      ["Slug", slugify(data.org_name)],
                      ["Country", data.country || "—"],
                      ["Website", data.website || "—"],
                    ]}
                  />
                )}
              </ReviewCard>

              <ReviewCard title="Wallet" onEdit={() => setStep(2)}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      {data.wallet_status === "linked"
                        ? "Wallet linked"
                        : data.wallet_status === "failed"
                          ? "Wallet link failed"
                          : "Skipped"}
                    </p>
                    {data.wallet_address && (
                      <code className="block mt-1 truncate text-xs font-mono text-muted-foreground">
                        {data.wallet_address}
                      </code>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap",
                      data.wallet_status === "linked"
                        ? "bg-success/10 text-success border-success/20"
                        : data.wallet_status === "failed"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {data.wallet_status === "linked"
                      ? "Linked"
                      : data.wallet_status === "failed"
                        ? "Failed"
                        : "Optional"}
                  </span>
                </div>
              </ReviewCard>
            </div>

            {errors.complete && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{errors.complete}</div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={handleBack} disabled={step === 0 || saving}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={handleContinue} disabled={saving || walletBusy}>
              <ArrowRight className="w-4 h-4 mr-1.5" />
              Continue
            </Button>
          ) : (
            <Button onClick={completeSetup} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
              Complete Setup
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

function AccountTypeCard({ active, onClick, icon: Icon, title, desc, accent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-2xl border-2 p-5 transition-all",
        active ? "border-secondary bg-secondary/5 shadow-sm" : "border-border bg-card hover:border-secondary/40"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-11 h-11 rounded-lg",
          accent === "indigo" ? "bg-indigo-50 text-indigo-600" : "bg-secondary/10 text-secondary"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</p>
      <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-secondary">
        {active ? (
          <>
            <CheckCircle2 className="w-4 h-4" /> Selected
          </>
        ) : (
          <span className="text-muted-foreground">Select</span>
        )}
      </div>
    </button>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ReviewCard({ title, onEdit, children }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-xs text-secondary hover:underline">
          <Pencil className="w-3 h-3" /> Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function ReviewRows({ rows }) {
  return (
    <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col">
          <dt className="text-xs text-muted-foreground">{k}</dt>
          <dd className="text-sm font-medium text-foreground">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
}
