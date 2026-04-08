import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import '../../styles/Layout.css';

/**
 * VenueList - Trang danh sách & tìm sân cầu lông (USER)
 * TODO: Gọi VenueController.getAll() và VenueController.search()
 */
function VenueList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // TODO: Dữ liệu mock tạm thời để hiển thị layout
  const mockVenues = [
    { id: 1, name: 'CLB Cầu Lông Phú Nhuận', address: { city: 'TP.HCM', district: 'Phú Nhuận' }, rating: 4.5, reviewCount: 120, status: 'ACTIVE' },
    { id: 2, name: 'Sân Cầu Lông Tân Bình', address: { city: 'TP.HCM', district: 'Tân Bình' }, rating: 4.2, reviewCount: 85, status: 'ACTIVE' },
    { id: 3, name: 'Nhà Thi Đấu Quận 3', address: { city: 'TP.HCM', district: 'Quận 3' }, rating: 4.7, reviewCount: 210, status: 'ACTIVE' },
  ];

  const filtered = mockVenues.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="🏟️ Tìm Sân Cầu Lông"
        subtitle="Tìm kiếm và đặt sân phù hợp với bạn"
      />

      {/* Search Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div className="search-bar">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên sân, địa chỉ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Venue Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filtered.map((venue) => (
          <div
            key={venue.id}
            className="card"
            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={() => navigate(`/venues/${venue.id}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            {/* Thumbnail placeholder */}
            <div style={{ height: '160px', background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
              🏸
            </div>
            <div className="card-body">
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {venue.name}
              </h3>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                📍 {venue.address.district}, {venue.address.city}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '600' }}>
                  ⭐ {venue.rating} ({venue.reviewCount} đánh giá)
                </span>
                <span className="badge badge-success">Còn sân</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p className="empty-title">Không tìm thấy sân phù hợp</p>
          <p className="empty-desc">Hãy thử tìm kiếm với từ khóa khác</p>
        </div>
      )}
    </div>
  );
}

export default VenueList;
