import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './Header';
import UserService from '../../services/UserService';
import User from '../../models/User';
import '../../styles/Layout.css';

/**
 * UserLayout - Layout dùng Header ngang (dành cho USER thông thường)
 */
function UserLayout() {
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
    // Fetch mới nhất
    UserService.getCurrentUser()
      .then((res) => {
        const userData = User.fromAPI(res.data.data || res.data);
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      })
      .catch(() => { /* Giữ cache */ });
  }, []);

  return (
    <div className="user-layout">
      <Header user={user} onLogout={() => setUser(null)} />
      <main className="user-content">
        {/* Outlet: nội dung từng trang con render ở đây */}
        <Outlet context={{ user, setUser }} />
      </main>
    </div>
  );
}

export default UserLayout;
