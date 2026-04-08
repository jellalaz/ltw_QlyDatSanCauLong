import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthController from '../controllers/AuthController';
import '../styles/Auth.css';

/**
 * Login Component - Form đăng nhập
 */
function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate dữ liệu
      if (!phone.trim()) {
        throw new Error('Vui lòng nhập số điện thoại');
      }

      if (!password.trim()) {
        throw new Error('Vui lòng nhập mật khẩu');
      }

      const loginData = { phone: phone.trim(), password };
      await AuthController.login(loginData);
      navigate('/home');
    } catch (err) {
      // Hiển thị lỗi chi tiết từ server hoặc validation
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
        <h1 className="auth-title">Đăng Nhập</h1>
        <p className="auth-subtitle">Quản lý dặt sân cầu lông</p>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="phone">Số Điện Thoại</label>
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
            <label htmlFor="password">Mật Khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Đang đăng nhập...' : '✓ Đăng Nhập'}
          </button>
        </form>

        <p className="auth-link">
          Chưa có tài khoản?{' '}
          <a href="/signup" onClick={(e) => {
            e.preventDefault();
            navigate('/signup');
          }}>
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;

