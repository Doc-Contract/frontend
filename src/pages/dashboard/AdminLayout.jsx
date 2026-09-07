import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Clock, BadgeCheck, Ban, ScrollText, Settings } from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/app/admin", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Organizations",
    items: [
      { label: "Pending Review", path: "/app/admin/pending", icon: Clock },
      { label: "Verified Issuers", path: "/app/admin/verified", icon: BadgeCheck },
      { label: "Suspended", path: "/app/admin/suspended", icon: Ban },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Audit Trail", path: "/app/admin/audit", icon: ScrollText },
      { label: "Settings", path: "/app/admin/settings", icon: Settings },
    ],
  },
];

import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function AdminLayout() {
  const { user } = useAuth();

  if (!user?.is_admin && !user?.is_superadmin) {
    return <Navigate to="/app" replace />;
  }

  return <DashboardLayout navGroups={navGroups} roleLabel="TrustDocs Admin" />;
}
