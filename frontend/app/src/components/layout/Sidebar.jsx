import { NavLink, useNavigate } from 'react-router-dom';
import AuthController from '../../controllers/AuthController';

/**
 * Sidebar Component - Dùng cho MainLayout (OWNER / ADMIN)
 * @param {string} role - 'owner' | 'admin'
 * @param {Object} user  - Thông tin người dùng hiện tại
 */
function Sidebar({ role, user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthController.logout();
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // ---- Menu items cho từng role ----
  const ownerMenu = [
    { section: 'Tổng Quan' },
    { icon: '📊', label: 'Dashboard', to: '/owner' },

    { section: 'Cơ Sở Của Tôi' },
    { icon: '🏟️', label: 'Cụm sân của tôi', to: '/owner/venues' },
    { icon: '📅', label: 'Quản lý đặt sân', to: '/owner/bookings' },

    { section: 'Tài Khoản' },
    { icon: '👤', label: 'Thông tin cá nhân', to: '/profile' },
    { icon: '🏠', label: 'Trang chủ', to: '/home' },
  ];

  const adminMenu = [
    { section: 'Tổng Quan' },
    { icon: '📊', label: 'Dashboard', to: '/admin' },

    { section: 'Quản Lý Hệ Thống' },
    { icon: '👥', label: 'Quản lý người dùng', to: '/admin/users' },
    { icon: '🏟️', label: 'Kiểm duyệt sân', to: '/admin/venues' },

    { section: 'Tài Khoản' },
    { icon: '👤', label: 'Thông tin cá nhân', to: '/profile' },
    { icon: '🏠', label: 'Trang chủ', to: '/home' },
  ];

  const menu = role === 'admin' ? adminMenu : ownerMenu;
  const roleLabel = role === 'admin' ? 'Quản Trị Viên' : 'Chủ Sân';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <NavLink to="/home" className="sidebar-logo sidebar-logo-link">
        <div className="sidebar-logo-icon">🏸</div>
        <div>
          <div className="sidebar-logo-text">SânCầu</div>
          <div className="sidebar-logo-sub">
            {role === 'admin' ? 'Admin Panel' : 'Owner Panel'}
          </div>
        </div>
      </NavLink>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menu.map((item, idx) => {
          if (item.section) {
            return (
              <div key={idx} className="sidebar-section-title">
                {item.section}
              </div>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/owner' || item.to === '/admin'}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer - User Info */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{getInitials(user?.fullname)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.fullname || 'Đang tải...'}</div>
            <div className="sidebar-user-role">{roleLabel}</div>
          </div>
          <span
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            🚪
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
