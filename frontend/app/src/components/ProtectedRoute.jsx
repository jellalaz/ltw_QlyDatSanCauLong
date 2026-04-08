import { Navigate } from 'react-router-dom';
import AuthController from '../controllers/AuthController';

/**
 * ProtectedRoute Component - Bảo vệ các route cần đăng nhập
 */
function ProtectedRoute({ children }) {
  const isAuthenticated = AuthController.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

