import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container" style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
            <Route path="/alumni/:id" element={<ProtectedRoute><AlumniProfile /></ProtectedRoute>} />
            <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/networking" element={<ProtectedRoute><Networking /></ProtectedRoute>} />
            
            <Route path="/post-job" element={<ProtectedRoute requiredRole="alumni"><PostJob /></ProtectedRoute>} />
            <Route path="/my-listings" element={<ProtectedRoute requiredRole="alumni"><MyListings /></ProtectedRoute>} />
            
            <Route path="/my-applications" element={<ProtectedRoute requiredRole="student"><MyApplications /></ProtectedRoute>} />
            
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
