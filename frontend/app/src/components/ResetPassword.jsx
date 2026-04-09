import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import '../styles/Auth.css';

/**
 * ResetPassword - Bước 2: Nhập token nhận từ email + mật khẩu mới
 *
 * Luồng:
 *   User nhập token (từ email) + mật khẩu mới
 *   → POST /api/auth/reset-password { token, newPassword }
 *   → Thành công → chuyển về trang Login
 */
function ResetPassword() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Kiểm tra độ mạnh mật khẩu
  const getPasswordStrength = (pass) => {
    if (!pass) return null;
    const checks = [
      pass.length >= 8,
      /[A-Z]/.test(pass),
      /[0-9]/.test(pass),
      /[^A-Za-z0-9]/.test(pass),
    ];
    const score = checks.filter(Boolean).length;
    if (score <= 1) return { label: 'Yếu', color: '#ef4444', width: '25%' };
    if (score === 2) return { label: 'Trung bình', color: '#f59e0b', width: '50%' };
    if (score === 3) return { label: 'Khá', color: '#0ea5e9', width: '75%' };
    return { label: 'Mạnh', color: '#10b981', width: '100%' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!token.trim()) {
      setError('Vui lòng nhập mã xác nhận từ email');
      return;
    }
    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword(token.trim(), newPassword);
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Mã xác nhận không hợp lệ hoặc đã hết hạn.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---- UI thành công ----
  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h1 className="auth-title" style={{ fontSize: '22px' }}>Đặt lại thành công!</h1>
          <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', marginBottom: '28px' }}>
            Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập bằng mật khẩu mới.
          </p>
          <button
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={() => navigate('/login')}
          >
            🔑 Đăng Nhập Ngay
          </button>
        </div>
      </div>
    );
  }

  // ---- UI nhập token + mật khẩu mới ----
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '48px' }}>🔒</div>
        <h1 className="auth-title">Đặt Lại Mật Khẩu</h1>
        <p className="auth-subtitle">
          Nhập mã từ email và mật khẩu mới của bạn
        </p>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        {/* Hướng dẫn */}
        <div style={{
          background: '#fefce8',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#92400e',
        }}>
          📧 Kiểm tra hộp thư (kể cả thư mục <em>Spam</em>) để lấy <strong>mã xác nhận</strong>. Mã có hiệu lực <strong>15 phút</strong>.
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Token input */}
          <div className="form-group">
            <label htmlFor="token">🔑 Mã Xác Nhận</label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Mã xác nhận"
              disabled={loading}
              autoFocus
              style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
            />
          </div>


          {/* New Password */}
          <div className="form-group">
            <label htmlFor="newPassword">🔒 Mật Khẩu Mới</label>
            <div style={{ position: 'relative' }}>
              <input
                id="newPassword"
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                disabled={loading}
                style={{ paddingRight: '44px' }}
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

            {/* Password strength bar */}
            {newPassword && strength && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: strength.width,
                    background: strength.color,
                    borderRadius: '4px',
                    transition: 'width 0.3s, background 0.3s',
                  }} />
                </div>
                <span style={{ fontSize: '11px', color: strength.color, fontWeight: '600' }}>
                  Độ mạnh: {strength.label}
                </span>
              </div>
            )}
            <span className="form-hint">
              Gợi ý: Dùng chữ hoa, số và ký tự đặc biệt để tăng bảo mật
            </span>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">🔒 Xác Nhận Mật Khẩu</label>
            <input
              id="confirmPassword"
              type={showPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              disabled={loading}
            />
            {/* Match indicator */}
            {confirmPassword && (
              <span style={{
                fontSize: '12px',
                color: confirmPassword === newPassword ? '#10b981' : '#ef4444',
                fontWeight: '600',
              }}>
                {confirmPassword === newPassword ? '✅ Mật khẩu khớp' : '❌ Chưa khớp'}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !token || !newPassword || newPassword !== confirmPassword}
          >
            {loading ? '⏳ Đang xử lý...' : '✅ Xác Nhận Đặt Lại Mật Khẩu'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p className="auth-link" style={{ margin: 0 }}>
            Chưa có mã?{' '}
            <a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>
              Gửi lại
            </a>
          </p>
          <p className="auth-link" style={{ margin: 0 }}>
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              ← Quay lại đăng nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
