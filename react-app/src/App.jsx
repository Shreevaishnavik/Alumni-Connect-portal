import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import useAuth from './hooks/useAuth';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Directory from './pages/Directory';
import AlumniProfile from './pages/AlumniProfile';
import Opportunities from './pages/Opportunities';
import PostJob from './pages/PostJob';
import MyListings from './pages/MyListings';
import MyApplications from './pages/MyApplications';
import AdminPanel from './pages/AdminPanel';
import Notifications from './pages/Notifications';
import Networking from './pages/Networking';
import MyProfile from './pages/MyProfile';

// Smart root redirect: logged-in users go to dashboard, guests go to login
// This replaces the hardcoded <Navigate to="/dashboard" /> that always showed
// dashboard even when the user had no valid session
const RootRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
};

// Wrap login/register so logged-in users are redirected away from auth pages
const AuthRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Navbar />
          <div className="main-content">
            <Routes>
              {/* Root: auth-aware redirect — no more hardcoded /dashboard */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public auth pages — redirect away if already logged in */}
              <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
              <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

              {/* Protected pages */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
              <Route path="/alumni/:id" element={<ProtectedRoute><AlumniProfile /></ProtectedRoute>} />
              <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/networking" element={<ProtectedRoute><Networking /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />

              <Route path="/post-job" element={<ProtectedRoute requiredRole="alumni"><PostJob /></ProtectedRoute>} />
              <Route path="/my-listings" element={<ProtectedRoute requiredRole="alumni"><MyListings /></ProtectedRoute>} />

              <Route path="/my-applications" element={<ProtectedRoute requiredRole="student"><MyApplications /></ProtectedRoute>} />

              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />

              {/* Catch-all: any unknown route goes to root which then redirects correctly */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
