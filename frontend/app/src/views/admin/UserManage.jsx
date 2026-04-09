import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import AdminService from '../../services/AdminService';
import '../../styles/Layout.css';

/**
 * UserManage - Quản lý người dùng toàn hệ thống (ADMIN)
 * Dùng API admin/users + admin/users/{id}/roles
 */
function UserManage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);

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
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((u) =>
      [u.fullname, u.phone, u.email].some((field) =>
        String(field || '').toLowerCase().includes(keyword)
      )
    );
  }, [users, search]);

  const setRoles = async (user, nextRoles) => {
    try {
      setUpdatingUserId(user.id);
      await AdminService.updateUserRoles(user.id, nextRoles);
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
      />

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
            <table className="table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Liên hệ</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: '600' }}>{u.fullname}</td>
                    <td>
                      <div style={{ fontSize: '13px' }}>{u.phone}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.email}</div>
                    </td>
                    <td>{roleLabel(u.roles || [])}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleRole(u, 'ROLE_OWNER')}
                          disabled={updatingUserId === u.id}
                        >
                          Toggle OWNER
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => toggleRole(u, 'ROLE_ADMIN')}
                          disabled={updatingUserId === u.id}
                        >
                          Toggle ADMIN
                        </button>
                      </div>
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
