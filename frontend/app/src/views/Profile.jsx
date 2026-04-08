import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserController from '../controllers/UserController';
import AuthService from '../services/AuthService';
import '../styles/Profile.css';
import '../styles/Layout.css';

/**
 * Profile View - Trang xem và chỉnh sửa thông tin cá nhân
 */
function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State cho form nâng cấp lên Chủ Sân
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [requestingOwner, setRequestingOwner] = useState(false);
  const [ownerError, setOwnerError] = useState('');
  const [ownerSuccess, setOwnerSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await UserController.getCurrentUser();
      setUser(userData);
      setFormData({
        fullname: userData.fullname || '',
        email: userData.email || '',
        phone: userData.phone || '',
        bankName: userData.bankName || '',
        bankAccountNumber: userData.bankAccountNumber || '',
        bankAccountName: userData.bankAccountName || '',
      });
    } catch (err) {
      setError(err.message || 'Lỗi tải thông tin');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      const updatedUser = await UserController.updateCurrentUser(formData);
      setUser(updatedUser);
      setIsEditing(false);
      setSuccess('Cập nhật thông tin thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại');
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        email: user.email || '',
        phone: user.phone || '',
        bankName: user.bankName || '',
        bankAccountNumber: user.bankAccountNumber || '',
        bankAccountName: user.bankAccountName || '',
      });
    }
  };

  const handleRequestOwner = async () => {
    setOwnerError('');
    setOwnerSuccess('');

    // Validate thông tin ngân hàng là bắt buộc trước khi đăng ký Chủ Sân
    if (!formData.bankName?.trim()) {
      setOwnerError('Vui lòng cập nhật Tên Ngân Hàng trước khi đăng ký');
      setIsEditing(true);
      return;
    }
    if (!formData.bankAccountNumber?.trim()) {
      setOwnerError('Vui lòng cập nhật Số Tài Khoản trước khi đăng ký');
      setIsEditing(true);
      return;
    }
    if (!formData.bankAccountName?.trim()) {
      setOwnerError('Vui lòng cập nhật Chủ Tài Khoản trước khi đăng ký');
      setIsEditing(true);
      return;
    }

    try {
      setRequestingOwner(true);
      await UserController.requestOwnerRole();
      setOwnerSuccess('Đăng ký thành công! Tài khoản của bạn đã được nâng cấp lên Chủ Sân. Vui lòng đăng nhập lại để cập nhật quyền.');
      setShowOwnerForm(false);
      // Reload lại thông tin user
      const updated = await UserController.getCurrentUser();
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    } catch (err) {
      setOwnerError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setRequestingOwner(false);
    }
  };

  // ---- Đổi mật khẩu ----
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [showPwdField, setShowPwdField] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPwdForm(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!pwdForm.currentPassword) { setPwdError('Vui lòng nhập mật khẩu hiện tại'); return; }
    if (!pwdForm.newPassword) { setPwdError('Vui lòng nhập mật khẩu mới'); return; }
    if (pwdForm.newPassword.length < 6) { setPwdError('Mật khẩu mới phải có ít nhất 6 ký tự'); return; }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { setPwdError('Mật khẩu xác nhận không khớp'); return; }

    try {
      setPwdLoading(true);
      // Gọi API POST /api/auth/change-password
      await AuthService.changePassword(pwdForm.currentPassword, pwdForm.newPassword, pwdForm.confirmPassword);
      setPwdSuccess('Đổi mật khẩu thành công!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => { setPwdSuccess(''); setShowChangePwd(false); }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đổi mật khẩu thất bại';
      setPwdError(msg);
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {

    return (
      <div className="profile-container">
        <div className="loading">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <button className="btn-back" onClick={() => navigate('/home')}>
          ← Quay lại
        </button>
        <h1>Thông Tin Cá Nhân</h1>
      </header>

      {/* Main Content */}
      <main className="profile-main">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-card">
          {!isEditing ? (
            <div className="profile-view">
              <div className="profile-section">
                <h2>Thông Tin Cơ Bản</h2>
                <div className="info-group">
                  <label>Họ Tên:</label>
                  <p>{user?.fullname}</p>
                </div>
                <div className="info-group">
                  <label>Email:</label>
                  <p>{user?.email}</p>
                </div>
                <div className="info-group">
                  <label>Số Điện Thoại:</label>
                  <p>{user?.phone}</p>
                </div>
                <div className="info-group">
                  <label>Vai Trò:</label>
                  <p>{user?.roles?.join(', ')}</p>
                </div>
              </div>

              {(user?.bankName || user?.bankAccountNumber || user?.bankAccountName) && (
                <div className="profile-section">
                  <h2>Thông Tin Ngân Hàng</h2>
                  <div className="info-group">
                    <label>Tên Ngân Hàng:</label>
                    <p>{user?.bankName || '-'}</p>
                  </div>
                  <div className="info-group">
                    <label>Số Tài Khoản:</label>
                    <p>{user?.bankAccountNumber || '-'}</p>
                  </div>
                  <div className="info-group">
                    <label>Chủ Tài Khoản:</label>
                    <p>{user?.bankAccountName || '-'}</p>
                  </div>
                </div>
              )}

              <button
                className="btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Chỉnh Sửa Thông Tin
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="profile-edit">
              <div className="form-section">
                <h2>Chỉnh Sửa Thông Tin Cơ Bản</h2>

                <div className="form-group">
                  <label htmlFor="fullname">Họ Tên</label>
                  <input
                    id="fullname"
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Số Điện Thoại</label>
                  <input
                    id="phone"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h2>Thông Tin Ngân Hàng (Tùy Chọn)</h2>

                <div className="form-group">
                  <label htmlFor="bankName">Tên Ngân Hàng</label>
                  <input
                    id="bankName"
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="VD: Vietcombank, Techcombank..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bankAccountNumber">Số Tài Khoản</label>
                  <input
                    id="bankAccountNumber"
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    placeholder="VD: 0123456789"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bankAccountName">Chủ Tài Khoản</label>
                  <input
                    id="bankAccountName"
                    type="text"
                    name="bankAccountName"
                    value={formData.bankAccountName}
                    onChange={handleChange}
                    placeholder="Tên chủ tài khoản"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>

        {/* =========================================
            SECTION: Đổi Mật Khẩu
            ========================================= */}
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '10px', display: 'block' }}
              onClick={() => {
                setShowChangePwd(!showChangePwd);
                setPwdError('');
                setPwdSuccess('');
                setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
            >
              {showChangePwd ? '✕ Đóng' : '✏️ Đổi mật khẩu'}
            </button>
          </div>

          {showChangePwd && (
            <div className="card-body">
              {pwdError && (
                <div style={{ padding: '10px 14px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px', marginBottom: '14px' }}>
                  ⚠️ {pwdError}
                </div>
              )}
              {pwdSuccess && (
                <div style={{ padding: '10px 14px', background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '13px', marginBottom: '14px' }}>
                  ✅ {pwdSuccess}
                </div>
              )}
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Mật khẩu hiện tại */}
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                    Mật khẩu hiện tại
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      name="currentPassword"
                      type={showPwdField ? 'text' : 'password'}
                      value={pwdForm.currentPassword}
                      onChange={handlePwdChange}
                      placeholder="Nhập mật khẩu hiện tại"
                      disabled={pwdLoading}
                      style={{ width: '100%', padding: '10px 42px 10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                    <button type="button" onClick={() => setShowPwdField(!showPwdField)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#888' }}>
                      {showPwdField ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                    Mật khẩu mới
                  </label>
                  <input
                    name="newPassword"
                    type={showPwdField ? 'text' : 'password'}
                    value={pwdForm.newPassword}
                    onChange={handlePwdChange}
                    placeholder="Ít nhất 6 ký tự"
                    disabled={pwdLoading}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    name="confirmPassword"
                    type={showPwdField ? 'text' : 'password'}
                    value={pwdForm.confirmPassword}
                    onChange={handlePwdChange}
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={pwdLoading}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                  {pwdForm.confirmPassword && (
                    <span style={{ fontSize: '12px', color: pwdForm.confirmPassword === pwdForm.newPassword ? '#10b981' : '#ef4444', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                      {pwdForm.confirmPassword === pwdForm.newPassword ? '✅ Mật khẩu khớp' : '❌ Chưa khớp'}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={pwdLoading || !pwdForm.currentPassword || !pwdForm.newPassword || pwdForm.newPassword !== pwdForm.confirmPassword}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {pwdLoading ? '⏳ Đang xử lý...' : '✅ Xác Nhận Đổi Mật Khẩu'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* =========================================
            SECTION: Đăng Ký Trở Thành Chủ Sân
            Chỉ hiện khi user CHƯA có ROLE_OWNER
            ========================================= */}
        {!user?.roles?.includes('ROLE_OWNER') && (

          <div className="card" style={{ marginTop: '24px', border: '2px dashed #4f46e5', background: '#f5f3ff' }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ fontSize: '40px', flexShrink: 0 }}>🏪</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '700', color: '#4f46e5' }}>
                    Đăng Ký Trở Thành Chủ Sân
                  </h3>
                  <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#64748b' }}>
                    Trở thành Chủ Sân để đăng ký quản lý và kinh doanh sân cầu lông trên nền tảng của chúng tôi.
                    Bạn cần điền đầy đủ thông tin ngân hàng để nhận tiền từ các đơn đặt sân.
                  </p>

                  {ownerError && (
                    <div style={{ padding: '10px 14px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px', marginBottom: '12px' }}>
                      ⚠️ {ownerError}
                    </div>
                  )}

                  {ownerSuccess && (
                    <div style={{ padding: '10px 14px', background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '13px', marginBottom: '12px' }}>
                      ✅ {ownerSuccess}
                    </div>
                  )}

                  {/* Hiển thị danh sách kiểm tra thông tin ngân hàng */}
                  <div style={{ background: 'white', borderRadius: '8px', padding: '14px', marginBottom: '16px', border: '1px solid #e0e7ff' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                      Thông tin cần thiết:
                    </p>
                    {[
                      { label: 'Tên Ngân Hàng', value: user?.bankName },
                      { label: 'Số Tài Khoản', value: user?.bankAccountNumber },
                      { label: 'Chủ Tài Khoản', value: user?.bankAccountName },
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px' }}>{item.value ? '✅' : '❌'}</span>
                        <span style={{ fontSize: '13px', color: '#374151' }}>{item.label}:</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: item.value ? '#065f46' : '#991b1b' }}>
                          {item.value || 'Chưa điền'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {!user?.bankName || !user?.bankAccountNumber || !user?.bankAccountName ? (
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '13px' }}
                        onClick={() => setIsEditing(true)}
                      >
                        ✏️ Cập nhật thông tin ngân hàng
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: '13px' }}
                        onClick={handleRequestOwner}
                        disabled={requestingOwner}
                      >
                        {requestingOwner ? 'Đang xử lý...' : '🏪 Đăng Ký Trở Thành Chủ Sân'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Badge nếu đã là OWNER */}
        {user?.roles?.includes('ROLE_OWNER') && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: '#d1fae5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
            <span style={{ fontSize: '24px' }}>🏆</span>
            <div>
              <div style={{ fontWeight: '700', color: '#065f46', fontSize: '15px' }}>Bạn đang là Chủ Sân</div>
              <div style={{ fontSize: '13px', color: '#047857' }}>Truy cập <a href="/owner" style={{ color: '#047857', fontWeight: '600' }}>Khu vực Chủ Sân</a> để quản lý cơ sở của bạn</div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default Profile;


