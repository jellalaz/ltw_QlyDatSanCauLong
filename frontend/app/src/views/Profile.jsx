import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserController from '../controllers/UserController';
import '../styles/Profile.css';

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
      </main>
    </div>
  );
}

export default Profile;

