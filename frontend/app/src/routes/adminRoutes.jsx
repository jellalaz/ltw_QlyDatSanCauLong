import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

// Admin Views
import AdminDashboard from '../views/admin/AdminDashboard';
import UserManage from '../views/admin/UserManage';
import VenueModerate from '../views/admin/VenueModerate';

/**
 * Các route dành cho ADMIN (cần role ROLE_ADMIN)
 * Được lồng vào MainLayout (Sidebar dọc)
 */
const adminRoutes = [
  <Route
    key="admin-layout"
    element={
      <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
        <MainLayout role="admin" />
      </ProtectedRoute>
    }
  >
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<UserManage />} />
    <Route path="/admin/venues" element={<VenueModerate />} />
  </Route>,
];

export default adminRoutes;
