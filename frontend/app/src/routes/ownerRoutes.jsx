import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

// Owner Views
import OwnerDashboard from '../views/owner/OwnerDashboard';
import VenueManage from '../views/owner/VenueManage';
import VenueForm from '../views/owner/VenueForm';
import CourtManage from '../views/owner/CourtManage';
import CourtForm from '../views/owner/CourtForm';
import BookingManage from '../views/owner/BookingManage';
import ReviewManage from '../views/owner/ReviewManage';
import Profile from '../views/Profile';

/**
 * Các route dành cho OWNER (cần role ROLE_OWNER)
 * Được lồng vào MainLayout (Sidebar dọc)
 */
const ownerRoutes = [
  <Route
    key="owner-layout"
    path="/owner"
    element={
      <ProtectedRoute allowedRoles={['ROLE_OWNER']}>
        <MainLayout role="owner" />
      </ProtectedRoute>
    }
  >
    <Route index element={<OwnerDashboard />} />
    <Route path="venues" element={<VenueManage />} />
    <Route path="venues/new" element={<VenueForm mode="create" />} />
    <Route path="venues/:id/edit" element={<VenueForm mode="edit" />} />
    <Route path="venues/:venueId/courts" element={<CourtManage />} />
    <Route path="venues/:venueId/courts/new" element={<VenueForm mode="edit" />} />
    <Route path="venues/:venueId/courts/:courtId/edit" element={<CourtForm mode="edit" />} />
    <Route path="bookings" element={<BookingManage />} />
    <Route path="reviews" element={<ReviewManage />} />
    <Route path="profile" element={<Profile />} />
  </Route>,
];

export default ownerRoutes;
