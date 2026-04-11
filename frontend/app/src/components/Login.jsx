import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthController from '../controllers/AuthController';
import '../styles/Auth.css';

/**
 * Login Component - Form đăng nhập
 */
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from
    ? `${location.state.from.pathname || ''}${location.state.from.search || ''}${location.state.from.hash || ''}`
    : '/home';

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!phone.trim()) throw new Error('Vui lòng nhập số điện thoại');
      if (!password.trim()) throw new Error('Vui lòng nhập mật khẩu');

      const loginData = { phone: phone.trim(), password };
      await AuthController.login(loginData);
      navigate(returnTo, { replace: true });
    } catch (err) {
      const errorMessage = err.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
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
          <div className="auth-visual__content auth-visual__content--login">
            <div className="auth-hero-head auth-hero-head--login">
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

        <section className="auth-panel">
          <div className="auth-card glass-card">
            <div style={{ textAlign: 'center', fontSize: '40px', marginBottom: '4px' }}>🏸</div>
            <h1 className="auth-title">Đăng nhập tài khoản</h1>
            <p className="auth-subtitle">Bắt đầu đặt sân và quản lý lý lịch của bạn</p>

            {error && (
              <div className="error-message">
                <span>❌ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="phone">📱 Số điện thoại</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Vi du: 0912345678"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">🔒 Mật khẩu</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhap mat khau"
                    disabled={loading}
                    style={{ paddingRight: '44px', width: '100%', boxSizing: 'border-box' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                      color: '#888',
                    }}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Đang Đăng Nhập...' : '✓ Đăng Nhập'}
              </button>
            </form>

            <p className="auth-link">
              Chưa có tài khoản?{' '}
              <a href="/signup" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
                Đăng ký ngay
              </a>
            </p>
            <p className="auth-link">
              <a
                href="/forgot-password"
                onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
              >
                Quên mật khẩu?
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
