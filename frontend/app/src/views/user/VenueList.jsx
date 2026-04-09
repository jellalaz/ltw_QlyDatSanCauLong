import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import VenueController from '../../controllers/VenueController';
import '../../styles/Layout.css';

/**
 * VenueList - Trang danh sách & tìm sân cầu lông (USER)
 */
function VenueList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatAddress = (address) => {
    if (!address) return 'Chưa cập nhật địa chỉ';
    const parts = [address.detailAddress, address.district, address.provinceOrCity].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Chưa cập nhật địa chỉ';
  };

  useEffect(() => {
    let isActive = true;
    const keyword = search.trim();

    const loadVenues = async () => {
      try {
        setLoading(true);
        setError('');
        const data = keyword
          ? await VenueController.search(keyword)
          : await VenueController.getAll();
        if (isActive) {
          setVenues(data);
        }
      } catch {
        if (isActive) {
          setVenues([]);
          setError('Không thể tải danh sách sân. Vui lòng đăng nhập hoặc thử lại.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(loadVenues, keyword ? 400 : 0);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [search]);

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
        {venues.map((venue) => (
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
            {venue.imageUrl ? (
              <img
                src={venue.imageUrl}
                alt={venue.name}
                style={{ height: '160px', width: '100%', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
              />
            ) : (
              <div style={{ height: '160px', background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                🏸
              </div>
            )}
            <div className="card-body">
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {venue.name}
              </h3>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                📍 {formatAddress(venue.address)}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '600' }}>
                  {venue.reviewCount > 0
                    ? `⭐ ${Number(venue.rating).toFixed(1)} (${venue.reviewCount} đánh giá)`
                    : 'Chưa có đánh giá'}
                </span>
                <span className="badge badge-success">Còn sân</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <p className="empty-title">Đang tải danh sách sân...</p>
        </div>
      )}

      {!loading && error && (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <p className="empty-title">{error}</p>
        </div>
      )}

      {!loading && !error && venues.length === 0 && (
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
