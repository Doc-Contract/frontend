import React from "react";
import { Loader2, Inbox, AlertTriangle } from "lucide-react";

export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="w-7 h-7 animate-spin mb-3 text-secondary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", description, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted text-muted-foreground mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-foreground">Couldn't load this</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-5 inline-flex items-center text-sm font-medium text-secondary hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}
