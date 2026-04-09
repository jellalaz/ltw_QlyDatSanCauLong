import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import '../styles/Layout.css';

/**
 * Home - Trang chủ sau khi đăng nhập, điều hướng theo role
 * Hiển thị menu quick-access phù hợp với từng role
 */
function Home() {
  const navigate = useNavigate();
  const ctx = useOutletContext() || {};
  const user = ctx.user;

  const isOwner = user?.roles?.includes('ROLE_OWNER');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const userCards = [
    { icon: '🏟️', title: 'Tìm Sân', desc: 'Tìm kiếm và xem danh sách sân cầu lông gần bạn', path: '/venues', color: '#4f46e5' },
    { icon: '📅', title: 'Lịch Đặt Sân', desc: 'Xem và quản lý các lịch đặt sân của bạn', path: '/bookings', color: '#0ea5e9' },
    { icon: '🔔', title: 'Thông Báo', desc: 'Xem các thông báo và lời nhắc mới nhất', path: '/notifications', color: '#f59e0b' },
    { icon: '👤', title: 'Thông Tin Cá Nhân', desc: 'Xem và cập nhật thông tin tài khoản', path: '/profile', color: '#10b981' },
  ];

  const ownerCards = [
    { icon: '📊', title: 'Dashboard', desc: 'Tổng quan hoạt động cơ sở của bạn', path: '/owner', color: '#4f46e5' },
    { icon: '🏟️', title: 'Cụm Sân Của Tôi', desc: 'Quản lý các cụm sân bạn sở hữu', path: '/owner/venues', color: '#0ea5e9' },
    { icon: '📋', title: 'Đơn Đặt Sân', desc: 'Duyệt và quản lý đơn đặt từ khách', path: '/owner/bookings', color: '#f59e0b' },
  ];

  const adminCards = [
    { icon: '⚙️', title: 'Admin Dashboard', desc: 'Thống kê và giám sát toàn hệ thống', path: '/admin', color: '#ef4444' },
    { icon: '👥', title: 'Quản Lý User', desc: 'Quản lý tất cả tài khoản người dùng', path: '/admin/users', color: '#8b5cf6' },
    { icon: '🏟️', title: 'Kiểm Duyệt Sân', desc: 'Duyệt và kiểm soát các cụm sân', path: '/admin/venues', color: '#0ea5e9' },
  ];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Xin chào, {user?.fullname || 'Bạn'} 👋
        </h1>
        <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)' }}>
          Hôm nay bạn muốn làm gì?
        </p>
      </div>

      {/* User Functions */}
      <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
        🎯 Chức năng người dùng
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {userCards.map((c) => (
          <div
            key={c.path}
            className="card"
            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', padding: '20px' }}
            onClick={() => navigate(c.path)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: c.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '14px' }}>
              {c.icon}
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{c.title}</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Owner Functions */}
      {isOwner && (
        <>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
            🏪 Khu vực Chủ Sân
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {ownerCards.map((c) => (
              <div
                key={c.path}
                className="card"
                style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', padding: '20px', borderLeft: `4px solid ${c.color}` }}
                onClick={() => navigate(c.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: c.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '14px' }}>
                  {c.icon}
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{c.title}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Admin Functions */}
      {isAdmin && (
        <>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
            ⚙️ Khu vực Quản Trị
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {adminCards.map((c) => (
              <div
                key={c.path}
                className="card"
                style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', padding: '20px', borderLeft: `4px solid ${c.color}` }}
                onClick={() => navigate(c.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: c.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '14px' }}>
                  {c.icon}
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{c.title}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
