import { useState, useEffect } from 'react';
import ReviewService from '../services/ReviewService';

const STAR_LABELS = ['', 'Tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Tuyệt vời!'];

function ReviewModal({ booking, onClose, onReviewed }) {
  const [rating,   setRating]   = useState(0);
  const [hovered,  setHovered]  = useState(0);
  const [comment,  setComment]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [checking, setChecking] = useState(true);
  const [existing, setExisting] = useState(null); // ReviewDTO nếu đã review
  const [error,    setError]    = useState('');

  useEffect(() => {
    ReviewService.getByBooking(booking.id)
      .then(res => {
        // Controller trả về ApiResponse { success, data: ReviewDTO }
        const review = res.data?.data;
        if (review) setExisting(review);
      })
      .catch(() => {}) // 404 ResourceNotFoundException = chưa có review, bình thường
      .finally(() => setChecking(false));
  }, [booking.id]);

  const handleSubmit = async () => {
    if (rating === 0) { setError('Vui lòng chọn số sao'); return; }
    setLoading(true);
    setError('');
    try {
      await ReviewService.create(booking.id, { rating, comment });
      onReviewed?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra, thử lại nhé!';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const display = hovered || rating;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '16px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '24px',
        width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>⭐ Đánh giá sân</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '24px',
            cursor: 'pointer', color: '#999', lineHeight: 1
          }}>×</button>
        </div>

        {/* Venue info */}
        <div style={{
          background: '#f8f9fa', borderRadius: '10px',
          padding: '12px 16px', marginBottom: '20px'
        }}>
          <div style={{ fontWeight: 600, color: '#333' }}>{booking.venueName}</div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
            {booking.courtName}&nbsp;·&nbsp;{booking.bookingDate}
          </div>
        </div>

        {checking ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            Đang kiểm tra...
          </div>

        ) : existing ? (
          /* ── Đã review rồi: chỉ hiển thị ── */
          <div>
            <div style={{ color: '#16a34a', fontWeight: 600, marginBottom: '12px' }}>
              ✅ Bạn đã đánh giá đơn này
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
              {[1,2,3,4,5].map(s => (
                <span key={s} style={{
                  fontSize: '28px',
                  color: s <= existing.rating ? '#f59e0b' : '#d1d5db'
                }}>★</span>
              ))}
              <span style={{ marginLeft: '8px', color: '#666', fontSize: '14px' }}>
                {STAR_LABELS[existing.rating]}
              </span>
            </div>
            {existing.comment && (
              <p style={{ color: '#555', fontStyle: 'italic', fontSize: '14px', margin: '0 0 16px' }}>
                "{existing.comment}"
              </p>
            )}
            <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%' }}>
              Đóng
            </button>
          </div>

        ) : (
          /* ── Chưa review: hiện form ── */
          <div>
            {/* Chọn sao */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: '8px' }}>
                Chọn số sao:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(s)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '36px', padding: '0 2px',
                      color: s <= display ? '#f59e0b' : '#d1d5db',
                      transform: s <= display ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.1s'
                    }}
                  >★</button>
                ))}
                {rating > 0 && (
                  <span style={{ marginLeft: '8px', fontSize: '13px', color: '#888' }}>
                    {STAR_LABELS[rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Nhận xét */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: '8px' }}>
                Nhận xét (tuỳ chọn):
              </div>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sân..."
                maxLength={1000}
                rows={3}
                style={{
                  width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0',
                  padding: '10px 12px', fontSize: '14px', resize: 'vertical',
                  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
                }}
              />
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#aaa' }}>
                {comment.length}/1000
              </div>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', color: '#dc2626', borderRadius: '8px',
                padding: '8px 12px', fontSize: '14px', marginBottom: '12px'
              }}>{error}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'stretch' }}>
              <button className="btn btn-secondary" onClick={onClose}
                style={{ width: '100%', height: '44px', boxSizing: 'border-box', margin: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} disabled={loading}>
                Huỷ
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}
                style={{ width: '100%', height: '44px', boxSizing: 'border-box', margin: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewModal;