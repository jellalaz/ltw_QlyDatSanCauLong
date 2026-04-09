import PageHeader from '../../components/common/PageHeader';
import '../../styles/Layout.css';

/**
 * Notifications - Trang thông báo của người dùng (USER & OWNER)
 * TODO: Gọi NotificationService.getAll() và markAsRead()
 */
function Notifications() {
  // TODO: Replace với API call
  const mockNotifications = [
    { id: 1, title: 'Đơn đặt sân được duyệt', message: 'Đơn đặt sân tại CLB Phú Nhuận ngày 20/11 đã được chủ sân phê duyệt.', isRead: false, createdAt: '2024-11-19 09:00' },
    { id: 2, title: 'Nhắc lịch chơi sân', message: 'Bạn có lịch đặt sân vào lúc 08:00 ngày mai. Đừng quên nhé!', isRead: false, createdAt: '2024-11-19 07:00' },
    { id: 3, title: 'Đánh giá của bạn được ghi nhận', message: 'Cảm ơn bạn đã để lại đánh giá cho Sân Tân Bình.', isRead: true, createdAt: '2024-11-10 15:30' },
  ];

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="🔔 Thông Báo"
        subtitle={`Bạn có ${unreadCount} thông báo chưa đọc`}
        actions={
          unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm">
              ✓ Đánh dấu tất cả đã đọc {/* TODO: NotificationService.markAllAsRead() */}
            </button>
          )
        }
      />

      <div className="card">
        {mockNotifications.map((n) => (
          <div
            key={n.id}
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              background: n.isRead ? 'transparent' : 'var(--primary-bg)',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ fontSize: '24px', flexShrink: 0 }}>
              {n.isRead ? '🔔' : '🔴'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: n.isRead ? '500' : '700', color: 'var(--text-primary)' }}>
                  {n.title}
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{n.createdAt}</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{n.message}</p>
            </div>
          </div>
        ))}

        {mockNotifications.length === 0 && (
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
