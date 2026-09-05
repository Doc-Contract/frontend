import React from "react";
import {
  UserRound,
  Mail,
  Building2,
  Globe2,
  MapPin,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DetailsStep({
  data,
  update,
  user,
  displayName,
  errors,
}) {
  if (data.account_type === "individual") {
    return (
      <div>

        <StepHeader
          eyebrow="YOUR PROFILE"
          title="Let's confirm your details."
          description="Your account information is already available from your sign-in."
        />

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_35px_-20px_rgba(15,23,42,0.18)]">
          <div className="p-5 sm:p-6">
            <Label className="text-sm font-medium text-slate-700">
              Display name
            </Label>

            <div className="relative mt-2">
              <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={data.full_name}
                onChange={(e) =>
                  update({
                    full_name: e.target.value,
                  })
                }
                placeholder="Enter your display name"
                className="h-12 rounded-xl border-slate-200 bg-slate-50/40 pl-11 shadow-none transition-all placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <InfoRow
            icon={Mail}
            label="Email address"
            value={user?.email}
          />

        </div>

        <div className="mt-5 flex gap-3 rounded-xl border border-primary/10 bg-primary/[0.025] p-4">
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />

          <p className="text-xs leading-5 text-slate-500">
            These details are connected to your TrustDocs account and are used to
            personalize your workspace.
          </p>
        </div>

      </div>
    );
  }

  return (
    <div>

      <StepHeader
        eyebrow="ORGANIZATION"
        title="Tell us about your organization."
        description="This information will be used to create your organization workspace."
      />

      <div className="mt-10 space-y-6">

        <Field
          label="Organization name"
          error={errors.org_name}
          icon={Building2}
        >
          <Input
            value={data.org_name}
            onChange={(e) =>
              update({
                org_name: e.target.value,
              })
            }
            placeholder="Northgate University"
            className="h-12 rounded-xl border-slate-200 bg-slate-50/40 pl-11 shadow-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">

          <Field
            label="Country"
            optional
            icon={MapPin}
          >
            <Input
              value={data.country}
              onChange={(e) =>
                update({
                  country: e.target.value,
                })
              }
              placeholder="United Kingdom"
              className="h-12 rounded-xl border-slate-200 bg-slate-50/40 pl-11 shadow-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </Field>

          <Field
            label="Website"
            optional
            icon={Globe2}
          >
            <Input
              value={data.website}
              onChange={(e) =>
                update({
                  website: e.target.value,
                })
              }
              placeholder="https://example.org"
              className="h-12 rounded-xl border-slate-200 bg-slate-50/40 pl-11 shadow-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </Field>

        </div>

      </div>

    </div>
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

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="group flex items-center gap-4 p-5 sm:p-6 transition-colors hover:bg-slate-50/70">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/5 text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-900 sm:text-[15px]">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  optional,
  error,
  icon: Icon,
  children,
}) {
  return (
    <div className="space-y-2">

      <div className="flex items-center justify-between">

        <Label className="text-sm font-medium text-slate-700">
          {label}
        </Label>

        {optional && (
          <span className="text-xs text-slate-400">
            Optional
          </span>
        )}

      </div>

      <div className="relative">

        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
        )}

        {children}

      </div>

      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}

    </div>
  );
}