import '../../styles/Layout.css';

/**
 * AdminDashboard - Dashboard thống kê toàn hệ thống (ADMIN)
 * TODO: Gọi API thống kê Admin (chưa có backend, cần bổ sung)
 */
function AdminDashboard() {
  const stats = [
    { icon: '👥', label: 'Tổng người dùng', value: '1,284', color: 'stat-icon-blue' },
    { icon: '🏟️', label: 'Cụm sân đang hoạt động', value: '47', color: 'stat-icon-green' },
    { icon: '📅', label: 'Tổng đơn tháng này', value: '3,521', color: 'stat-icon-yellow' },
    { icon: '💰', label: 'Doanh thu hệ thống', value: '142tr', color: 'stat-icon-purple' },
  ];

  const recentActivity = [
    { id: 1, type: '🆕 Đăng ký', desc: 'Người dùng mới: Nguyễn Văn X đăng ký tài khoản', time: '5 phút trước' },
    { id: 2, type: '🏟️ Cụm sân', desc: 'Chủ sân: Trần Văn Y tạo cụm sân mới "CLB Bình Thạnh" - Chờ duyệt', time: '12 phút trước' },
    { id: 3, type: '📅 Booking', desc: '87 đơn đặt sân mới trong 1 giờ qua', time: '1 giờ trước' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Admin Dashboard 📊
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
          Tổng quan hoạt động toàn hệ thống
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

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Hoạt động gần đây</h3>
          <span className="badge badge-info">Live</span>
        </div>
        {recentActivity.map((a) => (
          <div key={a.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{a.type.split(' ')[0]}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>{a.desc}</p>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
