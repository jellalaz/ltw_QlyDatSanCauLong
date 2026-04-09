import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AuthController from '../../controllers/AuthController';
import '../../../src/styles/Layout.css';

/**
 * Header Component - Dùng cho UserLayout (Header ngang)
 * Hiển thị: Logo, Navigation, Notification, Avatar Dropdown
 */
function Header({ user }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    AuthController.logout();
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isOwner = user?.roles?.includes('ROLE_OWNER');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <NavLink to="/home" className="header-logo">
          <div className="header-logo-icon">🏸</div>
          <span className="header-logo-text">SânCầu</span>
        </NavLink>

        {/* Navigation */}
        <nav className="header-nav">
          <NavLink
            to="/venues"
            className={({ isActive }) =>
              `header-nav-item ${isActive ? 'active' : ''}`
            }
          >
            🏟️ Tìm Sân
          </NavLink>
          <NavLink
            to="/bookings"
            className={({ isActive }) =>
              `header-nav-item ${isActive ? 'active' : ''}`
            }
          >
            📅 Lịch Đặt Sân
          </NavLink>

          {/* Hiển thị link Owner nếu là OWNER */}
          {isOwner && (
            <NavLink
              to="/owner"
              className={({ isActive }) =>
                `header-nav-item ${isActive ? 'active' : ''}`
              }
            >
              🏪 Quản Lý Sân
            </NavLink>
          )}

          {/* Hiển thị link Admin nếu là ADMIN */}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `header-nav-item ${isActive ? 'active' : ''}`
              }
            >
              ⚙️ Quản Trị
            </NavLink>
          )}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          {/* Notification Bell */}
          <NavLink to="/notifications">
            <button className="header-icon-btn" title="Thông báo">
              🔔
              {/* Hiện badge đỏ nếu có thông báo chưa đọc */}
              <span className="notification-badge" />
            </button>
          </NavLink>

          {/* Avatar Dropdown */}
          <div className="dropdown-wrapper" ref={dropdownRef}>
            <button
              className="header-user-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="header-avatar">
                {getInitials(user?.fullname)}
              </div>
              <span className="header-username">
                {user?.fullname?.split(' ').pop() || 'Tài khoản'}
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>▾</span>
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <NavLink
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  👤 Thông tin cá nhân
                </NavLink>
                <NavLink
                  to="/notifications"
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  🔔 Thông báo
                </NavLink>
                {isOwner && (
                  <NavLink
                    to="/owner"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    🏪 Trang chủ sân
                  </NavLink>
                )}
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    ⚙️ Trang quản trị
                  </NavLink>
                )}
                <div className="dropdown-divider" />
                <div
                  className="dropdown-item danger"
                  onClick={() => { setDropdownOpen(false); handleLogout(); }}
                >
                  🚪 Đăng xuất
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
