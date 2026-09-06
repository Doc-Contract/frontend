import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import logoImg from "@/assets/logo.png";

const PORTALS = [
  {
    id: "individual",
    title: "Individual Portal",
    badge: "Students & Recipients",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: User,
    accent: "from-blue-600 to-indigo-600",
    bgHover: "hover:border-blue-300 hover:shadow-blue-500/10",
    description:
      "For students, certificate recipients, and individuals verifying or signing credentials.",
    features: [
      "Access personal document vault",
      "Verify and sign incoming documents",
      "Cryptographic credential ownership",
    ],
    buttonText: "Continue as Individual",
    path: "/login?portal=individual",
  },
  {
    id: "university",
    title: "University & Institutions",
    badge: "Issuing Authorities",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: GraduationCap,
    accent: "from-indigo-600 to-purple-600",
    bgHover: "hover:border-indigo-300 hover:shadow-indigo-500/10",
    description:
      "For universities, academic institutions, and organizations issuing official documents.",
    features: [
      "Issue blockchain-anchored certificates",
      "Manage envelopes & multi-party signing",
      "University verification & audit trail",
    ],
    buttonText: "Enter University Portal",
    path: "/login?portal=university",
  },
  {
    id: "admin",
    title: "Admin Portal",
    badge: "System Governance",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    icon: ShieldCheck,
    accent: "from-slate-800 to-indigo-950",
    bgHover: "hover:border-slate-400 hover:shadow-slate-500/10",
    description:
      "Restricted portal for system administrators, compliance officers, and platform auditors.",
    features: [
      "Review & approve university applications",
      "Full cryptographic audit log inspection",
      "Platform configuration & monitoring",
    ],
    buttonText: "Access Admin Portal",
    path: "/login?portal=admin",
  },
];

export default function PortalSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-slate-50 relative flex flex-col justify-between overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[450px] h-[450px] rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logoImg} alt="TrustDocs Logo" className="w-9 h-9 object-contain" />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Trust<span className="text-indigo-600">Docs</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/register"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Create an account
          </Link>
          <Link
            to="/verify"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Verify Document
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 flex-1 flex flex-col justify-center items-center text-center">
        {/* Header Badges & Titles */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-semibold mb-4 border border-indigo-200/60">
          <ShieldCheck className="w-3.5 h-3.5" />
          Secure Document Ecosystem
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 max-w-2xl">
          Choose your portal
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl">
          TrustDocs provides tailored workflows based on your role. Select your destination below to log in to your portal.
        </p>

        {/* Portal Cards Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {PORTALS.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                onClick={() => navigate(portal.path)}
                className={`group cursor-pointer rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between ${portal.bgHover}`}
              >
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${portal.accent} text-white flex items-center justify-center shadow-md shadow-indigo-600/10 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${portal.badgeColor}`}
                    >
                      {portal.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {portal.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed min-h-[40px]">
                    {portal.description}
                  </p>

                  {/* Feature Checklist */}
                  <ul className="mt-6 space-y-2.5 pt-5 border-t border-slate-100">
                    {portal.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-600"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-8 pt-4">
                  <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 text-xs sm:text-sm font-semibold transition-all">
                    <span>{portal.buttonText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>© 2026 TrustDocs. All rights reserved. Blockchain Document Trust Network.</div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hover:text-slate-600 transition-colors">
            Direct Login
          </Link>
          <span>·</span>
          <Link to="/register" className="hover:text-slate-600 transition-colors">
            New Registration
          </Link>
        </div>
      </footer>
    </div>
  );
}
