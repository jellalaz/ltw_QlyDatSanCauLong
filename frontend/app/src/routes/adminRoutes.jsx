import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

// Admin Views
import AdminDashboard from '../views/admin/AdminDashboard';
import UserManage from '../views/admin/UserManage';
import VenueModerate from '../views/admin/VenueModerate';
import Profile from '../views/Profile';

/**
 * Các route dành cho ADMIN (cần role ROLE_ADMIN)
 * Dùng MainLayout (Sidebar dọc) giống OWNER
 */
const adminRoutes = [
  <Route
    key="admin-layout"
    path="/admin"
    element={
      <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
        <MainLayout role="admin" />
      </ProtectedRoute>
    }
  >
    <Route index element={<AdminDashboard />} />
    <Route path="users" element={<UserManage />} />
    <Route path="venues" element={<VenueModerate />} />
    <Route path="profile" element={<Profile />} />
  </Route>,
];

export default adminRoutes;
