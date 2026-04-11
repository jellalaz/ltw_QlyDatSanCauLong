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
      <div className="auth-card">
        <div style={{ textAlign: 'center', fontSize: '40px', marginBottom: '4px' }}>🏸</div>
        <h1 className="auth-title">Đăng Nhập</h1>
        <p className="auth-subtitle">Hệ thống quản lý đặt sân cầu lông</p>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="phone">📱 Số Điện Thoại</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ví dụ: 0912345678"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔒 Mật Khẩu</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
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
            {loading ? '⏳ Đang đăng nhập...' : '✓ Đăng Nhập'}
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
    </div>
  );
}

export default Login;
