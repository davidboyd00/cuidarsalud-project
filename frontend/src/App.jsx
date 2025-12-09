import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './context/authStore';
import { Loading } from './components/common';
import { MainLayout, AdminLayout } from './components/layout';

// Public Pages
import HomePage from './pages/public/HomePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServices from './pages/admin/AdminServices';
import AdminContent from './pages/admin/AdminContent';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Guest Route Component (redirect if already authenticated)
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { fetchUser, isLoading } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <Routes>
      {/* Public Routes with Main Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Auth Routes (no layout) */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/registro"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="servicios" element={<AdminServices />} />
        <Route path="contenido" element={<AdminContent />} />
        {/* Placeholder pages for other admin routes */}
        <Route path="citas" element={<PlaceholderPage title="Gestión de Citas" />} />
        <Route path="usuarios" element={<PlaceholderPage title="Gestión de Usuarios" />} />
        <Route path="equipo" element={<PlaceholderPage title="Equipo" />} />
        <Route path="testimonios" element={<PlaceholderPage title="Testimonios" />} />
        <Route path="mensajes" element={<PlaceholderPage title="Mensajes" />} />
        <Route path="configuracion" element={<PlaceholderPage title="Configuración" />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Placeholder component for pages not yet implemented
const PlaceholderPage = ({ title }) => (
  <div className="card text-center py-16">
    <h1 className="text-2xl font-bold text-slate-800 mb-4">{title}</h1>
    <p className="text-slate-500">Esta página está en desarrollo.</p>
  </div>
);

export default App;
