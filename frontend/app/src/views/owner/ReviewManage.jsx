import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ReviewController from '../../controllers/ReviewController';
import '../../styles/Layout.css';

function ReviewManage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);
  const replyActionBtnStyle = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    boxSizing: 'border-box',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  };

  const hasOwnerReply = (review) => !!String(review?.ownerReply || '').trim();

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await ReviewController.getOwnerReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách đánh giá.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const sortedReviews = useMemo(
    () => [...reviews].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [reviews],
  );

  const formatDateOnly = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('vi-VN');
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('vi-VN');
  };

  const handleSubmitReply = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      setSaving(true);
      const updated = await ReviewController.reply(reviewId, replyText.trim());
      setReviews((prev) => prev.map((item) => (item.id === reviewId
        ? {
          ...item,
          ...updated,
          ownerReply: String(updated?.ownerReply || replyText).trim(),
          updatedAt: updated?.updatedAt || new Date().toISOString(),
        }
        : item)));
      setReplyingId(null);
      setReplyText('');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể gửi phản hồi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="📝 Quản Lý Đánh Giá"
        subtitle="Xem và phản hồi đánh giá từ người thuê sân (mỗi đánh giá phản hồi 1 lần)"
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/owner')}>
            ← Về trang chủ chủ sân
          </button>
        }
      />

      {error && <div style={{ marginBottom: '12px' }} className="badge badge-danger">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="card-body">Đang tải đánh giá...</div>
        ) : sortedReviews.length === 0 ? (
          <div className="card-body">Chưa có đánh giá nào cho các sân của bạn.</div>
        ) : (
          <div style={{ display: 'grid', gap: '12px', padding: '16px' }}>
            {sortedReviews.map((review) => {
              const canReply = !hasOwnerReply(review);
              const isReplying = replyingId === review.id;
              return (
                <div key={review.id} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <div>
                      <strong>{review.venueName || `Venue #${review.venueId}`}</strong>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        Khách: {review.authorName || 'Người dùng'} - Booking #{review.bookingId || '-'}
                      </div>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{formatDateTime(review.createdAt)}</span>
                  </div>

                  <div style={{ marginTop: '8px', fontWeight: 600, color: '#f59e0b' }}>{'★'.repeat(review.rating || 0)}</div>
                  <p style={{ margin: '8px 0 0' }}>{review.comment || '(Không có nhận xét)'}</p>

                  {hasOwnerReply(review) ? (
                    <div style={{ marginTop: '10px', padding: '10px', borderRadius: '8px', background: '#eff6ff', borderLeft: '3px solid #3b82f6' }}>
                      <strong>Phản hồi của bạn:</strong>
                      <div style={{ marginTop: '3px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Ngày phản hồi: {formatDateOnly(review.updatedAt)}
                      </div>
                      <p style={{ margin: '4px 0 0' }}>{review.ownerReply}</p>
                    </div>
                  ) : (
                    <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
                      {isReplying ? (
                        <>
                          <textarea
                            className="form-control"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            placeholder="Nhập phản hồi cho khách..."
                            style={{ width: '100%' }}
                          />
                          <div style={{ display: 'grid', gridTemplateColumns: '140px 140px', gap: '8px', alignItems: 'center' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSubmitReply(review.id)}
                              disabled={saving}
                              style={replyActionBtnStyle}
                            >
                              {saving ? 'Đang gửi...' : 'Gửi phản hồi'}
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setReplyingId(null);
                                setReplyText('');
                              }}
                              disabled={saving}
                              style={replyActionBtnStyle}
                            >
                              Hủy
                            </button>
                          </div>
                        </>
                      ) : (
                        canReply && (
                          <button className="btn btn-primary btn-sm" onClick={() => setReplyingId(review.id)}>
                            Phản hồi
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewManage;

