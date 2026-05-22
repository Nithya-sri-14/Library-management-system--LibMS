import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import api from './services/api';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Books = lazy(() => import('./pages/Books'));
const Authors = lazy(() => import('./pages/Authors'));
const Borrowers = lazy(() => import('./pages/Borrowers'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Reports = lazy(() => import('./pages/Reports'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

function KeepAlive() {
  useEffect(() => {
    const ping = () => api.get('/health').catch(() => {});
    ping();
    const id = setInterval(ping, 600000);
    return () => clearInterval(id);
  }, []);
  return null;
}

function SuspenseWrapper({ children }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-text-muted text-sm">Loading…</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <KeepAlive />
          <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px' } }} />
          <SuspenseWrapper>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="books" element={<Books />} />
                <Route path="authors" element={<ProtectedRoute roles={['admin', 'librarian']}><Authors /></ProtectedRoute>} />
                <Route path="borrowers" element={<ProtectedRoute roles={['admin', 'librarian']}><Borrowers /></ProtectedRoute>} />
                <Route path="transactions" element={<ProtectedRoute roles={['admin', 'librarian']}><Transactions /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute roles={['admin', 'librarian']}><Reports /></ProtectedRoute>} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SuspenseWrapper>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
