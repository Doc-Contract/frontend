import React from "react";
import { Sparkles } from "lucide-react";

export default function ComingSoon({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 text-secondary mb-5">
        <Sparkles className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">{title || "Coming in the next implementation phase"}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description ||
          "This module is part of the TrustDocs roadmap. Wire it to Doc-Contract envelopes when ready."}
      </p>
    </div>
  );
}
