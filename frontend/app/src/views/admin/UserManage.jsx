import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import '../../styles/Layout.css';

/**
 * UserManage - Quản lý người dùng toàn hệ thống (ADMIN)
 * TODO:
 *   - Gọi API lấy toàn bộ user (cần bổ sung backend AdminController)
 *   - Implement: Khóa tài khoản, đổi role USER → OWNER
 */
function UserManage() {
  const [search, setSearch] = useState('');

  const mockUsers = [
    { id: 1, fullname: 'Nguyễn Văn A', phone: '0901234567', email: 'a@email.com', roles: ['ROLE_USER'], status: 'ACTIVE' },
    { id: 2, fullname: 'Trần Thị B', phone: '0912345678', email: 'b@email.com', roles: ['ROLE_OWNER', 'ROLE_USER'], status: 'ACTIVE' },
    { id: 3, fullname: 'Lê Văn C', phone: '0923456789', email: 'c@email.com', roles: ['ROLE_USER'], status: 'BANNED' },
  ];

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

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Liên hệ</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: '600' }}>{u.fullname}</td>
                  <td>
                    <div style={{ fontSize: '13px' }}>{u.phone}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.email}</div>
                  </td>
                  <td>{roleLabel(u.roles)}</td>
                  <td>
                    <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {u.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {!u.roles.includes('ROLE_OWNER') && (
                        <button className="btn btn-secondary btn-sm">
                          ⬆️ Lên Chủ Sân {/* TODO: API đổi role */}
                        </button>
                      )}
                      {u.status === 'ACTIVE' ? (
                        <button className="btn btn-danger btn-sm">🔒 Khóa</button>
                      ) : (
                        <button className="btn btn-success btn-sm">🔓 Mở khóa</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManage;
