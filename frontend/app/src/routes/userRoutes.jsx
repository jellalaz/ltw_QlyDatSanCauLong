import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import UserLayout from '../components/layout/UserLayout';

// User Views
import VenueList from '../views/user/VenueList';
import VenueDetail from '../views/user/VenueDetail';
import BookingList from '../views/user/BookingList';
import BookingCreate from '../views/user/BookingCreate';
import Notifications from '../views/user/Notifications';
import Profile from '../views/Profile';

/**
 * Các route dành cho USER (cần đăng nhập, không check role cụ thể)
 * Được lồng vào UserLayout (Header ngang)
 */
const userRoutes = [
  <Route
    key="user-layout"
    element={
      <ProtectedRoute>
        <UserLayout />
      </ProtectedRoute>
    }
  >
    <Route path="/profile" element={<Profile />} />
    <Route path="/venues" element={<VenueList />} />
    <Route path="/venues/:id" element={<VenueDetail />} />
    <Route path="/bookings" element={<BookingList />} />
    <Route path="/bookings/new" element={<BookingCreate />} />
    <Route path="/notifications" element={<Notifications />} />
  </Route>,
];

export default userRoutes;
