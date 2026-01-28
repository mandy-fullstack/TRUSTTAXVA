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
import { LandingPage } from './pages/Landing';
import { AboutPage } from './pages/About';
import { ContactPage } from './pages/Contact';
import { WizardPage } from './pages/Wizard';
import { ProfilePage } from './pages/Profile';
import { OrderDetailPage } from './pages/Dashboard/OrderDetail';
import { AdminOrdersPage } from './pages/Admin/AdminOrders';
import { AdminOrderDetailPage } from './pages/Admin/AdminOrderDetail';
import { AdminServicesPage } from './pages/Admin/AdminServices';
import { ChatPage } from './pages/Chat/ChatPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CompanyProvider } from './context/CompanyContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import type { ReactNode } from 'react';

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
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

                  {/* Public Services Routes */}
                  <Route path="/services" element={<PublicServicesPage />} />
                  <Route path="/services/:id" element={<ServiceDetailPage />} />

                  {/* Protected Routes */}
                  <Route path="/services/:id/wizard" element={<ProtectedRoute><WizardPage /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/dashboard/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
                  <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/dashboard/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                  <Route path="/dashboard/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  <Route path="/dashboard/chat/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

                  {/* Admin Routes */}
                  <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
                  <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetailPage /></AdminRoute>} />
                  <Route path="/admin/services" element={<AdminRoute><AdminServicesPage /></AdminRoute>} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </SocketProvider>
          </NotificationProvider>
        </ToastProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}

// Force release: 2026-01-27
export default App;
