import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AdminService from '../../services/AdminService';
import '../../styles/Layout.css';

function GrantOwnerRole() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
  });

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '6px',
    fontWeight: 600,
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '14px',
    background: '#fff',
  };

  const actionBtnStyle = {
    width: '100%',
    minHeight: '42px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    margin: 0,
    padding: '0 12px',
    borderRadius: '10px',
    boxShadow: 'none',
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await AdminService.getUsers();
        const users = Array.isArray(res?.data?.data) ? res.data.data : [];
        const target = users.find((item) => String(item.id) === String(id));
        if (!target) {
          setError('Không tìm thấy người dùng cần cấp quyền.');
          setUser(null);
          return;
        }
        setUser(target);
        setForm({
          bankName: target.bankName || '',
          bankAccountNumber: target.bankAccountNumber || '',
          bankAccountName: target.bankAccountName || '',
        });
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Không thể tải thông tin người dùng.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const isOwner = useMemo(() => (user?.roles || []).includes('ROLE_OWNER'), [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const bankInfo = {
      bankName: form.bankName.trim(),
      bankAccountNumber: form.bankAccountNumber.trim(),
      bankAccountName: form.bankAccountName.trim(),
    };

    if (!bankInfo.bankName || !bankInfo.bankAccountNumber || !bankInfo.bankAccountName) {
      setError('Vui lòng nhập đầy đủ thông tin ngân hàng trước khi cấp quyền Chủ sân.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const roles = new Set(user.roles || []);
      roles.add('ROLE_OWNER');
      if (!roles.has('ROLE_USER')) {
        roles.add('ROLE_USER');
      }

      await AdminService.updateUserRoles(user.id, Array.from(roles), bankInfo);
      navigate('/admin/users');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Cấp quyền Chủ sân thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="🏦 Cấp Quyền Chủ Sân"
        subtitle="Nhập thông tin ngân hàng trước khi cấp quyền"
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
            ← Quay lại quản lý người dùng
          </button>
        }
      />

      {error && <div style={{ marginBottom: '12px' }} className="badge badge-danger">{error}</div>}

      <div className="card">
        <div className="card-body" style={{ maxWidth: '720px', margin: '0 auto', padding: '20px' }}>
          {loading ? (
            <p style={{ margin: 0 }}>Đang tải thông tin người dùng...</p>
          ) : !user ? (
            <p style={{ margin: 0 }}>Không có dữ liệu người dùng.</p>
          ) : isOwner ? (
            <p style={{ margin: 0 }}>Tài khoản này đã là Chủ sân.</p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px', background: '#f8fafc', border: '1px solid #dbe3f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ padding: '12px 14px', border: '1px solid #d6deec', borderRadius: '10px', background: '#eef2ff' }}>
                <div><strong>{user.fullname}</strong></div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user.phone} - {user.email}</div>
              </div>

              <div>
                <label style={labelStyle}>Ngân hàng thụ hưởng</label>
                <input
                  className="form-control"
                  style={inputStyle}
                  value={form.bankName}
                  onChange={(e) => setForm((prev) => ({ ...prev, bankName: e.target.value }))}
                  placeholder="VD: Vietcombank"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Số tài khoản thụ hưởng</label>
                <input
                  className="form-control"
                  style={inputStyle}
                  value={form.bankAccountNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, bankAccountNumber: e.target.value }))}
                  placeholder="Nhập số tài khoản"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Tên chủ tài khoản</label>
                <input
                  className="form-control"
                  style={inputStyle}
                  value={form.bankAccountName}
                  onChange={(e) => setForm((prev) => ({ ...prev, bankAccountName: e.target.value }))}
                  placeholder="Nhập tên chủ tài khoản"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '2px', alignItems: 'stretch' }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/users')} disabled={saving} style={actionBtnStyle}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={actionBtnStyle}>
                  {saving ? 'Đang cấp quyền...' : 'Cấp quyền Chủ sân'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default GrantOwnerRole;


