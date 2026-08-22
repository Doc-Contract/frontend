import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw, HelpCircle } from "lucide-react";

const TONE = {
  green: "bg-success/10 text-success border-success/20",
  amber: "bg-warning/10 text-warning border-warning/20",
  red: "bg-destructive/10 text-destructive border-destructive/20",
  blue: "bg-secondary/10 text-secondary border-secondary/20",
  gray: "bg-muted text-muted-foreground border-border",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
};

const ICON = {
  green: CheckCircle2,
  amber: Clock,
  red: XCircle,
  blue: AlertCircle,
  gray: HelpCircle,
  indigo: RefreshCw,
};

export function statusTone(status) {
  const s = (status || "").toLowerCase();
  if (["verified", "active", "verified issuer", "completed", "signed", "delivered", "success", "true"].includes(s)) return "green";
  if (["pending verification", "pending", "awaiting", "draft", "invited"].includes(s)) return "amber";
  if (["revoked", "rejected", "suspended", "declined", "failed", "expired", "error", "false"].includes(s)) return "red";
  if (["superseded", "viewed", "modified"].includes(s)) return "indigo";
  if (["not_found", "not found", "unable_to_verify", "unable to verify"].includes(s)) return "gray";
  return "blue";
}

export default function StatusBadge({ status, size = "md", className, icon = true }) {
  const tone = statusTone(status);
  const Icon = icon ? ICON[tone] : null;
  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-1.5",
  };
  return (
    <span className={cn("inline-flex items-center font-medium rounded-full border whitespace-nowrap", sizes[size], TONE[tone], className)}>
      {Icon && <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      <span className="capitalize">{String(status)}</span>
    </span>
  );
}
