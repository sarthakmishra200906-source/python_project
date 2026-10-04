import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar          from './components/Navbar';
import Footer          from './components/Footer';
import ProtectedRoute  from './components/ProtectedRoute';
import Home            from './pages/Home';
import Login           from './pages/Login';
import Dashboard       from './pages/Dashboard';
import RechargePlans   from './pages/RechargePlans';
import PaymentSuccess  from './pages/PaymentSuccess';
import TransactionHistory from './pages/TransactionHistory';
import EmployeeDashboard from './pages/EmployeeDashboard';
import SupportChatbot from './components/SupportChatbot';
import AdminLogin from './pages/AdminLogin';

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/"      element={<Home />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/plans" element={
            <ProtectedRoute><RechargePlans /></ProtectedRoute>
          } />
          <Route path="/payment-success" element={
            <ProtectedRoute><PaymentSuccess /></ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute><TransactionHistory /></ProtectedRoute>
          } />
          <Route path="/employee" element={
            <ProtectedRoute>
              {user?.role === 'admin' || user?.role === 'employee'
                ? <EmployeeDashboard />
                : <Navigate to="/dashboard" replace />}
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <SupportChatbot />
    </div>
  );
}
