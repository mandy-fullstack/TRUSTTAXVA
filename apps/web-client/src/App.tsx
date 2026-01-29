import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RegisterPage } from './pages/Register';
import { LoginPage } from './pages/Login';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/Auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/Auth/VerifyEmailPage';
import { DashboardPage } from './pages/Dashboard';
import { ServicesPage } from './pages/Services';
import { PublicServicesPage } from './pages/PublicServices';
import { ServiceDetailPage } from './pages/Services/ServiceDetail';
import { OrdersPage } from './pages/Orders';
import { LandingPage } from './pages/Landing';
import { AboutPage } from './pages/About';
import { ContactPage } from './pages/Contact';
import { WizardPage } from './pages/Wizard';
import { ProfilePage } from './pages/Profile';
import { OrderDetailPage } from './pages/Dashboard/OrderDetail';
import { AdminOrderDetailPage } from './pages/Admin/AdminOrderDetail';
import { AdminServicesPage } from './pages/Admin/AdminServices';
import { ChatPage } from './pages/Chat/ChatPage';
import { SettingsPage } from './pages/Settings';
import { ProfileSetupWizard } from './pages/ProfileSetup';
import CompleteProfilePage from './pages/CompleteProfile';
import DocumentsPage from './pages/Documents';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CompanyProvider } from './context/CompanyContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { CookieConsent } from './components/CookieConsent';
import type { ReactNode } from 'react';

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
          <NotificationProvider>
            <SocketProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Website Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  {/* Auth Routes */}
                  <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
                  <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
                  <Route path="/forgot-password" element={<AuthRoute><ForgotPasswordPage /></AuthRoute>} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

                  {/* Public Services Routes */}
                  <Route path="/services" element={<PublicServicesPage />} />
                  <Route path="/services/:id" element={<ServiceDetailPage />} />

                  {/* Protected Routes */}
                  <Route path="/services/:id/wizard" element={<ProtectedRoute><WizardPage /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/dashboard/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
                  <Route path="/dashboard/services/:id" element={<ProtectedRoute><ServiceDetailPage /></ProtectedRoute>} />
                  <Route path="/dashboard/documents" element={
                    <ProtectedRoute>
                      <DocumentsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                  <Route path="/dashboard/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                  <Route path="/dashboard/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  <Route path="/dashboard/chat/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                  {/* Admin Routes */}
                  <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetailPage /></AdminRoute>} />
                  <Route path="/admin/services" element={<AdminRoute><AdminServicesPage /></AdminRoute>} />

                  <Route path="/profile/setup" element={<ProtectedRoute><ProfileSetupWizard /></ProtectedRoute>} />
                  <Route path="/profile/complete" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </SocketProvider>
          </NotificationProvider>
        </ToastProvider>
        <CookieConsent />
      </CompanyProvider>
    </AuthProvider>
  );
}

// Force release: 2026-01-27
export default App;
