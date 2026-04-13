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
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationItems, setNotificationItems] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

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
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotificationPreview = useCallback(async () => {
    if (!isAuthenticated) {
      setNotificationItems([]);
      return;
    }
    try {
      setNotificationLoading(true);
      const res = await NotificationService.getAll();
      const data = res?.data?.data || res?.data || [];
      const list = Array.isArray(data) ? data.slice(0, 6) : [];
      setNotificationItems(list);
    } catch {
      setNotificationItems([]);
    } finally {
      setNotificationLoading(false);
    }
  }, [isAuthenticated]);

  const resolveNotificationTarget = (item) => {
    if (item?.targetPath) return item.targetPath;
    if (item?.bookingId) return `/bookings/${item.bookingId}/payment`;
    return '/notifications';
  };

  const handleOpenNotification = async () => {
    const nextOpen = !notificationOpen;
    setNotificationOpen(nextOpen);
    setDropdownOpen(false);
    if (nextOpen) {
      await loadNotificationPreview();
    }
  };

  const handleNotificationClick = async (item) => {
    try {
      if (!item?.isRead) {
        await NotificationService.markAsRead(item.id);
      }
    } catch {
      // Keep navigation flow even if mark-as-read fails.
    }

    setNotificationItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
    window.dispatchEvent(new Event('notifications:updated'));
    setNotificationOpen(false);
    navigate(resolveNotificationTarget(item));
  };

  const handleGoToAllNotifications = () => {
    setNotificationOpen(false);
    navigate('/notifications');
  };

  const handleMarkAllNotifications = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotificationItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      window.dispatchEvent(new Event('notifications:updated'));
    } catch {
      // Keep dropdown usable even if mark-all fails.
    }
  };

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
          <NavLink
            to="/my-reviews"
            className={({ isActive }) =>
              `header-nav-item ${isActive ? 'active' : ''}`
            }
          >
            ⭐ Đánh giá của tôi
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
              <div className="dropdown-wrapper" ref={notificationRef}>
                <button
                  type="button"
                  className={`header-icon-btn notification-btn ${hasUnread ? 'has-unread' : ''}`}
                  title={hasUnread ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
                  onClick={handleOpenNotification}
                >
                  <span className={`notification-bell ${hasUnread ? 'ring' : ''}`}>🔔</span>
                  {hasUnread && (
                    <span className="notification-badge">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="dropdown-menu" style={{ minWidth: '320px', maxWidth: '360px' }}>
                    <div className="dropdown-item" style={{ justifyContent: 'space-between', cursor: 'default', fontWeight: 700 }}>
                      <span>Thông báo mới</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{unreadCount} chưa đọc</span>
                    </div>
                    <div className="dropdown-divider" />

                    {notificationLoading && (
                      <div className="dropdown-item" style={{ cursor: 'default', color: '#64748b' }}>Đang tải...</div>
                    )}

                    {!notificationLoading && notificationItems.length === 0 && (
                      <div className="dropdown-item" style={{ cursor: 'default', color: '#64748b' }}>Chưa có thông báo nào</div>
                    )}

                    {!notificationLoading && notificationItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`dropdown-item notification-preview-item ${item.isRead ? 'is-read' : 'is-unread'}`}
                        onClick={() => handleNotificationClick(item)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#dfe8ff';
                          e.currentTarget.style.boxShadow = 'inset 4px 0 0 #4f46e5';
                          e.currentTarget.style.transform = 'translateX(3px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = item.isRead ? 'transparent' : '#eef2ff';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                        style={{
                          width: '100%',
                          border: 'none',
                          textAlign: 'left',
                          alignItems: 'flex-start',
                          flexDirection: 'column',
                          background: item.isRead ? 'transparent' : '#eef2ff',
                        }}
                      >
                        <span style={{ fontWeight: item.isRead ? 600 : 700 }}>{item.title}</span>
                        <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{item.message}</span>
                      </button>
                    ))}

                    <div className="dropdown-divider" />

                    {hasUnread && (
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={handleMarkAllNotifications}
                        style={{ width: '100%', border: 'none', textAlign: 'left', justifyContent: 'center', fontWeight: 600 }}
                      >
                        ✓ Đánh dấu tất cả đã đọc
                      </button>
                    )}

                    {hasUnread && <div className="dropdown-divider" />}

                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={handleGoToAllNotifications}
                      style={{ width: '100%', border: 'none', textAlign: 'left', justifyContent: 'center', fontWeight: 600 }}
                    >
                      Xem trang thông báo
                    </button>
                  </div>
                )}
              </div>

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
                    <NavLink
                      to="/my-reviews"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      ⭐ Đánh giá của tôi
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
