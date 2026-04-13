import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import NotificationService from '../../services/NotificationService';
import '../../styles/Layout.css';

/**
 * Notifications - Trang thông báo của người dùng (USER & OWNER)
 * TODO: Gọi NotificationService.getAll() và markAsRead()
 */
function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await NotificationService.getAll();
      const data = res?.data?.data || res?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải thông báo.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const notifyBadgeRefresh = () => {
    window.dispatchEvent(new Event('notifications:updated'));
  };

  const handleMarkOne = async (id, isRead) => {
    if (isRead) return;
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
      notifyBadgeRefresh();
    } catch {
      // Ignore single-mark failures to keep UX smooth.
    }
  };

  const resolveTarget = (item) => {
    if (item?.targetPath) return item.targetPath;
    if (item?.bookingId) return `/bookings/${item.bookingId}/payment`;
    return '/notifications';
  };

  const handleOpenNotification = async (item) => {
    await handleMarkOne(item.id, item.isRead);
    navigate(resolveTarget(item));
  };

  const handleMarkAll = async () => {
    try {
      setMarkingAll(true);
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      notifyBadgeRefresh();
    } finally {
      setMarkingAll(false);
    }
  };

  const formatTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('vi-VN');
  };

  return (
    <div>
      <PageHeader
        title="🔔 Thông Báo"
        subtitle={`Bạn có ${unreadCount} thông báo chưa đọc`}
        actions={
          unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleMarkAll} disabled={markingAll}>
              {markingAll ? 'Đang cập nhật...' : '✓ Đánh dấu tất cả đã đọc'}
            </button>
          )
        }
      />

      {error && <p style={{ margin: '0 0 12px', color: '#dc2626' }}>{error}</p>}

      <div className="card">
        {loading && (
          <div style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>Đang tải thông báo...</div>
        )}

        {!loading && notifications.map((n) => (
          <div
            key={n.id}
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              background: n.isRead ? 'transparent' : 'var(--primary-bg)',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
              cursor: n.isRead ? 'default' : 'pointer',
              transition: 'background 0.15s',
            }}
            onClick={() => handleOpenNotification(n)}
          >
            <div style={{ fontSize: '24px', flexShrink: 0 }}>
              {n.isRead ? '🔔' : '🔴'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: n.isRead ? '500' : '700', color: 'var(--text-primary)' }}>
                  {n.title}
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatTime(n.createdAt)}</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{n.message}</p>
            </div>
          </div>
        ))}

        {!loading && notifications.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <p className="empty-title">Chưa có thông báo nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
