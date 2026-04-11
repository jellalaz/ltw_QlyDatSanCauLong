import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../services/AuthService';

/**
 * ProtectedRoute Component - Bảo vệ route theo auth & role
 * @param {React.ReactNode} children - Nội dung route
 * @param {string[]} allowedRoles - Danh sách role được phép ['ROLE_USER', 'ROLE_OWNER', 'ROLE_ADMIN']
 *                                   Nếu không truyền → chỉ cần đăng nhập là vào được
 */
function ProtectedRoute({ children, allowedRoles }) {
  const token = AuthService.getToken();
  const location = useLocation();

  // Chưa đăng nhập → về login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Nếu có yêu cầu role cụ thể → kiểm tra
  if (allowedRoles && allowedRoles.length > 0) {
    const userRaw = localStorage.getItem('currentUser');
    let userRoles = [];
    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        userRoles = parsed.roles || [];
      } catch {
        userRoles = [];
      }
    }

    const hasRole = allowedRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
