import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthController from '../controllers/AuthController';
import '../styles/Auth.css';

/**
 * Signup Component - Form đăng ký
 */
function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthController.signup(formData);
      navigate('/home');
    } catch (err) {
      // Hiển thị lỗi chi tiết từ server hoặc validation
      const errorMessage = err.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(errorMessage);
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-container--signup">
      <div className="auth-split">
        <section className="auth-visual">
          <div className="auth-visual-media">
            <iframe
              src="https://my.spline.design/3dtextbluecopy-G8ERc7d5AZY6RX2Pd9RHh1pv/"
              title="Spline 3D"
              frameBorder="0"
              width="100%"
              height="100%"
            />
          </div>
          <div className="auth-visual__content">
            <div className="auth-hero-head">
              <div className="auth-brand">Quản Lý Sân Cầu Lông</div>
              <h1 className="auth-hero-title">Đặt sân cầu lông nhanh và chính xác</h1>
              <p className="auth-hero-subtitle">
                Tìm sân gần bạn, xem khung giờ, và đặt lịch chỉ trong vài bước.
              </p>
            </div>
            <div className="auth-hero-actions">
              <button type="button" className="auth-secondary-btn" onClick={() => navigate('/venues')}>
                Khám phá sân
              </button>
              <span className="auth-hero-note">Hỗ trợ người dùng, chủ sân.</span>
            </div>
            <div className="auth-hero-stats">
              <div className="auth-hero-stat">
                <span>24/7</span>
                <small>Đặt sân linh hoạt</small>
              </div>
              <div className="auth-hero-stat">
                <span>Minh bạch</span>
                <small>Giá theo giờ rõ ràng</small>
              </div>
              <div className="auth-hero-stat">
                <span>Thông báo</span>
                <small>Cập nhật lịch nhanh</small>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-panel auth-panel--signup">
          <div className="auth-card auth-card--signup">
            <div style={{ textAlign: 'center', fontSize: '40px', marginBottom: '4px' }}>🏸</div>
            <h1 className="auth-title">Đăng ký tài khoản</h1>
            <p className="auth-subtitle">Hoàn tất thông tin để bắt đầu đặt sân</p>

            {error && (
              <div className="error-message">
                <span>❌ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="fullname">👤 Họ tên <span className="required">*</span></label>
                <input
                  id="fullname"
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Nhập họ tên đầy đủ"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">📧 Email <span className="required">*</span></label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ví dụ: email@example.com"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">📱 Số điện thoại <span className="required">*</span></label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ví dụ: 0912345678"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">🔒 Mật khẩu <span className="required">*</span></label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  disabled={loading}
                  required
                />
                <small className="form-hint">Mật khẩu phải có ít nhất 6 ký tự</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">🔐 Xác nhận mật khẩu <span className="required">*</span></label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  disabled={loading}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Đang đăng ký...' : '✓ Đăng Ký'}
              </button>
            </form>

            <p className="auth-link">
              Đã có tài khoản?{' '}
              <a href="/login" onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}>
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Signup;

