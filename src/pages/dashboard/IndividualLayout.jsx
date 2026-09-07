import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  LayoutDashboard,
  Inbox,
  Share2,
  History,
  PenLine,
  CheckCircle2,
  Wallet,
  UserCircle,
  Lock,
  Bell,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/app/individual", icon: LayoutDashboard, end: true }],
  },
  {
    label: "My Credentials",
    items: [
      { label: "Received Documents", path: "/app/individual/received", icon: Inbox },
      { label: "Shared Documents", path: "/app/individual/shared", icon: Share2 },
      { label: "Verification History", path: "/app/individual/verification-history", icon: History },
    ],
  },
  // {
  //   label: "eSign",
  //   items: [
  //     { label: "Awaiting My Signature", path: "/app/individual/awaiting-signature", icon: PenLine },
  //     { label: "Completed Documents", path: "/app/individual/completed-docs", icon: CheckCircle2 },
  //   ],
  // },
  {
    label: "Account",
    items: [
      { label: "Wallet", path: "/app/individual/wallet", icon: Wallet },
      { label: "Profile", path: "/app/individual/profile", icon: UserCircle },
      { label: "Security", path: "/app/individual/security", icon: Lock },
      { label: "Notification Preferences", path: "/app/individual/notifications", icon: Bell },
    ],
  },
];

export default function IndividualLayout() {
  return <DashboardLayout navGroups={navGroups} roleLabel="Individual" />;
}
