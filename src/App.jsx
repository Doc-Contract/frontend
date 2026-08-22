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
import SignDocument from "@/pages/sign/SignDocument";
import Onboarding from "@/pages/Onboarding";
import DashboardRouter from "@/pages/dashboard/DashboardRouter";
import OrgLayout from "@/pages/dashboard/OrgLayout";
import IndividualLayout from "@/pages/dashboard/IndividualLayout";
import AdminLayout from "@/pages/dashboard/AdminLayout";
import OrgOverview from "@/pages/dashboard/org/OrgOverview";
import IndividualOverview from "@/pages/dashboard/individual/IndividualOverview";
import AdminOverview from "@/pages/dashboard/admin/AdminOverview";
import PlaceholderPage from "@/pages/dashboard/PlaceholderPage";
import IssueEnvelope from "@/pages/dashboard/org/IssueEnvelope";
import EnvelopeList from "@/pages/dashboard/org/EnvelopeList";

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
            <Route path="/sign/:token" element={<SignDocument />} />
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
                <Route
                  path="issue"
                  element={
                    <IssueEnvelope
                      title="Issue document"
                      subtitle="Upload a PDF, create an envelope, add a signer, and send."
                    />
                  }
                />
                <Route
                  path="issued"
                  element={
                    <EnvelopeList
                      title="Issued documents"
                      subtitle="All envelopes your organization has created."
                      filter="all"
                    />
                  }
                />
                <Route path="verify" element={<Navigate to="/verify" replace />} />
                <Route
                  path="revoked"
                  element={
                    <EnvelopeList
                      title="Revoked and superseded"
                      subtitle="Voided or revoked envelopes."
                      filter="revoked"
                      emptyTitle="No voided envelopes"
                      emptyDescription="Voided envelopes will appear here."
                    />
                  }
                />
                <Route
                  path="send"
                  element={
                    <IssueEnvelope
                      title="Send for signature"
                      subtitle="Upload a PDF, add a signer, and email a signing link."
                    />
                  }
                />
                <Route
                  path="drafts"
                  element={
                    <EnvelopeList
                      title="Drafts"
                      subtitle="Draft envelopes before send."
                      filter="draft"
                      emptyTitle="No drafts"
                      emptyDescription="Draft envelopes appear here before you send them."
                    />
                  }
                />
                <Route
                  path="awaiting"
                  element={
                    <EnvelopeList
                      title="Awaiting signatures"
                      subtitle="Envelopes waiting on recipients."
                      filter="awaiting"
                      emptyTitle="Nothing awaiting"
                      emptyDescription="Sent envelopes pending signature show up here."
                    />
                  }
                />
                <Route
                  path="completed"
                  element={
                    <EnvelopeList
                      title="Completed"
                      subtitle="Fully signed envelopes."
                      filter="completed"
                      emptyTitle="No completed envelopes"
                      emptyDescription="Completed envelopes will appear here after all signers finish."
                    />
                  }
                />
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
