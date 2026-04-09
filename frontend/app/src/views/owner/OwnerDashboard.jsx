import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import BookingService from '../../services/BookingService';
import '../../styles/Layout.css';

/**
 * OwnerDashboard - Trang tổng quan của Chủ sân
 * Hiển thị báo cáo tổng quan + khối xử lý đơn chờ duyệt biên lai
 */
function OwnerDashboard() {
  const { user } = useOutletContext() || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingBookings, setPendingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [pendingRes, allRes] = await Promise.all([
        BookingService.getPendingBookingsForOwner(),
        BookingService.getAllBookingsForOwner(),
      ]);

      setPendingBookings(pendingRes?.data?.data || []);
      setAllBookings(allRes?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Không thể tải dashboard owner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const result = {
      total: allBookings.length,
      paymentUploaded: 0,
      confirmed: 0,
      rejected: 0,
      completed: 0,
    };

    allBookings.forEach((booking) => {
      if (booking.status === 'PAYMENT_UPLOADED') result.paymentUploaded += 1;
      if (booking.status === 'CONFIRMED') result.confirmed += 1;
      if (booking.status === 'REJECTED') result.rejected += 1;
      if (booking.status === 'COMPLETED') result.completed += 1;
    });

    return result;
  }, [allBookings]);

  const statCards = [
    { icon: '📊', label: 'Tổng đơn', value: stats.total, color: 'stat-icon-blue' },
    { icon: '🧾', label: 'Đơn chờ duyệt biên lai', value: stats.paymentUploaded, color: 'stat-icon-yellow' },
    { icon: '✅', label: 'Đơn đã xác nhận', value: stats.confirmed, color: 'stat-icon-green' },
    { icon: '❌', label: 'Đơn đã từ chối', value: stats.rejected, color: 'stat-icon-purple' },
  ];

  const quickPending = pendingBookings.slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Xin chào, {user?.fullname?.split(' ').pop() || 'Chủ Sân'} 👋
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
          Đây là tổng quan hoạt động cơ sở của bạn hôm nay
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: '16px' }} className="badge badge-danger">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{loading ? '...' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Đơn chờ xử lý ngay</h3>
          <Link to="/owner/bookings" className="btn btn-primary btn-sm">
            Mở trang xử lý đơn
          </Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '20px' }}>Đang tải dữ liệu...</div>
          ) : quickPending.length === 0 ? (
            <div style={{ padding: '20px' }}>Hiện không có đơn nào cần duyệt.</div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách</th>
                    <th>Cụm sân</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {quickPending.map((booking) => (
                    <tr key={booking.id}>
                      <td>#{booking.id}</td>
                      <td>{booking.userName || '-'}</td>
                      <td>{booking.venuesName || '-'}</td>
                      <td>{(booking.totalPrice || 0).toLocaleString('vi-VN')}đ</td>
                      <td><span className="badge badge-warning">{booking.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;
