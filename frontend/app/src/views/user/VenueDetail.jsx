import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ComingSoon from '../../components/common/ComingSoon';
import '../../styles/Layout.css';

/**
 * VenueDetail - Trang chi tiết 1 cụm sân (USER)
 * TODO: 
 *   - Gọi VenueController.getById(id) để lấy thông tin cụm sân
 *   - Gọi CourtController.getByVenue(id) để lấy danh sách sân lẻ
 *   - Hiển thị CourtList + Lịch trống + Reviews
 */
function VenueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // TODO: Replace với API call
  const mockVenue = {
    id,
    name: 'CLB Cầu Lông Phú Nhuận',
    description: 'Cụm sân cầu lông hiện đại, thoáng mát, phục vụ 24/7.',
    address: { street: '123 Đường Nguyễn Văn Trỗi', district: 'Phú Nhuận', city: 'TP.HCM' },
    openTime: '06:00',
    closeTime: '23:00',
    rating: 4.5,
    reviewCount: 120,
  };

  return (
    <div>
      <PageHeader
        title={mockVenue.name}
        subtitle={`📍 ${mockVenue.address.street}, ${mockVenue.address.district}`}
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/venues')}>
            ← Quay lại
          </button>
        }
      />

      {/* Info Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Mô tả</p>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>{mockVenue.description}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Giờ mở cửa</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                🕐 {mockVenue.openTime} – {mockVenue.closeTime}
              </p>
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => navigate(`/bookings/new?venueId=${id}`)}>
              📅 Đặt sân ngay
            </button>
          </div>
        </div>
      </div>

      {/* Courts Section - TODO: Dev 3 sẽ implement */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Danh sách sân</h3>
        </div>
        <ComingSoon title="Danh sách sân lẻ" subtitle="Dev 3 sẽ implement CourtList + Lịch trống tại đây" icon="🏸" />
      </div>

      {/* Reviews Section - TODO: Dev 5 sẽ implement */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Đánh giá ({mockVenue.reviewCount})</h3>
          <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>⭐ {mockVenue.rating}</span>
        </div>
        <ComingSoon title="Phần đánh giá" subtitle="Dev 5 sẽ implement ReviewSection tại đây" icon="⭐" />
      </div>
    </div>
  );
}

export default VenueDetail;
