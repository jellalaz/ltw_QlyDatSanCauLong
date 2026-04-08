import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserController from '../controllers/UserController';
import AuthController from '../controllers/AuthController';
import '../styles/Home.css';

/**
 * Home View - Trang chủ sau khi đăng nhập thành công
 */
function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const userData = await UserController.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err.message || 'Lỗi tải thông tin');
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
    if (confirmLogout) {
      AuthController.logout();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Đang tải thông tin...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error-message">{error}</div>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Quay lại đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <h1 className="app-title">🏐 Quản Lý Đặt Sân Cầu Lông</h1>
          <div className="header-actions">
            <span className="user-info">Xin chào, {user?.fullname || 'Người dùng'}</span>
            <button className="btn-logout" onClick={handleLogout}>
              Đăng Xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="home-main">
        <div className="welcome-section">
          <h2>Chào mừng bạn trở lại!</h2>
          <p>Vui lòng chọn chức năng bên dưới để tiếp tục</p>
        </div>

        <div className="menu-grid">
          <div className="menu-card" onClick={() => navigate('/profile')}>
            <div className="menu-icon">👤</div>
            <h3>Thông Tin Cá Nhân</h3>
            <p>Xem và chỉnh sửa thông tin tài khoản</p>
          </div>

          <div className="menu-card" onClick={() => navigate('/bookings')}>
            <div className="menu-icon">📅</div>
            <h3>Lịch Đặt Sân</h3>
            <p>Quản lý các lịch đặt sân của bạn</p>
          </div>

          <div className="menu-card" onClick={() => navigate('/courts')}>
            <div className="menu-icon">🏟️</div>
            <h3>Sân Cầu Lông</h3>
            <p>Tìm kiếm và đặt sân cầu lông</p>
          </div>

          {user?.isOwner?.() && (
            <div className="menu-card" onClick={() => navigate('/owner')}>
              <div className="menu-icon">🏪</div>
              <h3>Quản Lý Sân (Chủ Sân)</h3>
              <p>Quản lý sân cầu lông của bạn</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2024 Quản Lý Đặt Sân Cầu Lông. Tất cả quyền được bảo vệ.</p>
      </footer>
    </div>
  );
}

export default Home;

