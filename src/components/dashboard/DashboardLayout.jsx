import React, { useState } from "react";
import { NavLink, Link, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ navGroups, roleLabel }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-sidebar-primary to-secondary text-white">
            <ShieldCheck className="w-5 h-5" strokeWidth={2.4} />
          </div>
          <span className="text-lg font-semibold text-white">
            Trust<span className="text-secondary">Docs</span>
          </span>
        </Link>
      </div>

      <div className="px-3 py-2 shrink-0">
        <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">{roleLabel}</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-white"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white"
                    )
                  }
                >
                  {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sidebar-accent text-white text-sm font-semibold shrink-0">
            {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user?.full_name || "User"}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => logout()}
            className="text-sidebar-foreground/70 hover:text-white p-1.5 rounded-md hover:bg-sidebar-accent"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 z-30">{SidebarContent}</aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{SidebarContent}</div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6">
          <button className="lg:hidden p-2 -ml-2 text-muted-foreground" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block text-sm text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{user?.full_name || "there"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/verify">
              <Button variant="outline" size="sm">
                Verify document
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </Link>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
