import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "@/api/auth";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LogIn,
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Search,
  User,
  GraduationCap,
} from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

// Import the generated TrustDocs image
// import trustDocsLogin from "@/assets/trustdocs-login.png";
import trustDocsLogin from "@/assets/login.png";
import logoImg from "@/assets/logo.png";

const PORTAL_META = {
  individual: {
    id: "individual",
    name: "Individual",
    title: "Individual Login",
    subtitle: "Log in to your personal document vault",
    badge: "Students & Recipients",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    icon: User,
    accent: "from-blue-600 to-indigo-600",
    iconBg: "bg-blue-50 text-blue-600 border-blue-100",
    showGoogle: true,
  },
  university: {
    id: "university",
    name: "University",
    title: "University Portal",
    subtitle: "Institutional document issuing & verification workspace",
    badge: "Universities & Issuers",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: GraduationCap,
    accent: "from-indigo-600 to-purple-600",
    iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
    showGoogle: true,
  },
  admin: {
    id: "admin",
    name: "Admin",
    title: "Admin Portal",
    subtitle: "Restricted system administration & compliance audit",
    badge: "System Governance",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    icon: ShieldCheck,
    accent: "from-slate-800 to-indigo-950",
    iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    showGoogle: false,
  },
};

function isEmailNotVerified(err) {
  const code = (err?.errorData || err?.error || "").toString();
  const msg = (err?.message || "").toString().toLowerCase();

  return (
    code === "email_not_verified" ||
    msg.includes("email_not_verified") ||
    msg.includes("verify your email") ||
    (err?.status === 403 &&
      (msg.includes("email") || msg.includes("verify")))
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, logout } = useAuth();

  const urlPortal = searchParams.get("portal")?.toLowerCase();
  const [portal, setPortal] = useState(
    urlPortal === "admin" || urlPortal === "university" ? urlPortal : "individual"
  );

  useEffect(() => {
    if (urlPortal === "admin" || urlPortal === "university" || urlPortal === "individual") {
      setPortal(urlPortal);
    }
  }, [urlPortal]);

  const handlePortalSwitch = (newPortal) => {
    setPortal(newPortal);
    setError("");
    const newParams = new URLSearchParams(searchParams);
    newParams.set("portal", newPortal);
    setSearchParams(newParams, { replace: true });
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const returnTo = safeReturnTo("/app");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setNeedsVerify(false);
    setResendMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const loggedUser = await login(cleanEmail, password, portal);

      // 1. Admin portal check: Must be an administrator
      if (portal === "admin") {
        if (!loggedUser?.is_admin) {
          await logout(false);
          setError("Access Denied: This account does not have administrator privileges. Please switch to the Individual or University portal.");
          setLoading(false);
          return;
        }
      }

      // 2. University portal check: Must NOT be an individual account
      else if (portal === "university") {
        if (loggedUser?.account_type === "individual") {
          await logout(false);
          setError("Account Role Mismatch: This account is registered as an Individual. Please switch to the Individual portal above to log in.");
          setLoading(false);
          return;
        }
      }

      // 3. Individual portal check: If registered as organization, direct to university portal
      else if (portal === "individual") {
        if (loggedUser?.account_type === "organization" && !loggedUser?.is_admin) {
          await logout(false);
          setError("Account Role Mismatch: This account is registered as an Institutional/University account. Please switch to the University portal above to access your issuing workspace.");
          setLoading(false);
          return;
        }
      }

      navigate(returnTo, { replace: true });
    } catch (err) {
      if (isEmailNotVerified(err)) {
        setNeedsVerify(true);
        setError(
          "Verify your email before logging in. Open the link we sent, or resend it below."
        );
      } else {
        setError(err.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Enter your email above, then resend verification.");
      return;
    }

    setResendMessage("");
    setResendLoading(true);

    try {
      await authApi.resendVerification(email.trim());

      setResendMessage(
        "If an unverified account exists for that email, a new verification link was sent."
      );
    } catch (err) {
      setError(err.message || "Failed to resend verification email");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogle = () => {
    authApi.startGoogle();
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-50">

      {/* =========================================================
          DESKTOP / TABLET SPLIT SCREEN
      ========================================================== */}
      <div className="flex h-full w-full">

        {/* LEFT IMAGE */}
        <div className="hidden md:flex md:w-[40%] lg:w-[45%] xl:w-[45%] h-full relative overflow-hidden bg-indigo-950 flex-col justify-between p-6 lg:p-10 z-10 text-white">

          {/* Background Image Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={trustDocsLogin}
              alt="TrustDocs secure document management"
              className="w-full h-full object-cover object-[75%_center]"
            />
            {/* Gradient overlay to ensure text readability */}
            {/* <div className="absolute inset-0 bg-indigo-950/20 bg-gradient-to-t from-indigo-950/90 via-transparent to-indigo-950/60" /> */}
          </div>

          {/* Content Top */}
          <div className="relative z-10 flex flex-col gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="TrustDocs Logo" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-bold tracking-tight">Trust<span className="text-blue-400">Docs</span></span>
            </div>

            {/* Slogan */}
            <p className="text-slate-200 font-medium tracking-wide">Secure. Verify. Trust.</p>

            {/* Divider */}
            <div className="w-8 h-0.5 bg-blue-500 rounded-full" />

            {/* Headline */}
            <div className="space-y-1">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                Trusted Documents,
              </h1>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-blue-400">
                Built on Blockchain
              </h1>
            </div>

            {/* Description */}
            <p className="text-slate-300 leading-relaxed max-w-sm mt-1 text-xs lg:text-sm">
              TrustDocs helps organizations and individuals verify documents with blockchain-powered security and transparency.
            </p>
          </div>

          {/* Content Bottom */}
          <div className="relative z-10">
            {/* Features Box */}
            <div className="rounded-2xl bg-indigo-950/40 backdrop-blur-md border border-white/10 p-4 lg:p-5 space-y-4 mb-4 shadow-xl">

              {/* Feature 1 */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Tamper Proof</h3>
                  <p className="text-[10px] text-slate-300 mt-0.5">Documents are immutable and secure</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5 shrink-0">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Instant Verification</h3>
                  <p className="text-[10px] text-slate-300 mt-0.5">Verify authenticity in seconds</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5 shrink-0">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Privacy Focused</h3>
                  <p className="text-[10px] text-slate-300 mt-0.5">Your data stays private and protected</p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="text-xs text-slate-400">
              © 2026 TrustDocs. All rights reserved.
            </div>
          </div>
        </div>

        {/* =======================================================
            RIGHT LOGIN AREA
        ======================================================== */}
        <div className="relative flex-1 h-full overflow-hidden bg-slate-50">

          {/* Background glow */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-100/70 blur-3xl pointer-events-none" />

          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />

          {/* =====================================================
              CENTER CONTENT
          ====================================================== */}
          <div className="relative z-10 h-full w-full overflow-y-auto md:overflow-hidden flex items-center justify-center px-5 py-6 sm:px-8">

            <div className="w-full max-w-[430px]">

              {/* =================================================
                  MOBILE LOGO
              ================================================== */}
              <div className="md:hidden flex justify-center mb-5">

                <div className="flex items-center gap-2.5">

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="text-xl font-bold tracking-tight text-slate-900">
                      TrustDocs
                    </div>

                    <div className="text-[10px] text-slate-500">
                      Secure. Simple. Trusted.
                    </div>
                  </div>

                </div>

              </div>

              {/* =================================================
                  LOGIN CARD
              ================================================== */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_25px_70px_-20px_rgba(15,23,42,0.20)] p-6 sm:p-8">

                {/* Portal Switcher Tabs */}
                <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-100/90 mb-6 text-xs font-semibold">
                  {[
                    { id: "individual", label: "Individual", icon: User },
                    { id: "university", label: "University", icon: GraduationCap },
                    { id: "admin", label: "Admin", icon: ShieldCheck },
                  ].map((p) => {
                    const active = portal === p.id;
                    const IconComp = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePortalSwitch(p.id)}
                        className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${active
                            ? "bg-white text-slate-900 shadow-sm font-bold"
                            : "text-slate-500 hover:text-slate-900 font-medium"
                          }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Portal Header */}
                {(() => {
                  const activeMeta = PORTAL_META[portal] || PORTAL_META.individual;
                  const ActiveIcon = activeMeta.icon;
                  return (
                    <div className="text-center mb-6">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border mb-3.5 ${activeMeta.badgeClass}`}
                      >
                        <ActiveIcon className="w-3 h-3" />
                        <span>{activeMeta.badge}</span>
                      </div>

                      <div
                        className={`mx-auto mb-3 w-12 h-12 rounded-2xl border flex items-center justify-center ${activeMeta.iconBg}`}
                      >
                        <ActiveIcon className="w-5 h-5" />
                      </div>

                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        {activeMeta.title}
                      </h1>

                      <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                        {activeMeta.subtitle}
                      </p>
                    </div>
                  );
                })()}

                {/* =================================================
                    GOOGLE LOGIN (Hidden on Admin portal)
                ================================================== */}
                {(PORTAL_META[portal] || PORTAL_META.individual).showGoogle && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogle}
                      className="w-full h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium shadow-sm transition-all"
                    >
                      <GoogleIcon className="w-5 h-5 mr-3" />
                      Continue with Google
                    </Button>

                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                          or
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* =================================================
                    ERROR MESSAGE
                ================================================== */}
                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5">

                    <div className="flex items-start gap-2.5">

                      <AlertCircle className="w-4.5 h-4.5 text-red-500 mt-0.5 shrink-0" />

                      <div className="text-sm">

                        <p className="text-red-700 leading-5">
                          {error}
                        </p>

                        {error.includes("Individual portal") && portal !== "individual" && (
                          <button
                            type="button"
                            onClick={() => handlePortalSwitch("individual")}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100/90 text-xs font-bold text-red-800 hover:bg-red-200 transition-colors"
                          >
                            <span>Switch to Individual Portal</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {error.includes("University portal") && portal !== "university" && (
                          <button
                            type="button"
                            onClick={() => handlePortalSwitch("university")}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100/90 text-xs font-bold text-red-800 hover:bg-red-200 transition-colors"
                          >
                            <span>Switch to University Portal</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {needsVerify && (
                          <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading}
                            className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:text-red-800 hover:underline disabled:opacity-50"
                          >
                            {resendLoading
                              ? "Sending..."
                              : "Resend verification email"}

                            {!resendLoading && (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                      </div>

                    </div>

                  </div>
                )}

                {/* =================================================
                    SUCCESS MESSAGE
                ================================================== */}
                {resendMessage && (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">

                    <div className="flex items-start gap-2.5">

                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 mt-0.5 shrink-0" />

                      <p className="text-sm leading-5 text-emerald-700">
                        {resendMessage}
                      </p>

                    </div>

                  </div>
                )}

                {/* =================================================
                    LOGIN FORM
                ================================================== */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >

                  {/* Email */}
                  <div className="space-y-1.5">

                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Email address
                    </Label>

                    <div className="relative">

                      <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                        aria-hidden="true"
                      />

                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        required
                      />

                    </div>

                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">

                    <div className="flex items-center justify-between">

                      <Label
                        htmlFor="password"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Password
                      </Label>

                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        Forgot password?
                      </Link>

                    </div>

                    <div className="relative">

                      <Lock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                        aria-hidden="true"
                      />

                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        required
                      />

                    </div>

                  </div>

                  {/* Login button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        Log in
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                </form>

                {/* =================================================
                    REGISTER & PORTAL SWITCH
                ================================================== */}
                <div className="mt-5 pt-5 border-t border-slate-100 text-center text-sm text-slate-500">
                  Don't have an account?{" "}
                  <Link
                    to={
                      "/register" +
                      (returnTo !== "/app"
                        ? "?returnTo=" +
                        encodeURIComponent(returnTo)
                        : "")
                    }
                    className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    Create one
                  </Link>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <Link
                      to="/choose-portal"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                    >
                      <span>Need a different portal? Choose Portal</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

              </div>

              {/* =================================================
                  SECURITY FOOTER
              ================================================== */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">

                <ShieldCheck className="w-3.5 h-3.5" />

                <span>
                  Your documents stay private and secure
                </span>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
