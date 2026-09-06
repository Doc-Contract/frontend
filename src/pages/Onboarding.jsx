import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { walletApi } from "@/api/wallet";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Check,
} from "lucide-react";
import { cn, slugify } from "@/lib/utils";

import AccountTypeStep from "@/components/onboarding/AccountTypeStep";
import DetailsStep from "@/components/onboarding/DetailsStep";
import WalletStep from "@/components/onboarding/WalletStep";
import ReviewStep from "@/components/onboarding/ReviewStep";

const STEPS = [
  {
    id: "account_type",
    label: "Choose account type",
    description: "What type of workspace do you need?",
  },
  {
    id: "details",
    label: "Provide details",
    description: "Tell us a little about yourself",
  },
  {
    id: "wallet",
    label: "Connect wallet",
    description: "Connect your wallet for document verification",
  },
  {
    id: "review",
    label: "Review setup",
    description: "Review your information before continuing",
  },
];

const ACCOUNT_TYPE_KEY = "trustdocs_account_type";

function linkedWalletAddress(providers) {
  const eth = (providers || []).find(
    (p) => p.provider === "ethereum"
  );

  return eth?.provider_account_id || "";
}

export default function Onboarding() {
  const {
    user,
    isAuthenticated,
    authChecked,
    checkUserAuth,
    setOrgId,
    orgId,
  } = useAuth();

  const navigate = useNavigate();
  const { completeSetup: storeCompleteSetup, clearError } = useOnboardingStore();
  const mainRef = useRef(null);

  const scrollToTop = () =>
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState("forward");

  const [saving, setSaving] = useState(false);
  const [walletBusy, setWalletBusy] = useState(false);

  const [data, setData] = useState({
    account_type: "individual",
    full_name: "",
    org_name: "",
    country: "",
    website: "",
    wallet_consent: false,
    wallet_status: "idle",
    wallet_address: "",
    wallet_error: "",
  });

  const [errors, setErrors] = useState({});

  /* Load existing user information */
  useEffect(() => {
    if (!authChecked || !isAuthenticated || !user) return;

    const existing = linkedWalletAddress(user.providers);

    setData((d) => ({
      ...d,
      full_name:
        user.full_name ||
        user.email?.split("@")[0] ||
        "",
      wallet_address:
        existing || d.wallet_address,
      wallet_status:
        existing
          ? "linked"
          : d.wallet_status,
    }));
  }, [authChecked, isAuthenticated, user]);

  /* Update form data */
  const update = (patch) => {
    setData((d) => ({
      ...d,
      ...patch,
    }));
  };

  /* Validate current step */
  const validateStep = () => {
    const e = {};

    if (
      step === 1 &&
      data.account_type === "organization"
    ) {
      if (!data.org_name.trim()) {
        e.org_name =
          "Enter the organization name";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* Continue */
  const handleContinue = () => {
    if (!validateStep()) return;

    if (step < STEPS.length - 1) {
      setDirection("forward");
      setStep((current) => current + 1);
    }

    scrollToTop();
  };

  /* Back */
  const handleBack = () => {
    if (step > 0) {
      setDirection("backward");
      setStep((current) => current - 1);
    }

    scrollToTop();
  };

  /* Skip wallet */
  const skipWallet = () => {
    update({
      wallet_status: data.wallet_address
        ? "linked"
        : "skipped",
      wallet_error: "",
    });

    setStep(3);

    scrollToTop();
  };

  /* Link MetaMask */
  const linkMetaMask = async () => {
    setErrors((e) => ({
      ...e,
      wallet_consent: "",
    }));

    if (!data.wallet_consent) {
      setErrors((e) => ({
        ...e,
        wallet_consent:
          "Please consent before linking MetaMask",
      }));

      return;
    }

    if (!window.ethereum) {
      update({
        wallet_status: "failed",
        wallet_error:
          "MetaMask not found. Install it, then try again.",
      });

      return;
    }

    setWalletBusy(true);
    update({
      wallet_status: "linking",
      wallet_error: "",
    });

    try {
      const accounts =
        await window.ethereum.request({
          method: "eth_requestAccounts",
        });

      const address = accounts?.[0];

      if (!address) {
        throw new Error(
          "No account selected"
        );
      }

      const nonceRes =
        await walletApi.nonce(address);
      const message = nonceRes.message;

      const signature =
        await window.ethereum.request({
          method: "personal_sign",
          params: [message, address],
        });

      await walletApi.verify(
        address,
        signature
      );

      await checkUserAuth();

      update({
        wallet_status: "linked",
        wallet_address:
          nonceRes.address || address,
      });
    } catch (err) {
      update({
        wallet_status: "failed",
        wallet_error:
          err.message ||
          "Wallet link failed",
      });
    } finally {
      setWalletBusy(false);
    }
  };

  /* Complete setup */
  const completeSetup = async () => {
    setSaving(true);
    clearError();

    setErrors((e) => ({
      ...e,
      complete: "",
    }));

    try {
      const resultType = await storeCompleteSetup(data, setOrgId);
      // We no longer need to write to sessionStorage or localStorage!
      // The backend will now return the account_type on next auth check.

      if (resultType === "organization") {
        navigate(
          "/app/organization",
          { replace: true }
        );
      } else {
        navigate(
          "/app/individual",
          { replace: true }
        );
      }
    } catch (err) {
      setSaving(false);

      setErrors((e) => ({
        ...e,
        complete:
          err.message ||
          "Something went wrong saving your setup. Please try again.",
      }));
    }
  };

  /* Display name */
  const displayName = useMemo(
    () =>
      data.full_name ||
      user?.full_name ||
      user?.email ||
      "User",
    [data.full_name, user]
  );

  /* Loading */
  if (!authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
        <Loader2 className="h-7 w-7 animate-spin text-secondary" />
      </div>
    );
  }

  /* Authentication redirect */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  try {
    if (user?.account_type) {
      return <Navigate to="/app" replace />;
    }
  } catch {
    /* ignore */
  }

  return (
    <div className="h-screen overflow-hidden bg-white text-slate-950">
      {/* DESKTOP TWO-PANEL LAYOUT*/}
      <div className="flex h-full flex-col lg:flex-row">
        {/* LEFT — WHITE ONBOARDING AREA */}
        <div className="flex h-full min-w-0 flex-1 flex-col bg-white">

          {/* HEADER — spans both panels */}
          <header className="border-b border-slate-200/70 bg-white">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-12">

              <Link
                to="/"
                className="transition-opacity hover:opacity-80"
              >
                <Logo />
              </Link>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Step {step + 1} of {STEPS.length}
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-xs font-medium text-slate-500">
                  Account setup
                </span>
              </div>
            </div>
          </header>

          {/* MOBILE PROGRESS */}
          <div className="border-b border-slate-200/80 bg-white lg:hidden">
            <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">

              <div className="flex items-center">
                {STEPS.map((s, i) => {
                  const completed = i < step;
                  const current = i === step;

                  return (
                    <React.Fragment key={s.id}>

                      <div
                        className="flex shrink-0 items-center"
                        title={s.label}
                      >
                        <div
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-300",

                            completed
                              ? "bg-emerald-500 text-white"

                              : current
                                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"

                                : "bg-slate-100 text-slate-400"
                          )}
                        >
                          {completed ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            i + 1
                          )}
                        </div>
                      </div>

                      {i < STEPS.length - 1 && (
                        <div
                          className={cn(
                            "mx-2 h-px flex-1 transition-colors duration-300 sm:mx-4",

                            i < step
                              ? "bg-emerald-400"
                              : "bg-slate-200"
                          )}
                        />
                      )}

                    </React.Fragment>
                  );
                })}
              </div>

              <div className="mt-2 text-center">
                <span className="text-xs font-medium text-slate-600">
                  {STEPS[step].label}
                </span>
              </div>

            </div>
          </div>

          {/* MAIN CONTENT */}
          <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-3">

              {/* ONBOARDING CONTENT */}
              <section className="min-w-0">
                <div
                  key={step}
                  // className="animate-in fade-in slide-in-from-right-4 duration-500"
                  className={cn(
                    "animate-in duration-500 ease-out",
                    direction === "forward"
                      ? "slide-in-from-right-8"
                      : "slide-in-from-left-8"
                  )}
                >
                  {step === 0 && (
                    <AccountTypeStep
                      data={data}
                      update={update}
                    />
                  )}

                  {step === 1 && (
                    <DetailsStep
                      data={data}
                      update={update}
                      user={user}
                      displayName={displayName}
                      errors={errors}
                    />
                  )}

                  {step === 2 && (
                    <WalletStep
                      data={data}
                      update={update}
                      errors={errors}
                      walletBusy={walletBusy}
                      linkMetaMask={linkMetaMask}
                      skipWallet={skipWallet}
                    />
                  )}

                  {step === 3 && (
                    <ReviewStep
                      data={data}
                      user={user}
                      displayName={displayName}
                      setStep={setStep}
                      errors={errors}
                    />
                  )}
                </div>

                {/* Completion error */}
                {errors.complete && (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errors.complete}
                  </div>
                )}
              </section>

            </div>

          </main>

          {/* FOOTER / NAVIGATION */}
          <footer className="border-t border-slate-200/80 bg-white">
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-8 lg:px-12">

              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 0 || saving}
                className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </Button>


              {step < STEPS.length - 1 ? (

                <Button
                  onClick={handleContinue}
                  disabled={saving || walletBusy || (step === 2 && data.wallet_status !== "linked")}
                  className="min-w-[120px] shadow-sm shadow-primary/20"
                >
                  Continue

                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>

              ) : (

                <Button
                  onClick={completeSetup}
                  disabled={saving}
                  className="min-w-[145px] shadow-sm shadow-primary/20"
                >

                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  )}

                  Complete Setup
                </Button>

              )}

            </div>
          </footer>

        </div>

        {/*  RIGHT — TRUSTDOCS BLUE PROGRESS PANEL */}
        <aside className="hidden lg:flex lg:w-[340px] lg:shrink-0 xl:w-[370px]">
          <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#020B24] bg-cover bg-center"
            style={{
              backgroundImage: "url('/onboarding.png')",
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-[#020B24]/65" />

            {/* Blue glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-[#020B24]/50" />

            {/* GLASSMORPHISM STEPS CARD */}
            <div className="relative w-[calc(100%-48px)] max-w-[290px] rounded-[26px] border border-white/20 bg-white/10 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl xl:p-6">

              {/* Small top accent */}
              <div className="mb-5 h-1 w-8 rounded-full bg-white/60" />

              {/* PROGRESS BAR */}
              <div className="mb-7">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/50">
                    Setup progress
                  </span>

                  <span className="text-[11px] font-semibold text-white/80">
                    {Math.round(((step + 1) / STEPS.length) * 100)}%
                  </span>
                </div>

                {/* Progress track */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  {/* Progress fill */}
                  <div
                    // className="h-full rounded-full bg-[#4F7CCB] transition-all duration-500 ease-out"
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 ease-out"
                    style={{
                      width: `${((step + 1) / STEPS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* STEPS */}
              <div className="relative">
                {STEPS.map((s, i) => {
                  const completed = i < step;
                  const current = i === step;

                  return (
                    <div
                      key={s.id}
                      className="relative flex gap-3.5"
                    >
                      {/* Vertical connecting line */}
                      {i < STEPS.length - 1 && (
                        <div
                          className={cn(
                            "absolute left-[13px] top-7 h-[calc(100%-2px)] w-px transition-colors duration-500",

                            completed
                              ? "bg-[#4F7CCB]/80"
                              : "bg-white/15"
                          )}
                        />
                      )}

                      {/* Step circle */}
                      <div
                        className={cn(
                          "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-300",

                          // Completed step - dark blue
                          completed &&
                          "bg-[#047857] text-white shadow-md shadow-black/20",

                          // Current step
                          current &&
                          "border-2 border-white bg-white text-[#0F2A5F] shadow-lg shadow-black/10",

                          // Future step
                          !completed &&
                          !current &&
                          "border border-white/25 bg-white/5 text-white/40"
                        )}
                      >
                        {completed ? (
                          <Check
                            className="h-3.5 w-3.5"
                            strokeWidth={3}
                          />
                        ) : (
                          i + 1
                        )}
                      </div>

                      {/* Step information */}
                      <div className="pb-9">
                        <p
                          className={cn(
                            "text-xs font-semibold transition-colors duration-300",

                            current
                              ? "text-white"
                              : completed
                                ? "text-white/80"
                                : "text-white/40"
                          )}
                        >
                          {s.label}
                        </p>

                        <p
                          className={cn(
                            "mt-1.5 max-w-[190px] text-[10px] leading-4 transition-colors duration-300",

                            current
                              ? "text-white/65"
                              : completed
                                ? "text-white/50"
                                : "text-white/35"
                          )}
                        >
                          {s.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}