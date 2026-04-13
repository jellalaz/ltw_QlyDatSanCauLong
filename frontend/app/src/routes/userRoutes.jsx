import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import UserLayout from '../components/layout/UserLayout';

// User Views
import BookingList from '../views/user/BookingList';
import BookingCreate from '../views/user/BookingCreate';
import BookingPayment from '../views/user/BookingPayment';
import Notifications from '../views/user/Notifications';
import MyReviews from '../views/user/MyReviews';
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
    <Route path="/bookings" element={<BookingList />} />
    <Route path="/bookings/new" element={<BookingCreate />} />
    <Route path="/bookings/:id/payment" element={<BookingPayment />} />
    <Route path="/notifications" element={<Notifications />} />
    <Route path="/my-reviews" element={<MyReviews />} />
  </Route>,
];

export default userRoutes;
