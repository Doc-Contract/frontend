import React from "react";
import {
  UserRound,
  Building2,
  Check,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
  {
    value: "individual",
    icon: UserRound,
    eyebrow: "PERSONAL",
    title: "For myself",
    description:
      "A private workspace to receive, verify, sign, and securely manage your documents.",
    features: [
      "Personal document vault",
      "Instant verification",
      "Secure sharing",
    ],
  },
  {
    value: "organization",
    icon: Building2,
    eyebrow: "BUSINESS",
    title: "For my organization",
    description:
      "A powerful workspace to issue, manage, verify, and revoke trusted documents.",
    features: [
      "Issue verified documents",
      "Organization management",
      "Access control",
    ],
  },
];

export default function AccountTypeStep({ data, update }) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />

          <span className="text-xs font-medium text-primary">
            Welcome to TrustDocs
          </span>
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          How will you use TrustDocs?
        </h1>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
          Choose the workspace that best matches your needs. You can change your
          setup later.
        </p>
      </div>

      {/* Options */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          const active = data.account_type === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                update({
                  account_type: option.value,
                })
              }
              className={cn(
                "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border text-left",
                "p-5 sm:p-6",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                active
                  ? "border-primary/50 bg-primary/[0.025] shadow-[0_12px_35px_-15px_rgba(0,0,0,0.25)]"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_35px_-15px_rgba(0,0,0,0.2)]"
              )}
            >
              {/* Selected accent */}
              <div
                className={cn(
                  "absolute left-0 top-0 h-full w-1 transition-all duration-200",
                  active ? "bg-primary" : "bg-transparent"
                )}
              />

              {/* Selection indicator */}
              <div
                className={cn(
                  "absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200",
                  active
                    ? "bg-primary text-white"
                    : " bg-white text-transparent"
                )}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              </div>

              {/* Icon */}
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  "transition-all duration-200",
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                )}
              >
                <Icon className="h-5.5 w-5.5" strokeWidth={1.8} />
              </div>

              {/* Content */}
              <div className="mt-5 pr-7">
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-[0.16em]",
                    active ? "text-primary" : "text-slate-400"
                  )}
                >
                  {option.eyebrow}
                </span>

                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                  {option.title}
                </h2>

                <p className="mt-2 min-h-[60px] text-sm leading-5.5 text-slate-500">
                  {option.description}
                </p>
              </div>

              {/* Features */}
              <div className="mt-5 w-full border-t border-slate-100 pt-4">
                <div className="space-y-2.5">
                  {option.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-xs text-slate-500"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          active ? "bg-primary/10" : "bg-slate-100"
                        )}
                      >
                        <Check
                          className={cn(
                            "h-2.5 w-2.5",
                            active ? "text-primary" : "text-slate-400"
                          )}
                          strokeWidth={2.5}
                        />
                      </span>

                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom action */}
              <div
                className={cn(
                  "mt-auto flex w-full items-center justify-between pt-5",
                  "text-xs font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-slate-400 group-hover:text-slate-700"
                )}
              >
                <span>
                  {active ? "Currently selected" : "Choose this workspace"}
                </span>

                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-all",
                    active
                      ? "bg-primary/10"
                      : "bg-slate-100 group-hover:bg-slate-200"
                  )}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
        <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />

        <span>
          Your selection only determines your initial workspace experience.
        </span>

        <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
      </div>
    </div>
  );
}