// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { CartProvider } from '@context/CartContext';
import { ThemeProvider } from '@context/ThemeContext';
import Navbar from '@components/common/Navbar';
import Home from '@pages/user/Home';
import BulkOrder from '@pages/user/BulkOrder';
import Shop from '@pages/user/Shop';
import ProductDetail from '@pages/user/ProductDetail';
import Cart from '@pages/user/Cart';
import Checkout from '@pages/user/Checkout';
import Orders from '@pages/user/Orders';
import Profile from '@pages/user/Profile';
import Wishlist from '@pages/user/Wishlist';
import Login from '@pages/user/Login';
import Register from '@pages/user/Register';
import AdminDashboard from '@pages/admin/Dashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return children;
}

function AppContent() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', transition: 'background 0.3s ease' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bulk-order" element={<BulkOrder />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="*" element={
          <div className="h-screen flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            Page not found
          </div>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-body)',
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
