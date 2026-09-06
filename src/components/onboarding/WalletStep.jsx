import React, { useState } from "react";
import {
  Wallet,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Copy,
  KeyRound,
  Fingerprint,
  LockKeyhole,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function WalletStep({
  data,
  update,
  errors,
  walletBusy,
  linkMetaMask,
}) {
  const isLinked =
    data.wallet_status === "linked" &&
    data.wallet_address;

  return (
    <div className="w-full">

      {/* HEADER */}
      <StepHeader
        eyebrow="DIGITAL IDENTITY · REQUIRED"
        title="Connect your wallet."
        description="A MetaMask wallet is required to issue and sign documents on TrustDocs. This proves your blockchain identity."
      />

      {/* SECURITY CARD */}

      <div className="relative mt-8 overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-[0_18px_50px_-25px_rgba(15,23,42,0.55)]">

        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative p-6 sm:p-7">
          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] shadow-inner">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>

            <div>
              <h2 className="text-base font-semibold">
                Your wallet stays yours.
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                TrustDocs never receives or stores your
                private key or seed phrase.
              </p>
            </div>

          </div>

          <div className="mt-7 grid sm:grid-cols-3 gap-3">

            <SecurityFeature
              icon={KeyRound}
              title="No private key"
            />

            <SecurityFeature
              icon={Fingerprint}
              title="Ownership proof"
            />

            <SecurityFeature
              icon={LockKeyhole}
              title="Identity only"
            />

          </div>

        </div>

      </div>

      {/* CONSENT */}

      {!isLinked && (
        <label
          className={cn(
            "mt-5 flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all duration-200",
            data.wallet_consent
              ? "border-primary/40 bg-primary/[0.025] shadow-[0_10px_30px_-20px_rgba(15,23,42,0.2)]"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
          )}
        >

          <input
            type="checkbox"
            checked={data.wallet_consent}
            onChange={(e) =>
              update({
                wallet_consent:
                  e.target.checked,
              })
            }
            className="mt-1 w-4 h-4 rounded border-slate-300 accent-primary"
          />

          <div>

            <p className="text-sm font-medium text-slate-900">
              Link my MetaMask wallet
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              I understand that TrustDocs will only
              use my wallet to verify control of the
              blockchain address.
            </p>

          </div>

        </label>
      )}

      {errors.wallet_consent && (
        <p className="mt-2 text-xs text-destructive">
          {errors.wallet_consent}
        </p>
      )}

      {/* STATUS */}

      <div className="mt-5">

        {isLinked && (
          <LinkedWallet
            address={data.wallet_address}
          />
        )}

        {data.wallet_status === "linking" && (
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 ring-1 ring-emerald-200/70">              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Waiting for wallet confirmation
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Confirm the signature request in MetaMask.
              </p>
            </div>

          </div>
        )}

        {data.wallet_status === "failed" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex items-start gap-3">

              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />

              <div>

                <p className="text-sm font-semibold text-red-900">
                  Wallet connection failed
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  {data.wallet_error ||
                    "Try connecting again or skip for now."}
                </p>

                {!window.ethereum && (
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:underline"
                  >
                    Install MetaMask
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

              </div>

            </div>

          </div>
        )}

      </div>

      {/* ACTIONS */}

      {!isLinked && (
        <div className="mt-6 space-y-3">

          <Button
            onClick={linkMetaMask}
            disabled={walletBusy}
            className="h-12 w-full rounded-xl text-sm font-semibold shadow-[0_10px_25px_-12px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5"
          >
            {walletBusy ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wallet className="w-4 h-4 mr-2" />
            )}

            {walletBusy
              ? "Connecting wallet..."
              : "Connect MetaMask"}
          </Button>

          {!window.ethereum && (
            <p className="mt-2 text-center text-xs text-slate-500">
              MetaMask not detected.{" "}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Install MetaMask
              </a>{" "}
              to continue.
            </p>
          )}
        </div>
      )}

      {/* FOOTNOTE */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
        <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />

        <p className="text-xs leading-5 text-slate-500">
          Blockchain anchoring uses the TrustDocs server
          protocol wallet. Your MetaMask wallet is never
          used to anchor documents.
        </p>

      </div>

    </div >
  );
}

function SecurityFeature({
  icon: Icon,
  title,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3.5 transition-colors hover:bg-white/[0.07]">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
        <Icon className="h-4 w-4 text-emerald-400" />
      </div>

      <p className="mt-3 text-xs font-medium text-slate-300">
        {title}
      </p>
    </div>
  );
}

function LinkedWallet({ address }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>

        <div>
          <p className="text-sm font-semibold text-emerald-900">
            Wallet connected
          </p>

          <p className="text-xs text-emerald-700 mt-0.5">
            Your blockchain identity is linked.
          </p>
        </div>

      </div>

      <div className="mt-4 flex items-center gap-2">

        <code className="min-w-0 flex-1 truncate rounded-xl bg-white border border-emerald-200 px-4 py-3 text-xs font-mono text-slate-700">
          {address}
        </code>

        <CopyButton value={address} />

      </div>

    </div>
  );
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(value);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Ignore clipboard errors
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={copy}
      className="h-11 w-11 p-0 rounded-xl bg-white"
    >
      {copied ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  );
}

function StepHeader({
  eyebrow,
  title,
  description,
}) {
  return (
    <div>
      <div className="inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-primary">
          {eyebrow}
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>

      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
        {description}
      </p>
    </div>
  );
}