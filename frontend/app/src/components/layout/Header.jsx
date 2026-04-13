import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AuthController from '../../controllers/AuthController';
import NotificationService from '../../services/NotificationService';
import '../../../src/styles/Layout.css';

/**
 * Header Component - Dùng cho UserLayout (Header ngang)
 * Hiển thị: Logo, Navigation, Notification, Avatar Dropdown
 */
function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const isAuthenticated = Boolean(user) || AuthController.isAuthenticated();

  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await NotificationService.countUnread();
      const n = res?.data?.data ?? res?.data ?? 0;
      setUnreadCount(typeof n === 'number' ? n : Number(n) || 0);
    } catch {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Poll mỗi 30s + lắng nghe event cập nhật từ trang Notifications
  useEffect(() => {
    fetchUnread();
    const intervalId = setInterval(fetchUnread, 30000);
    const onUpdate = () => fetchUnread();
    window.addEventListener('notifications:updated', onUpdate);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('notifications:updated', onUpdate);
    };
  }, [fetchUnread]);

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
    if (onLogout) {
      onLogout();
    }
    navigate('/home');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isOwner = user?.roles?.includes('ROLE_OWNER');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const hasUnread = unreadCount > 0;

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
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <NavLink to="/notifications">
                <button
                  className={`header-icon-btn notification-btn ${hasUnread ? 'has-unread' : ''}`}
                  title={hasUnread ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
                >
                  <span className={`notification-bell ${hasUnread ? 'ring' : ''}`}>🔔</span>
                  {hasUnread && (
                    <span className="notification-badge">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
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
            </>
          ) : (
            <>
              <NavLink to="/login" className="header-auth-btn secondary">Đăng nhập</NavLink>
              <NavLink to="/signup" className="header-auth-btn primary">Đăng ký</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
