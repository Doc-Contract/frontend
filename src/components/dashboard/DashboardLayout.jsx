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

      <div className="px-3 py-2.5 shrink-0">
        <span className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">{roleLabel}</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3.5 pb-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-white font-semibold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white"
                    )
                  }
                >
                  {item.icon && <item.icon className="w-4.5 h-4.5 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3.5 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sidebar-accent text-white text-base font-semibold shrink-0">
            {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.full_name || "User"}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => logout()}
            className="text-sidebar-foreground/70 hover:text-white p-2 rounded-lg hover:bg-sidebar-accent"
            title="Sign out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 z-30">{SidebarContent}</aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72">{SidebarContent}</div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 h-16 bg-card/85 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sm:px-8">
          <button className="lg:hidden p-2 -ml-2 text-muted-foreground" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block text-base text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.full_name || "there"}</span>
          </div>
          <div className="flex items-center gap-3">
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

        <main className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
