import React from "react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Building2, Clock, BadgeCheck, Ban } from "lucide-react";

const MOCK = [
  { name: "Northgate University", type: "University", country: "United Kingdom", status: "Pending Verification", applied: "2025-08-18" },
  { name: "CloudSkill Institute", type: "Training Institute", country: "India", status: "Pending Verification", applied: "2025-08-15" },
  { name: "SecureCert Ltd", type: "Certification Provider", country: "Singapore", status: "Verified Issuer", applied: "2025-07-30" },
];

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">Admin Portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage organization applications on TrustDocs.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Review" value={2} icon={Clock} tone="amber" />
        <StatCard label="Verified Issuers" value={1} icon={BadgeCheck} tone="green" />
        <StatCard label="Total Organizations" value={3} icon={Building2} tone="blue" />
        <StatCard label="Suspended" value={0} icon={Ban} tone="red" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Organization applications</h2>
          <p className="text-sm text-muted-foreground">Full approval workflow arrives in the next phase.</p>
        </div>
        <ul className="divide-y divide-border">
          {MOCK.map((o) => (
            <li key={o.name} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{o.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {o.type} · {o.country} · applied {o.applied}
                </p>
              </div>
              <StatusBadge status={o.status} size="sm" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
