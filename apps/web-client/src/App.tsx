import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RegisterPage } from './pages/Register';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { ServicesPage } from './pages/Services';
import { PublicServicesPage } from './pages/PublicServices';
import { ServiceDetailPage } from './pages/Services/ServiceDetail';
import { LandingPage } from './pages/Landing';
import { AboutPage } from './pages/About';
import { ContactPage } from './pages/Contact';
import { WizardPage } from './pages/Wizard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
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
      <CompanyProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Website Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth Routes */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Public Services Routes */}
            <Route path="/services" element={<PublicServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />

            {/* Protected Routes */}
            <Route path="/services/:id/wizard" element={<ProtectedRoute><WizardPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/dashboard/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CompanyProvider>
    </AuthProvider>
  );
}

export default App;
