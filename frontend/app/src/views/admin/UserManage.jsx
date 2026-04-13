import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AdminService from '../../services/AdminService';
import '../../styles/Layout.css';

/**
 * UserManage - Quản lý người dùng toàn hệ thống (ADMIN)
 * Dùng API admin/users + admin/users/{id}/roles
 */
function UserManage() {
  const navigate = useNavigate();
  const SYSTEM_ADMIN_PHONES = ['09000000', '0900000000'];
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullname: '',
    phone: '',
    email: '',
    password: '',
  });
  const [editForm, setEditForm] = useState({
    fullname: '',
    phone: '',
    email: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await AdminService.getUsers();
      setUsers(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Không thể tải danh sách user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const visibleUsers = users.filter((u) => !SYSTEM_ADMIN_PHONES.includes(String(u.phone || '').trim()));
    const keyword = search.trim().toLowerCase();
    if (!keyword) return visibleUsers;

    return visibleUsers.filter((u) =>
      [u.fullname, u.phone, u.email].some((field) =>
        String(field || '').toLowerCase().includes(keyword)
      )
    );
  }, [users, search]);

  const editingUser = useMemo(
    () => users.find((u) => u.id === editingUserId) || null,
    [users, editingUserId],
  );

  const actionBtnStyle = {
    width: '100%',
    height: '42px',
    minHeight: '42px',
    maxHeight: '42px',
    textAlign: 'center',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 12px',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    margin: 0,
    lineHeight: 1,
    borderRadius: '10px',
    boxShadow: 'none',
  };

  const editLabelStyle = {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '4px',
    fontWeight: 600,
  };

  const editInputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '14px',
    background: '#fff',
  };

  const createLabelStyle = {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '6px',
    fontWeight: 600,
  };

  const createInputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '14px',
    background: '#fff',
  };

  const setRoles = async (user, nextRoles, bankInfo = null) => {
    try {
      setUpdatingUserId(user.id);
      await AdminService.updateUserRoles(user.id, nextRoles, bankInfo);
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Cập nhật role thất bại');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const toggleRole = async (user, role) => {
    const roleSet = new Set(user.roles || []);

    if (roleSet.has(role)) {
      roleSet.delete(role);
    } else {
      roleSet.add(role);
    }

    if (roleSet.size === 0) {
      roleSet.add('ROLE_USER');
    }

    await setRoles(user, Array.from(roleSet));
  };

  const handleOwnerAction = async (user) => {
    const roles = user.roles || [];
    const hasOwnerRole = roles.includes('ROLE_OWNER');
    if (!hasOwnerRole) {
      navigate(`/admin/users/${user.id}/grant-owner`);
      return;
    }

    await toggleRole(user, 'ROLE_OWNER');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError('');
      await AdminService.createUser(createForm);
      setCreateForm({ fullname: '', phone: '', email: '', password: '' });
      setShowCreateForm(false);
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Tạo người dùng thất bại');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setEditForm({
      fullname: user.fullname || '',
      phone: user.phone || '',
      email: user.email || '',
      bankName: user.bankName || '',
      bankAccountNumber: user.bankAccountNumber || '',
      bankAccountName: user.bankAccountName || '',
    });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditForm({ fullname: '', phone: '', email: '', bankName: '', bankAccountNumber: '', bankAccountName: '' });
  };

  const handleSaveEdit = async (user) => {
    try {
      setEditSaving(true);
      setError('');
      const payload = {
        fullname: editForm.fullname,
        phone: editForm.phone,
        email: editForm.email,
        bankName: editForm.bankName,
        bankAccountNumber: editForm.bankAccountNumber,
        bankAccountName: editForm.bankAccountName,
      };
      if (!(user.roles || []).includes('ROLE_OWNER')) {
        payload.bankName = null;
        payload.bankAccountNumber = null;
        payload.bankAccountName = null;
      }
      await AdminService.updateUser(user.id, payload);
      cancelEdit();
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Cập nhật người dùng thất bại');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa tài khoản ${user.fullname}?`)) return;
    try {
      setUpdatingUserId(user.id);
      setError('');
      await AdminService.deleteUser(user.id);
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Xóa người dùng thất bại');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const roleLabel = (roles) => {
    if (roles.includes('ROLE_ADMIN')) return <span className="badge badge-danger">Admin</span>;
    if (roles.includes('ROLE_OWNER')) return <span className="badge badge-info">Chủ Sân</span>;
    return <span className="badge badge-default">Người dùng</span>;
  };

  return (
    <div>
      <PageHeader
        title="👥 Quản Lý Người Dùng"
        subtitle="Danh sách toàn bộ tài khoản trong hệ thống"
        actions={
          <button className="btn btn-primary" onClick={() => setShowCreateForm((prev) => !prev)}>
            {showCreateForm ? 'Đóng form' : '+ Thêm người dùng'}
          </button>
        }
      />

      {editingUser && (
        <div className="card" style={{ marginBottom: '12px', border: '1px solid #c7d2fe', background: '#eef2ff' }}>
          <div className="card-body" style={{ padding: '10px 14px' }}>
            <div style={{ fontWeight: 700, color: '#3730a3' }}>Đang chỉnh sửa người dùng</div>
            <div style={{ fontSize: '13px', color: '#4f46e5' }}>
              {editingUser.fullname} - {editingUser.phone}
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="card" style={{ marginBottom: '12px' }}>
          <div className="card-body">
            <form onSubmit={handleCreateUser} style={{ display: 'grid', gap: '12px', border: '1px solid #dbe3f0', borderRadius: '12px', padding: '14px', background: '#f8fafc' }}>
              <div style={{ fontWeight: 700, color: '#1e293b', paddingBottom: '4px', borderBottom: '1px solid #e2e8f0' }}>
                Thêm tài khoản người dùng mới
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                <div>
                  <div style={createLabelStyle}>Họ tên</div>
                  <input className="form-control" style={createInputStyle} placeholder="Nhập họ tên" value={createForm.fullname} onChange={(e) => setCreateForm((prev) => ({ ...prev, fullname: e.target.value }))} required />
                </div>
                <div>
                  <div style={createLabelStyle}>Số điện thoại</div>
                  <input className="form-control" style={createInputStyle} placeholder="Nhập số điện thoại" value={createForm.phone} onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))} required />
                </div>
                <div>
                  <div style={createLabelStyle}>Email</div>
                  <input className="form-control" style={createInputStyle} placeholder="Nhập email" type="email" value={createForm.email} onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))} required />
                </div>
                <div>
                  <div style={createLabelStyle}>Mật khẩu</div>
                  <input className="form-control" style={createInputStyle} placeholder="Nhập mật khẩu" type="password" value={createForm.password} onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', justifyItems: 'end' }}>
                <button className="btn btn-success" style={{ minWidth: '220px', minHeight: '40px' }} type="submit" disabled={creating}>{creating ? 'Đang tạo...' : 'Tạo tài khoản khách hàng'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <div className="search-bar">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div style={{ marginBottom: '12px' }} className="badge badge-danger">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="card-body">Đang tải danh sách user...</div>
        ) : (
          <div className="table-wrapper">
            <table className="table" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '22%', textAlign: 'center' }}>Họ tên</th>
                  <th style={{ width: '28%', textAlign: 'center' }}>Liên hệ</th>
                  <th style={{ width: '14%', textAlign: 'center' }}>Vai trò</th>
                  <th style={{ width: '36%', textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: '600', textAlign: 'center', verticalAlign: 'middle' }}>{u.fullname}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '13px' }}>{u.phone}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.email}</div>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{roleLabel(u.roles || [])}</td>
                    <td style={{ verticalAlign: 'middle' }}>
                      {editingUserId === u.id ? (
                        <div style={{ display: 'grid', gap: '10px', width: '100%', minWidth: '320px', padding: '12px', border: '1px solid #dbe3f0', borderRadius: '10px', background: '#f8fafc' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', paddingBottom: '4px', borderBottom: '1px solid #e2e8f0' }}>
                            Chỉnh sửa thông tin người dùng
                          </div>
                          <div>
                            <div style={editLabelStyle}>Họ tên</div>
                            <input className="form-control" style={editInputStyle} placeholder="Nhập họ tên" value={editForm.fullname} onChange={(e) => setEditForm((prev) => ({ ...prev, fullname: e.target.value }))} />
                          </div>
                          <div>
                            <div style={editLabelStyle}>Số điện thoại</div>
                            <input className="form-control" style={editInputStyle} placeholder="Nhập số điện thoại" value={editForm.phone} onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))} />
                          </div>
                          <div>
                            <div style={editLabelStyle}>Email</div>
                            <input className="form-control" style={editInputStyle} placeholder="Nhập email" value={editForm.email} onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))} />
                          </div>
                          {(u.roles || []).includes('ROLE_OWNER') && (
                            <>
                              <div>
                                <div style={editLabelStyle}>Ngân hàng</div>
                                <input className="form-control" style={editInputStyle} placeholder="Nhập tên ngân hàng" value={editForm.bankName} onChange={(e) => setEditForm((prev) => ({ ...prev, bankName: e.target.value }))} />
                              </div>
                              <div>
                                <div style={editLabelStyle}>Số tài khoản</div>
                                <input className="form-control" style={editInputStyle} placeholder="Nhập số tài khoản" value={editForm.bankAccountNumber} onChange={(e) => setEditForm((prev) => ({ ...prev, bankAccountNumber: e.target.value }))} />
                              </div>
                              <div>
                                <div style={editLabelStyle}>Chủ tài khoản</div>
                                <input className="form-control" style={editInputStyle} placeholder="Nhập tên chủ tài khoản" value={editForm.bankAccountName} onChange={(e) => setEditForm((prev) => ({ ...prev, bankAccountName: e.target.value }))} />
                              </div>
                            </>
                          )}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', marginTop: '2px' }}>
                            <button className="btn btn-success btn-sm" style={actionBtnStyle} onClick={() => handleSaveEdit(u)} disabled={editSaving}>{editSaving ? 'Đang lưu...' : 'Lưu'}</button>
                            <button className="btn btn-secondary btn-sm" style={actionBtnStyle} onClick={cancelEdit} disabled={editSaving}>Hủy</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', alignItems: 'stretch' }}>
                          {(() => {
                            const roles = u.roles || [];
                            const hasOwnerRole = roles.includes('ROLE_OWNER');
                            const hasAdminRole = roles.includes('ROLE_ADMIN');

                            return (
                              <>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleOwnerAction(u)}
                                  disabled={updatingUserId === u.id}
                                  style={actionBtnStyle}
                                >
                                  {hasOwnerRole ? 'Gỡ quyền Chủ sân' : 'Cấp quyền Chủ sân'}
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => toggleRole(u, 'ROLE_ADMIN')}
                                  disabled={updatingUserId === u.id}
                                  style={actionBtnStyle}
                                >
                                  {hasAdminRole ? 'Gỡ quyền Quản trị' : 'Cấp quyền Quản trị'}
                                </button>
                                <button className="btn btn-primary btn-sm" onClick={() => startEdit(u)} style={actionBtnStyle}>Chỉnh sửa</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u)} disabled={updatingUserId === u.id} style={actionBtnStyle}>Xóa người dùng</button>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManage;
