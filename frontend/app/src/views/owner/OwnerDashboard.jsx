import { useOutletContext } from 'react-router-dom';
import '../../styles/Layout.css';

/**
 * OwnerDashboard - Trang tổng quan của Chủ sân
 * TODO: Lấy thống kê từ API (tổng booking, doanh thu tháng, sân đang hoạt động...)
 */
function OwnerDashboard() {
  const { user } = useOutletContext() || {};

  // TODO: Replace bằng dữ liệu thật từ API
  const stats = [
    { icon: '🏟️', label: 'Cụm sân của tôi', value: '3', color: 'stat-icon-blue' },
    { icon: '📅', label: 'Đơn chờ duyệt', value: '12', color: 'stat-icon-yellow' },
    { icon: '✅', label: 'Đơn hoàn thành tháng này', value: '87', color: 'stat-icon-green' },
    { icon: '💰', label: 'Doanh thu tháng', value: '8.4tr', color: 'stat-icon-purple' },
  ];

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

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Hành động nhanh</h3>
        </div>
        <div className="card-body" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/owner/venues/new" className="btn btn-primary">+ Thêm cụm sân mới</a>
          <a href="/owner/bookings" className="btn btn-secondary">📋 Xem đơn đặt sân</a>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;
