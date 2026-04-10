import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ComingSoon from '../../components/common/ComingSoon';
import VenueController from '../../controllers/VenueController';
import ReviewController from '../../controllers/ReviewController';
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
  const [venue, setVenue] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [venueData, reviewData] = await Promise.all([
          VenueController.getById(id),
          ReviewController.getByVenue(id),
        ]);
        if (isMounted) {
          setVenue(venueData);
          setReviews(reviewData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Không thể tải dữ liệu sân');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const addressText = useMemo(() => {
    if (!venue?.address) return '';
    const { detailAddress, district, provinceOrCity, street, city } = venue.address;
    return [detailAddress || street, district, provinceOrCity || city].filter(Boolean).join(', ');
  }, [venue]);

  const ratingText = useMemo(() => {
    if (!venue) return '0.0';
    if (venue.rating && venue.reviewCount) return venue.rating.toFixed(1);
    if (!reviews.length) return '0.0';
    const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [venue, reviews]);

  const reviewCount = venue?.reviewCount ?? reviews.length;

  if (loading) {
    return <div className="card"><div className="card-body">Đang tải dữ liệu...</div></div>;
  }

  if (error) {
    return <div className="card"><div className="card-body">{error}</div></div>;
  }

  if (!venue) {
    return <div className="card"><div className="card-body">Không tìm thấy sân.</div></div>;
  }

  return (
    <div>
      <PageHeader
        title={venue.name}
        subtitle={addressText ? `📍 ${addressText}` : '📍 Chưa có địa chỉ'}
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
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>{venue.description || 'Chưa có mô tả'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Giờ mở cửa</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                🕐 {venue.openTime || '--:--'} – {venue.closeTime || '--:--'}
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

      {/* Reviews Section */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">Đánh giá ({reviewCount})</h3>
          <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>⭐ {ratingText}</span>
        </div>
        <div className="card-body">
          {reviews.length === 0 ? (
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Chưa có đánh giá nào.</p>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '14px' }}>{review.authorName || 'Người dùng'}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>
                  <div style={{ marginTop: '6px', color: '#f59e0b', fontWeight: '600', fontSize: '13px' }}>
                    {'⭐'.repeat(review.rating || 0)}
                    <span style={{ marginLeft: '6px', color: 'var(--text-secondary)' }}>{review.rating || 0}/5</span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--text-primary)' }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VenueDetail;
