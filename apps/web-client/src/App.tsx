import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Suspense, lazy, type ReactNode } from "react";
import {
  SMSConsentPage,
  PrivacyPolicyPage,
  TermsOfServicePage,
} from "./pages/Legal";
import { SMSConsentTestPage } from "./pages/Legal/SMSConsentTest";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { CompanyProvider } from "./context/CompanyContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastProvider } from "./context/ToastContext";
import { CookieConsent } from "./components/CookieConsent";

// Route-level code splitting
const LandingPage = lazy(() =>
  import("./pages/Landing").then((m) => ({ default: m.LandingPage })),
);
const AboutPage = lazy(() =>
  import("./pages/About").then((m) => ({ default: m.AboutPage })),
);
const ContactPage = lazy(() =>
  import("./pages/Contact").then((m) => ({ default: m.ContactPage })),
);
const RegisterPage = lazy(() =>
  import("./pages/Register").then((m) => ({ default: m.RegisterPage })),
);
const LoginPage = lazy(() =>
  import("./pages/Login").then((m) => ({ default: m.LoginPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("./pages/Auth/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import("./pages/Auth/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })),
);
const VerifyEmailPage = lazy(() =>
  import("./pages/Auth/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage })),
);
const PublicServicesPage = lazy(() =>
  import("./pages/PublicServices").then((m) => ({ default: m.PublicServicesPage })),
);
const ServiceDetailPage = lazy(() =>
  import("./pages/Services/ServiceDetail").then((m) => ({ default: m.ServiceDetailPage })),
);
const DashboardPage = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.DashboardPage })),
);
const ServicesPage = lazy(() =>
  import("./pages/Services").then((m) => ({ default: m.ServicesPage })),
);
const DocumentsPage = lazy(() =>
  import("./pages/Documents").then((m) => ({ default: m.default })),
);
const OrdersPage = lazy(() =>
  import("./pages/Orders").then((m) => ({ default: m.OrdersPage })),
);
const OrderDetailPage = lazy(() =>
  import("./pages/Dashboard/OrderDetail").then((m) => ({ default: m.OrderDetailPage })),
);
const ChatPage = lazy(() =>
  import("./pages/Chat/ChatPage").then((m) => ({ default: m.ChatPage })),
);
const ProfilePage = lazy(() =>
  import("./pages/Profile").then((m) => ({ default: m.ProfilePage })),
);
const SettingsPage = lazy(() =>
  import("./pages/Settings").then((m) => ({ default: m.SettingsPage })),
);
const WizardPage = lazy(() =>
  import("./pages/Wizard").then((m) => ({ default: m.WizardPage })),
);
const ProfileSetupWizard = lazy(() =>
  import("./pages/ProfileSetup").then((m) => ({ default: m.ProfileSetupWizard })),
);
const CompleteProfilePage = lazy(() =>
  import("./pages/CompleteProfile").then((m) => ({ default: m.default })),
);
const AdminOrderDetailPage = lazy(() =>
  import("./pages/Admin/AdminOrderDetail").then((m) => ({ default: m.AdminOrderDetailPage })),
);
const AdminServicesPage = lazy(() =>
  import("./pages/Admin/AdminServices").then((m) => ({ default: m.AdminServicesPage })),
);

const AuthRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <ToastProvider>
          <SocketProvider>
            <NotificationProvider>
              <BrowserRouter>
                <Suspense fallback={null}>
                  <Routes>
                    {/* Public Website Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />

                    {/* Legal Pages */}
                    <Route
                      path="/legal/sms-consent"
                      element={<SMSConsentPage />}
                    />
                    <Route
                      path="/legal/privacy"
                      element={<PrivacyPolicyPage />}
                    />
                    <Route
                      path="/legal/terms"
                      element={<TermsOfServicePage />}
                    />
                    <Route
                      path="/legal/sms-test"
                      element={<SMSConsentTestPage />}
                    />

                    {/* Auth Routes */}
                    <Route
                      path="/register"
                      element={
                        <AuthRoute>
                          <RegisterPage />
                        </AuthRoute>
                      }
                    />
                    <Route
                      path="/login"
                      element={
                        <AuthRoute>
                          <LoginPage />
                        </AuthRoute>
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={
                        <AuthRoute>
                          <ForgotPasswordPage />
                        </AuthRoute>
                      }
                    />
                    <Route
                      path="/reset-password/:token"
                      element={<ResetPasswordPage />}
                    />
                    <Route
                      path="/verify-email/:token"
                      element={<VerifyEmailPage />}
                    />

                    {/* Public Services Routes */}
                    <Route path="/services" element={<PublicServicesPage />} />
                    <Route
                      path="/services/:id"
                      element={<ServiceDetailPage />}
                    />

                    {/* Protected Routes */}
                    <Route
                      path="/services/:id/wizard"
                      element={
                        <ProtectedRoute>
                          <WizardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/services"
                      element={
                        <ProtectedRoute>
                          <ServicesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/services/:id"
                      element={
                        <ProtectedRoute>
                          <ServiceDetailPage variant="dashboard" />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/documents"
                      element={
                        <ProtectedRoute>
                          <DocumentsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/orders"
                      element={
                        <ProtectedRoute>
                          <OrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/orders/:id"
                      element={
                        <ProtectedRoute>
                          <OrderDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/chat"
                      element={
                        <ProtectedRoute>
                          <ChatPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/chat/:id"
                      element={
                        <ProtectedRoute>
                          <ChatPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/settings"
                      element={
                        <ProtectedRoute>
                          <SettingsPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin/orders/:id"
                      element={
                        <AdminRoute>
                          <AdminOrderDetailPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/services"
                      element={
                        <AdminRoute>
                          <AdminServicesPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/profile/setup"
                      element={
                        <ProtectedRoute>
                          <ProfileSetupWizard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile/complete"
                      element={
                        <ProtectedRoute>
                          <CompleteProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </NotificationProvider>
          </SocketProvider>
        </ToastProvider>
        <CookieConsent />
      </CompanyProvider>
    </AuthProvider>
  );
}

// Force release: 2026-01-27
export default App;
