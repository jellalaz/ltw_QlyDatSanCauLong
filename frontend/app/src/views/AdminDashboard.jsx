import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminService from '../services/AdminService';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, usersRes, bookingsRes] = await Promise.all([
        AdminService.getDashboardStats(),
        AdminService.getUsers(),
        AdminService.getAllBookings(),
      ]);

      setStats(statsRes?.data?.data || null);
      setUsers(usersRes?.data?.data || []);
      setBookings(bookingsRes?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Không thể tải dữ liệu admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleRole = async (user, roleName) => {
    try {
      setUpdatingUserId(user.id);
      const roleSet = new Set(user.roles || []);

      if (roleSet.has(roleName)) {
        roleSet.delete(roleName);
      } else {
        roleSet.add(roleName);
      }

      if (roleSet.size === 0) {
        roleSet.add('ROLE_USER');
      }

      await AdminService.updateUserRoles(user.id, Array.from(roleSet));
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Cập nhật quyền thất bại');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <header className="admin-dashboard-header">
        <button className="admin-btn-back" onClick={() => navigate('/home')}>
          ← Quay lại
        </button>
        <h1>Admin Dashboard</h1>
      </header>

      {loading && <div className="admin-loading">Đang tải dữ liệu...</div>}
      {error && <div className="admin-error">{error}</div>}

      {!loading && stats && (
        <>
          <section className="admin-stats-grid">
            <div className="admin-stat-card"><h3>Tổng User</h3><p>{stats.totalUsers}</p></div>
            <div className="admin-stat-card"><h3>Tổng Đơn</h3><p>{stats.totalBookings}</p></div>
            <div className="admin-stat-card"><h3>Pending Payment</h3><p>{stats.pendingPaymentBookings}</p></div>
            <div className="admin-stat-card"><h3>Chờ Owner Duyệt</h3><p>{stats.paymentUploadedBookings}</p></div>
            <div className="admin-stat-card"><h3>Confirmed</h3><p>{stats.confirmedBookings}</p></div>
            <div className="admin-stat-card"><h3>Rejected</h3><p>{stats.rejectedBookings}</p></div>
          </section>

          <section className="admin-section">
            <h2>Quản lý quyền người dùng</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>SĐT</th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.fullname}</td>
                      <td>{user.phone}</td>
                      <td>{user.email}</td>
                      <td>{(user.roles || []).join(', ')}</td>
                      <td>
                        <div className="admin-action-group">
                          <button
                            className="admin-btn-role"
                            disabled={updatingUserId === user.id}
                            onClick={() => toggleRole(user, 'ROLE_OWNER')}
                          >
                            Toggle OWNER
                          </button>
                          <button
                            className="admin-btn-role admin-btn-role-danger"
                            disabled={updatingUserId === user.id}
                            onClick={() => toggleRole(user, 'ROLE_ADMIN')}
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
          </section>

          <section className="admin-section">
            <h2>Danh sách booking toàn hệ thống</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách</th>
                    <th>Sân</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.userName}</td>
                      <td>{booking.venuesName}</td>
                      <td>{(booking.totalPrice || 0).toLocaleString('vi-VN')} VND</td>
                      <td>{booking.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
