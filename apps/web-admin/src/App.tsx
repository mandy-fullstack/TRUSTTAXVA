import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { ClientsPage } from './pages/Clients';
import { OrdersPage } from './pages/Orders';
import { ServicesPage } from './pages/Services';
import { ServiceDetailPage } from './pages/Services/ServiceDetail';
import { CompanySettingsPage } from './pages/Settings/CompanySettings';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { ReactNode } from 'react';

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
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Admin Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
          <Route path="/services/:id" element={<ProtectedRoute><ServiceDetailPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><CompanySettingsPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
