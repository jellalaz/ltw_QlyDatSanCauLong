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
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Đăng Ký</h1>
        <p className="auth-subtitle">Tạo tài khoản mới</p>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullname">Họ Tên <span className="required">*</span></label>
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
            <label htmlFor="email">Email <span className="required">*</span></label>
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
            <label htmlFor="phone">Số Điện Thoại <span className="required">*</span></label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ví dụ: 0912345678 (10-11 số)"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật Khẩu <span className="required">*</span></label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ít nhất 6 ký tự"
              disabled={loading}
              required
            />
            <small className="form-hint">💡 Mật khẩu phải có ít nhất 6 ký tự</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu <span className="required">*</span></label>
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
    </div>
  );
}

export default Signup;

