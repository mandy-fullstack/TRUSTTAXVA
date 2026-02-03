import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastProvider } from "./context/ToastContext";
import { SocketProvider } from "./context/SocketContext";
import { Suspense, lazy, type ReactNode } from "react";

// Route-level code splitting
const LoginPage = lazy(() =>
  import("./pages/Login").then((m) => ({ default: m.LoginPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("./pages/ForgotPassword").then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import("./pages/ResetPassword").then((m) => ({ default: m.ResetPasswordPage })),
);
const DashboardPage = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.DashboardPage })),
);
const ClientsPage = lazy(() =>
  import("./pages/Clients").then((m) => ({ default: m.ClientsPage })),
);
const StaffPage = lazy(() =>
  import("./pages/Staff").then((m) => ({ default: m.StaffPage })),
);
const ClientDetailPage = lazy(() =>
  import("./pages/Clients/ClientDetail").then((m) => ({ default: m.ClientDetailPage })),
);
const OrdersPage = lazy(() =>
  import("./pages/Orders").then((m) => ({ default: m.OrdersPage })),
);
const OrderDetailPage = lazy(() =>
  import("./pages/Orders/OrderDetail").then((m) => ({ default: m.OrderDetailPage })),
);
const ServicesPage = lazy(() =>
  import("./pages/Services").then((m) => ({ default: m.ServicesPage })),
);
const ServiceDetailPage = lazy(() =>
  import("./pages/Services/ServiceDetail").then((m) => ({ default: m.ServiceDetailPage })),
);
const CompanySettingsPage = lazy(() =>
  import("./pages/Settings/CompanySettings").then((m) => ({ default: m.CompanySettingsPage })),
);
const FormsPage = lazy(() =>
  import("./pages/Forms").then((m) => ({ default: m.FormsPage })),
);
const FormDetailPage = lazy(() =>
  import("./pages/Forms/FormDetail").then((m) => ({ default: m.FormDetailPage })),
);
const AdminChatPage = lazy(() =>
  import("./pages/Chat/AdminChatPage").then((m) => ({ default: m.AdminChatPage })),
);

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
              <Suspense fallback={null}>
                <Routes>
                  {/* Public Routes */}
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
                    element={
                      <AuthRoute>
                        <ResetPasswordPage />
                      </AuthRoute>
                    }
                  />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/clients"
                    element={
                      <ProtectedRoute>
                        <ClientsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/clients/:id"
                    element={
                      <ProtectedRoute>
                        <ClientDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/staff"
                    element={
                      <ProtectedRoute>
                        <StaffPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <OrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:id"
                    element={
                      <ProtectedRoute>
                        <OrderDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/services"
                    element={
                      <ProtectedRoute>
                        <ServicesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/services/:id"
                    element={
                      <ProtectedRoute>
                        <ServiceDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/forms"
                    element={
                      <ProtectedRoute>
                        <FormsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/forms/:id"
                    element={
                      <ProtectedRoute>
                        <FormDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <CompanySettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <AdminChatPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat/:id"
                    element={
                      <ProtectedRoute>
                        <AdminChatPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </SocketProvider>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
