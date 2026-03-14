import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './redux/store';

// Pages
import Home from './pages/Home';
import AuthPortalSelector from './pages/auth/AuthPortalSelector';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Marketplace from './pages/customer/Marketplace';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import NearbyFarmers from './pages/customer/NearbyFarmers';
import ProductDetail from './pages/customer/ProductDetail';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import Inventory from './pages/farmer/Inventory';
import AddProduct from './pages/farmer/AddProduct';
import Analytics from './pages/farmer/Analytics';
import FarmerOrders from './pages/farmer/FarmerOrders';
import NotFound from './pages/NotFound';

// Layout
import Navbar from './components/common/Navbar';

// Protected Route component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, token } = useSelector((state) => state.auth);
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRole && user.role !== allowedRole) {
    const redirect = user.role === 'farmer' ? '/farmer/dashboard' : '/marketplace';
    return <Navigate to={redirect} replace />;
  }
  return children;
};

function AppRoutes() {
  const { user } = useSelector((state) => state.auth);
  const farmerRedirect = '/farmer/dashboard';
  const customerRedirect = '/marketplace';

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Auth routes */}
          <Route
            path="/login"
            element={
              user ? <Navigate to={user.role === 'farmer' ? farmerRedirect : customerRedirect} replace /> : <AuthPortalSelector mode="login" />
            }
          />
          <Route
            path="/register"
            element={
              user ? <Navigate to={user.role === 'farmer' ? farmerRedirect : customerRedirect} replace /> : <AuthPortalSelector mode="register" />
            }
          />
          <Route
            path="/customer/login"
            element={
              user ? <Navigate to={user.role === 'farmer' ? farmerRedirect : customerRedirect} replace /> : <Login portal="customer" />
            }
          />
          <Route
            path="/customer/register"
            element={
              user ? <Navigate to={user.role === 'farmer' ? farmerRedirect : customerRedirect} replace /> : <Register portal="customer" />
            }
          />
          <Route
            path="/farmer/login"
            element={
              user ? <Navigate to={user.role === 'farmer' ? farmerRedirect : customerRedirect} replace /> : <Login portal="farmer" />
            }
          />
          <Route
            path="/farmer/register"
            element={
              user ? <Navigate to={user.role === 'farmer' ? farmerRedirect : customerRedirect} replace /> : <Register portal="farmer" />
            }
          />

          {/* Protected customer routes */}
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute allowedRole="customer">
                <Marketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProtectedRoute allowedRole="customer">
                <ProductDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nearby-farmers"
            element={
              <ProtectedRoute allowedRole="customer">
                <NearbyFarmers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRole="customer">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRole="customer">
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRole="customer">
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* Protected farmer routes */}
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRole="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/inventory"
            element={
              <ProtectedRoute allowedRole="farmer">
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/add-product"
            element={
              <ProtectedRoute allowedRole="farmer">
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/analytics"
            element={
              <ProtectedRoute allowedRole="farmer">
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/orders"
            element={
              <ProtectedRoute allowedRole="farmer">
                <FarmerOrders />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#fff',
              color: '#1a2e1a',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
            success: { iconTheme: { primary: '#2E7D32', secondary: '#fff' } },
            error: { iconTheme: { primary: '#D32F2F', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </Router>
    </Provider>
  );
}

export default App;
