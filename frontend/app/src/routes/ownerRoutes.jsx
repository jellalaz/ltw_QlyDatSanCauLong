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

/**
 * Các route dành cho OWNER (cần role ROLE_OWNER)
 * Được lồng vào MainLayout (Sidebar dọc)
 */
const ownerRoutes = [
  <Route
    key="owner-layout"
    element={
      <ProtectedRoute allowedRoles={['ROLE_OWNER']}>
        <MainLayout role="owner" />
      </ProtectedRoute>
    }
  >
    <Route path="/owner" element={<OwnerDashboard />} />
    <Route path="/owner/venues" element={<VenueManage />} />
    <Route path="/owner/venues/new" element={<VenueForm mode="create" />} />
    <Route path="/owner/venues/:id/edit" element={<VenueForm mode="edit" />} />
    <Route path="/owner/venues/:venueId/courts" element={<CourtManage />} />
    <Route path="/owner/venues/:venueId/courts/new" element={<CourtForm mode="create" />} />
    <Route path="/owner/venues/:venueId/courts/:courtId/edit" element={<CourtForm mode="edit" />} />
    <Route path="/owner/bookings" element={<BookingManage />} />
  </Route>,
];

export default ownerRoutes;
