import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Signup from '../components/Signup';
import ForgotPassword from '../components/ForgotPassword';
import ResetPassword from '../components/ResetPassword';
import Home from '../views/Home';
import Unauthorized from '../views/Unauthorized';
import userRoutes from './userRoutes';
import ownerRoutes from './ownerRoutes';
import adminRoutes from './adminRoutes';
import ProtectedRoute from '../components/ProtectedRoute';
import UserLayout from '../components/layout/UserLayout';
import VenueList from '../views/user/VenueList';
import VenueDetail from '../views/user/VenueDetail';

/**
 * AppRoutes - Tổng hợp toàn bộ routes của ứng dụng
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Không cần đăng nhập */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<UserLayout />}>
        <Route path="/venues" element={<VenueList />} />
        <Route path="/venues/:id" element={<VenueDetail />} />
      </Route>

      {/* Home - Cần đăng nhập, điều hướng theo role */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
      </Route>

      {/* User Routes */}
      {userRoutes}

      {/* Owner Routes */}
      {ownerRoutes}

      {/* Admin Routes */}
      {adminRoutes}

      {/* Redirect mặc định */}
      <Route path="/" element={<Navigate to="/venues" replace />} />
      <Route path="*" element={<Navigate to="/venues" replace />} />
    </Routes>
  );
}

export default AppRoutes;
