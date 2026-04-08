import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import '../styles/Auth.css';

/**
 * ForgotPassword - Bước 1: Nhập email để nhận mã token
 *
 * Luồng:
 *   User nhập email → POST /api/auth/forgot-password
 *   → Backend tạo token, gửi email
 *   → Chuyển sang trang ResetPassword để nhập token + mật khẩu mới
 */
function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false); // Đã gửi thành công

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }

    // Kiểm tra định dạng email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Email không đúng định dạng');
      return;
    }

    setLoading(true);
    try {
      await AuthService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      // Backend luôn trả 200 (tránh lộ thông tin email tồn tại hay không)
      // Trường hợp hiếm gặp: lỗi mạng hoặc server 500
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---- UI sau khi gửi thành công ----
  if (sent) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📧</div>
          <h1 className="auth-title" style={{ fontSize: '22px' }}>Kiểm tra hộp thư!</h1>
          <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', marginBottom: '20px' }}>
            Nếu email <strong>{email}</strong> đã được đăng ký, chúng tôi đã gửi một <strong>mã xác nhận</strong> đến hộp thư của bạn.
            <br />Mã có hiệu lực trong <strong>15 phút</strong>.
          </p>

          <div style={{
            background: '#f0f7ff',
            border: '1px solid #bde0fe',
            borderRadius: '8px',
            padding: '14px 16px',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#1d4ed8',
            textAlign: 'left',
          }}>
            <strong>💡 Không thấy email?</strong>
            <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
              <li>Kiểm tra thư mục <em>Spam / Rác</em></li>
              <li>Đảm bảo email bạn nhập đúng</li>
              <li>Chờ tối đa 1–2 phút</li>
            </ul>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', marginBottom: '12px' }}
            onClick={() => navigate('/reset-password')}
          >
            Tôi đã có mã → Đặt lại mật khẩu
          </button>

          <button
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#666',
            }}
            onClick={() => setSent(false)}
          >
            ← Gửi lại mã
          </button>

          <p className="auth-link" style={{ marginTop: '16px' }}>
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Quay lại đăng nhập
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ---- UI nhập email ----
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '48px' }}>🔑</div>

        <h1 className="auth-title">Quên Mật Khẩu</h1>
        <p className="auth-subtitle">
          Nhập email đã đăng ký để nhận mã đặt lại mật khẩu
        </p>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">📧 Địa Chỉ Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ví dụ: your@email.com"
              disabled={loading}
              autoFocus
              required
            />
            <span className="form-hint">
              Nhập email bạn đã dùng khi đăng ký tài khoản
            </span>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Đang gửi...' : '📨 Gửi Mã Xác Nhận'}
          </button>
        </form>

        <p className="auth-link">
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
            ← Quay lại đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
