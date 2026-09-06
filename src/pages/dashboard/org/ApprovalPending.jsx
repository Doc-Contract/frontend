import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  Clock,
  CheckCircle2,
  Building2,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Mail,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";

export default function ApprovalPending() {
  const { user, checkUserAuth, logout } = useAuth();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const org = user?.organizations?.[0];
  const orgName = org?.name || user?.full_name || "Your University";
  const userEmail = user?.email || "";

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await checkUserAuth();
      // If approved, DashboardRouter will redirect automatically
      navigate("/app", { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/choose-portal", { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between relative overflow-x-hidden">
      {/* Background glow */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoImg} alt="TrustDocs Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Trust<span className="text-indigo-600">Docs</span>
          </span>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-xs text-slate-600 hover:text-slate-900 border-slate-200"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          Log out
        </Button>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-2xl mx-auto px-5 py-8 w-full">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-10 text-center">
          {/* Status Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-md shadow-amber-600/10 mb-6">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 text-amber-800 text-xs font-semibold mb-3 border border-amber-200">
            Application Status: Pending Review
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            University Approval Pending
          </h1>

          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your university portal application for <strong className="text-slate-900">{orgName}</strong> is queued for administrator review.
          </p>

          {/* Progress Timeline */}
          <div className="mt-8 p-5 rounded-2xl bg-slate-50 border border-slate-100 text-left">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Verification Progress
            </div>
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Account Created & Email Confirmed</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Submitted by {userEmail}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Administrator Review (In Progress)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Our compliance team is verifying institutional accreditation and signing authority.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 opacity-60">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Verified Issuer Access</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Issuing envelopes and blockchain anchoring unlocked.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-left flex items-start gap-3 text-xs text-blue-800 leading-relaxed">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Need expedited verification?</span> You can reach our institutional support desk with your accreditation documentation at{" "}
              <a href="mailto:support@trustdocs.io" className="underline font-medium hover:text-blue-900">
                support@trustdocs.io
              </a>
              .
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full sm:w-auto h-11 px-6 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Checking status..." : "Check approval status"}
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full sm:w-auto h-11 px-6 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Log out
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
        © 2026 TrustDocs Institutional Network. Trust & Verification Infrastructure.
      </footer>
    </div>
  );
}
