import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider } from "@/lib/AuthContext";
import PageNotFound from "@/lib/PageNotFound";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import Landing from "@/pages/Landing";
import VerifyDocument from "@/pages/verify/VerifyDocument";
import Onboarding from "@/pages/Onboarding";
import DashboardRouter from "@/pages/dashboard/DashboardRouter";
import OrgLayout from "@/pages/dashboard/OrgLayout";
import IndividualLayout from "@/pages/dashboard/IndividualLayout";
import AdminLayout from "@/pages/dashboard/AdminLayout";
import OrgOverview from "@/pages/dashboard/org/OrgOverview";
import IndividualOverview from "@/pages/dashboard/individual/IndividualOverview";
import AdminOverview from "@/pages/dashboard/admin/AdminOverview";
import PlaceholderPage from "@/pages/dashboard/PlaceholderPage";

const PH = (title, description) => <PlaceholderPage title={title} description={description} />;

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/verify" element={<VerifyDocument />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/app" element={<DashboardRouter />} />

              <Route path="/app/organization" element={<OrgLayout />}>
                <Route index element={<OrgOverview />} />
                <Route path="issue" element={PH("Issue Document", "Upload a PDF and create an envelope via Doc-Contract when this screen is wired.")} />
                <Route path="issued" element={PH("Issued Documents", "Browse envelopes your organization has sent.")} />
                <Route path="verify" element={PH("Verify Document", "Use the public /verify page with an envelope UUID.")} />
                <Route
                  path="revoked"
                  element={PH("Revoked and Superseded", "Voided envelopes will appear here once wired.")}
                />
                <Route path="send" element={PH("Send for Signature", "Create envelope, add signers, and send.")} />
                <Route path="drafts" element={PH("Drafts", "Draft envelopes before send.")} />
                <Route path="awaiting" element={PH("Awaiting Signatures", "Envelopes waiting on recipients.")} />
                <Route path="completed" element={PH("Completed", "Fully signed envelopes.")} />
                <Route path="team" element={PH("Team Members", "Invite members with POST /orgs/invite.")} />
                <Route path="verification" element={PH("Organization Verification", "Org tenancy is managed by Doc-Contract membership.")} />
                <Route path="audit" element={PH("Audit Trail", "Evidence lives on GET /verify/{envelope_id}.")} />
                <Route path="wallet" element={PH("Organization Wallet", "Optional Ethereum link is per-user via /auth/wallet/*.")} />
                <Route path="settings" element={PH("Settings", "Organization settings coming next.")} />
              </Route>

              <Route path="/app/individual" element={<IndividualLayout />}>
                <Route index element={<IndividualOverview />} />
                <Route path="received" element={PH("Received Documents", "Signer flows use /sign/{token} — wire next.")} />
                <Route path="shared" element={PH("Shared Documents", "Coming soon.")} />
                <Route path="verification-history" element={PH("Verification History", "Coming soon.")} />
                <Route path="awaiting-signature" element={PH("Awaiting My Signature", "Open signing links from invite emails.")} />
                <Route path="completed-docs" element={PH("Completed Documents", "Coming soon.")} />
                <Route path="wallet" element={PH("Wallet", "Link MetaMask during onboarding or later.")} />
                <Route path="profile" element={PH("Profile", "Session email from GET /auth/me.")} />
                <Route path="security" element={PH("Security", "Password reset via /forgot-password.")} />
                <Route path="notifications" element={PH("Notification Preferences", "Coming soon.")} />
              </Route>

              <Route path="/app/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="pending" element={PH("Pending Review", "Map to org admin ops when needed.")} />
                <Route path="verified" element={PH("Verified Issuers", "Coming soon.")} />
                <Route path="suspended" element={PH("Suspended", "Coming soon.")} />
                <Route path="audit" element={PH("Audit Trail", "Platform audit coming soon.")} />
                <Route path="settings" element={PH("Settings", "Admin settings coming soon.")} />
              </Route>
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
