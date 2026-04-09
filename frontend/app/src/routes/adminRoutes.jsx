import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import UserLayout from '../components/layout/UserLayout';

// Admin Views
import AdminDashboard from '../views/admin/AdminDashboard';
import UserManage from '../views/admin/UserManage';
import VenueModerate from '../views/admin/VenueModerate';

/**
 * Các route dành cho ADMIN (cần role ROLE_ADMIN)
 * Hiển thị tách biệt từng màn, dùng UserLayout (header ngang)
 */
const adminRoutes = [
  <Route
    key="admin-layout"
    element={
      <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
        <UserLayout />
      </ProtectedRoute>
    }
  >
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<UserManage />} />
    <Route path="/admin/venues" element={<VenueModerate />} />
  </Route>,
];

export default adminRoutes;
