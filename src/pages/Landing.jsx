import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  FileCheck2,
  QrCode,
  PenLine,
  Building2,
  UserRound,
  ArrowRight,
  CheckCircle2,
  Lock,
  Fingerprint,
  Layers,
  Zap,
} from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Platform
            </a>
            <a href="#how" className="hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#roles" className="hover:text-foreground transition-colors">
              For you
            </a>
            <Link to="/verify" className="hover:text-foreground transition-colors">
              Verify a document
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/verify" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">
                Verify document
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link to="/app">
                <Button size="sm">
                  Go to dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register" className="inline-flex">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            Blockchain-backed document trust
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight text-foreground text-balance max-w-4xl mx-auto font-heading">
            Documents that anyone can <span className="text-secondary">trust</span>, instantly
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            TrustDocs lets organizations issue, sign and verify credentials with tamper-proof records — no
            cryptocurrency, no blockchain expertise required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link to="/app">
                <Button size="lg" className="w-full sm:w-auto">
                  Go to dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start with TrustDocs <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            )}
            <Link to="/verify">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <QrCode className="w-4 h-4 mr-1.5" /> Verify a document
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Free to start · No wallet setup needed · GDPR-aware</p>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { k: "100%", v: "Tamper-evident records" },
            { k: "<2s", v: "Public verification" },
            { k: "0", v: "Cryptocurrency needed" },
            { k: "24/7", v: "Verification availability" },
          ].map((s) => (
            <div key={s.v}>
              <p className="text-2xl font-semibold text-foreground">{s.k}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground font-heading">
            One platform for document trust
          </h2>
          <p className="mt-3 text-muted-foreground">
            Issue, receive, sign and verify — all anchored to immutable verification records.
          </p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: FileCheck2,
              tone: "text-secondary",
              title: "Issue trusted credentials",
              desc: "Organizations issue certificates, diplomas and contracts with a unique verification record.",
            },
            {
              icon: QrCode,
              tone: "text-success",
              title: "Verify anywhere",
              desc: "Recipients and third parties verify by envelope ID in seconds. PDF and QR arrive next.",
            },
            {
              icon: PenLine,
              tone: "text-indigo-600",
              title: "Electronic signatures",
              desc: "Send documents for legally-aligned e-signatures and track status in real time.",
            },
            {
              icon: Lock,
              tone: "text-secondary",
              title: "Tamper-evident",
              desc: "Any modification is detected instantly against the anchored content hash.",
            },
            {
              icon: Fingerprint,
              tone: "text-success",
              title: "Revocation & superseding",
              desc: "Revoke compromised documents or replace them with a new verified version.",
            },
            {
              icon: Layers,
              tone: "text-indigo-600",
              title: "Version history",
              desc: "Every revision is tracked, so the full lifecycle of a document is auditable.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`flex items-center justify-center w-11 h-11 rounded-lg bg-muted ${f.tone}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground font-heading">How TrustDocs works</h2>
            <p className="mt-3 text-muted-foreground">Simple for everyone. Blockchain stays behind the scenes.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                icon: Building2,
                title: "Organizations issue",
                desc: "A verified issuer creates a document. TrustDocs anchors a verification record automatically.",
              },
              {
                n: "02",
                icon: UserRound,
                title: "Recipients receive",
                desc: "The holder gets a shareable verification link and can present the credential anywhere.",
              },
              {
                n: "03",
                icon: ShieldCheck,
                title: "Anyone verifies",
                desc: "Third parties confirm authenticity by envelope ID in seconds — no account needed.",
              },
            ].map((s) => (
              <div key={s.n} className="relative rounded-xl border border-border bg-background p-6">
                <span className="text-xs font-mono text-muted-foreground">{s.n}</span>
                <s.icon className="w-7 h-7 text-secondary mt-3" />
                <h3 className="mt-3 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground font-heading">Built for your role</h2>
        </div>
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-secondary/10 text-secondary">
                <UserRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">For individuals</h3>
            </div>
            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              {["Receive credentials", "View and download documents", "Share verification links", "Verify documents", "Sign documents"].map(
                (i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> {i}
                  </li>
                )
              )}
            </ul>
            <Link to="/register" className="mt-6 inline-flex">
              <Button variant="outline">
                Create individual account <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">For organizations</h3>
            </div>
            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              {[
                "Issue and manage certificates",
                "Verify documents",
                "Send documents for signature",
                "Revoke or replace issued documents",
                "Team & audit trail",
              ].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> {i}
                </li>
              ))}
            </ul>
            <Link to="/register" className="mt-6 inline-flex">
              <Button variant="outline">
                Create organization account <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-10 sm:p-14 text-center text-white">
          <Zap className="w-10 h-10 mx-auto opacity-90" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight font-heading">
            Ready to make your documents trustworthy?
          </h2>
          <p className="mt-3 text-white/80 max-w-xl mx-auto">
            Set up your account in minutes. Optionally link MetaMask later — no crypto needed.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={isAuthenticated ? "/app" : "/register"}>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                {isAuthenticated ? "Go to dashboard" : "Get started free"}
              </Button>
            </Link>
            <Link to="/verify">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Verify a document
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TrustDocs. Document trust, simplified.
          </p>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link to="/verify" className="hover:text-foreground">
              Verify
            </Link>
            <a href="#features" className="hover:text-foreground">
              Platform
            </a>
            <Link to="/login" className="hover:text-foreground">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
