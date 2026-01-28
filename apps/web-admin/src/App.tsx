import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { ResetPasswordPage } from './pages/ResetPassword';
import { DashboardPage } from './pages/Dashboard';
import { ClientsPage } from './pages/Clients';
import { ClientDetailPage } from './pages/Clients/ClientDetail';
import { OrdersPage } from './pages/Orders';
import { OrderDetailPage } from './pages/Orders/OrderDetail';
import { ServicesPage } from './pages/Services';
import { ServiceDetailPage } from './pages/Services/ServiceDetail';
import { CompanySettingsPage } from './pages/Settings/CompanySettings';
import { FormsPage } from './pages/Forms';
import { FormDetailPage } from './pages/Forms/FormDetail';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { AdminChatPage } from './pages/Chat/AdminChatPage';
import type { ReactNode } from 'react';

const AuthRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Session is being restored
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <SocketProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
                <Route path="/forgot-password" element={<AuthRoute><ForgotPasswordPage /></AuthRoute>} />
                <Route path="/reset-password/:token" element={<AuthRoute><ResetPasswordPage /></AuthRoute>} />

                {/* Protected Admin Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
                <Route path="/clients/:id" element={<ProtectedRoute><ClientDetailPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
                <Route path="/services/:id" element={<ProtectedRoute><ServiceDetailPage /></ProtectedRoute>} />
                <Route path="/forms" element={<ProtectedRoute><FormsPage /></ProtectedRoute>} />
                <Route path="/forms/:id" element={<ProtectedRoute><FormDetailPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><CompanySettingsPage /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><AdminChatPage /></ProtectedRoute>} />
                <Route path="/chat/:id" element={<ProtectedRoute><AdminChatPage /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </SocketProvider>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
