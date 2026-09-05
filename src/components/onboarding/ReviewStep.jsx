import React from "react";
import {
  Pencil,
  UserRound,
  Building2,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Circle,
  ShieldCheck,
} from "lucide-react";

import { cn, slugify } from "@/lib/utils";

export default function ReviewStep({
  data,
  user,
  displayName,
  setStep,
  errors,
}) {
  const isIndividual = data.account_type === "individual";

  return (
    <div className="w-full">
      {/* HEADER */}
      <div>
        <div className="inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1">
          <span className="text-[10px] font-semibold tracking-[0.16em] text-primary">
            FINAL REVIEW
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Review and complete.
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
          Check your information before creating your TrustDocs workspace.
        </p>
      </div>

      {/* REVIEW CARDS */}
      <div className="mt-8 space-y-4">
        {/* ACCOUNT TYPE */}
        <ReviewCard
          icon={isIndividual ? UserRound : Building2}
          title="Account type"
          onEdit={() => setStep(0)}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {isIndividual
                  ? "For myself"
                  : "For my organization"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {isIndividual
                  ? "Individual TrustDocs workspace"
                  : "Organization TrustDocs workspace"}
              </p>
            </div>

            <StatusBadge type="success">
              Selected
            </StatusBadge>
          </div>
        </ReviewCard>

        {/* DETAILS */}
        <ReviewCard
          icon={isIndividual ? UserRound : Building2}
          title={
            isIndividual
              ? "Your details"
              : "Organization details"
          }
          onEdit={() => setStep(1)}
        >
          {isIndividual ? (
            <ReviewRows
              rows={[
                ["Display name", displayName],
                ["Email address", user?.email],
              ]}
            />
          ) : (
            <ReviewRows
              rows={[
                ["Organization", data.org_name],
                ["Workspace slug", slugify(data.org_name)],
                ["Country", data.country || "—"],
                ["Website", data.website || "—"],
              ]}
            />
          )}
        </ReviewCard>

        {/* WALLET */}
        <ReviewCard
          icon={Wallet}
          title="Wallet"
          onEdit={() => setStep(2)}
        >
          <WalletReview data={data} />
        </ReviewCard>
      </div>

      {/* FINAL SECURITY NOTE */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

        <p className="text-xs leading-5 text-slate-500">
          You can update these settings later from your TrustDocs workspace.
          Your wallet remains optional and does not affect document access.
        </p>
      </div>

      {/* COMPLETE ERROR */}
      {errors.complete && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

          <p className="text-xs leading-5 text-red-700">
            {errors.complete}
          </p>
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  icon: Icon,
  title,
  onEdit,
  children,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_35px_-22px_rgba(15,23,42,0.22)]">
      {/* CARD HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/10 bg-primary/5 text-primary">
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </div>

          <h3 className="text-sm font-semibold text-slate-900">
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>

      {/* CARD CONTENT */}
      <div className="px-5 py-5 sm:px-6">
        {children}
      </div>
    </div>
  );
}

function ReviewRows({ rows }) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {rows.map(([key, value]) => (
        <div key={key} className="min-w-0">
          <dt className="text-xs font-medium text-slate-400">
            {key}
          </dt>

          <dd className="mt-1 truncate text-sm font-semibold text-slate-900">
            {value || "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function WalletReview({ data }) {
  const linked =
    data.wallet_status === "linked" &&
    data.wallet_address;

  const failed =
    data.wallet_status === "failed";

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              linked
                ? "bg-emerald-100 text-emerald-700"
                : failed
                  ? "bg-red-100 text-red-600"
                  : "bg-slate-100 text-slate-500"
            )}
          >
            {linked ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : failed ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {linked
                ? "Wallet connected"
                : failed
                  ? "Wallet connection failed"
                  : "Wallet skipped"}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {linked
                ? "Your blockchain identity is linked to TrustDocs."
                : failed
                  ? "You can retry connecting your wallet."
                  : "You can connect a wallet later from settings."}
            </p>
          </div>
        </div>

        <StatusBadge
          type={
            linked
              ? "success"
              : failed
                ? "error"
                : "neutral"
          }
        >
          {linked
            ? "Linked"
            : failed
              ? "Failed"
              : "Optional"}
        </StatusBadge>
      </div>

      {data.wallet_address && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-400">
            Wallet address
          </p>

          <code className="block truncate rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-600">
            {data.wallet_address}
          </code>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  type = "neutral",
  children,
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold",

        type === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",

        type === "error" &&
          "border-red-200 bg-red-50 text-red-700",

        type === "neutral" &&
          "border-slate-200 bg-slate-50 text-slate-500"
      )}
    >
      {children}
    </span>
  );
}