import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ label, value, icon: Icon, tone = "blue", hint, loading = false }) {
  const toneMap = {
    blue: "bg-secondary/10 text-secondary",
    green: "bg-success/10 text-success",
    amber: "bg-warning/10 text-warning",
    red: "bg-destructive/10 text-destructive",
    indigo: "bg-indigo-50 text-indigo-600",
  };
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-16 rounded bg-muted animate-pulse" />
          ) : (
            <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          )}
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("flex items-center justify-center w-11 h-11 rounded-lg shrink-0", toneMap[tone])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
