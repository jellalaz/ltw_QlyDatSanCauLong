import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AuthController from '../controllers/AuthController';
import UserController from '../controllers/UserController';

function RoleProtectedRoute({ children, role }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkRole = async () => {
      if (!AuthController.isAuthenticated()) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const user = await UserController.getCurrentUser();
        const hasRole = user?.roles?.includes(role);
        setAuthorized(Boolean(hasRole));
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [role]);

  if (!AuthController.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (loading) {
    return <div style={{ padding: '24px' }}>Đang kiểm tra quyền truy cập...</div>;
  }

  if (!authorized) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default RoleProtectedRoute;
