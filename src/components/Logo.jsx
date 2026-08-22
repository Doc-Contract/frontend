import React from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Logo({ className, iconOnly = false, light = false }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-sm">
        <ShieldCheck className="w-5 h-5" strokeWidth={2.4} />
      </div>
      {!iconOnly && (
        <span className={cn("text-lg font-semibold tracking-tight font-heading", light ? "text-white" : "text-foreground")}>
          Trust<span className="text-secondary">Docs</span>
        </span>
      )}
    </div>
  );
}
