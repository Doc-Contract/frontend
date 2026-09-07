import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  ShieldCheck,
  Ban,
  Send,
  FileEdit,
  PenLine,
  CheckCircle2,
  Users,
  Building2,
  ScrollText,
  Wallet,
  Settings,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/app/organization", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Trust Registry",
    items: [
      { label: "Issue Document", path: "/app/organization/issue", icon: FilePlus2 },
      { label: "Issued Documents", path: "/app/organization/issued", icon: FileText },
      { label: "Verify Document", path: "/app/organization/verify", icon: ShieldCheck },
      { label: "Revoked and Superseded", path: "/app/organization/revoked", icon: Ban },
    ],
  },
  // {
  //   label: "eSign",
  //   items: [
  //     { label: "Send for Signature", path: "/app/organization/send", icon: Send },
  //     { label: "Drafts", path: "/app/organization/drafts", icon: FileEdit },
  //     { label: "Awaiting Signatures", path: "/app/organization/awaiting", icon: PenLine },
  //     { label: "Completed", path: "/app/organization/completed", icon: CheckCircle2 },
  //   ],
  // },
  {
    label: "Organization",
    items: [
      { label: "Team Members", path: "/app/organization/team", icon: Users },
      { label: "Organization Verification", path: "/app/organization/verification", icon: Building2 },
      { label: "Audit Trail", path: "/app/organization/audit", icon: ScrollText },
      { label: "Wallet", path: "/app/organization/wallet", icon: Wallet },
      { label: "Settings", path: "/app/organization/settings", icon: Settings },
    ],
  },
];

export default function OrgLayout() {
  return <DashboardLayout navGroups={navGroups} roleLabel="Organization" />;
}
