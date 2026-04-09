import { useEffect, useState } from 'react';
import AdminService from '../../services/AdminService';
import '../../styles/Layout.css';

/**
 * AdminDashboard - Dashboard thống kê toàn hệ thống (ADMIN)
 * Dùng API /api/admin/stats
 */
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await AdminService.getDashboardStats();
        setStats(response?.data?.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Không thể tải thống kê admin');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const cards = [
    { icon: '👥', label: 'Tổng người dùng', value: stats?.totalUsers ?? 0, color: 'stat-icon-blue' },
    { icon: '📅', label: 'Tổng booking', value: stats?.totalBookings ?? 0, color: 'stat-icon-green' },
    { icon: '🧾', label: 'Chờ thanh toán', value: stats?.pendingPaymentBookings ?? 0, color: 'stat-icon-yellow' },
    { icon: '📤', label: 'Chờ owner duyệt', value: stats?.paymentUploadedBookings ?? 0, color: 'stat-icon-purple' },
    { icon: '✅', label: 'Đã xác nhận', value: stats?.confirmedBookings ?? 0, color: 'stat-icon-green' },
    { icon: '❌', label: 'Đã từ chối', value: stats?.rejectedBookings ?? 0, color: 'stat-icon-yellow' },
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

      {error && (
        <div style={{ marginBottom: '12px' }} className="badge badge-danger">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {cards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{loading ? '...' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
