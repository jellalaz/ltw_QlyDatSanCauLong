import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import UserService from '../../services/UserService';
import User from '../../models/User';
import '../../styles/Layout.css';

/**
 * MainLayout - Layout có Sidebar dọc (dành cho OWNER và ADMIN)
 * @param {string} role - 'owner' | 'admin'
 */
function MainLayout({ role }) {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('currentUser');
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // Fetch từ API để cập nhật mới nhất
    UserService.getCurrentUser()
      .then((res) => {
        const userData = User.fromAPI(res.data.data || res.data);
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      })
      .catch(() => { /* Giữ cache nếu lỗi */ });
  }, []);

  return (
    <div className="main-layout">
      <Sidebar role={role} user={user} />
      <div className="main-content">
        <div className="page-content">
          {/* Outlet: nội dung từng trang con sẽ render ở đây */}
          <Outlet context={{ user, setUser }} />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
