import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ReviewController from '../../controllers/ReviewController';
import '../../styles/Layout.css';

function MyReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [saving, setSaving] = useState(false);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await ReviewController.getMyReviews();
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

  const startEdit = (review) => {
    setEditingId(review.id);
    setForm({ rating: review.rating || 5, comment: review.comment || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ rating: 5, comment: '' });
  };

  const saveEdit = async (reviewId) => {
    try {
      setSaving(true);
      const updated = await ReviewController.update(reviewId, {
        rating: Number(form.rating) || 5,
        comment: form.comment,
      });
      setReviews((prev) => prev.map((item) => (item.id === reviewId ? updated : item)));
      cancelEdit();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể cập nhật đánh giá.');
    } finally {
      setSaving(false);
    }
  };

  const removeReview = async (reviewId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await ReviewController.delete(reviewId);
      setReviews((prev) => prev.filter((item) => item.id !== reviewId));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể xóa đánh giá.');
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('vi-VN');
  };

  return (
    <div>
      <PageHeader
        title="⭐ Đánh Giá Của Tôi"
        subtitle="Xem, sửa và xóa các đánh giá bạn đã gửi"
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/bookings')}>
            ← Về lịch đặt sân
          </button>
        }
      />

      {error && <div style={{ marginBottom: '12px' }} className="badge badge-danger">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="card-body">Đang tải danh sách đánh giá...</div>
        ) : sortedReviews.length === 0 ? (
          <div className="card-body">Bạn chưa có đánh giá nào.</div>
        ) : (
          <div style={{ display: 'grid', gap: '12px', padding: '16px' }}>
            {sortedReviews.map((review) => {
              const isEditing = editingId === review.id;
              const canNavigateVenue = !isEditing && Number(review.venueId) > 0;
              return (
                <div
                  key={review.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '12px',
                    cursor: canNavigateVenue ? 'pointer' : 'default',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                  }}
                  title={canNavigateVenue ? 'Bấm để xem chi tiết sân' : ''}
                  onMouseEnter={(e) => {
                    if (!canNavigateVenue) return;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.08)';
                    e.currentTarget.style.borderColor = '#c7d2fe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                  onClick={() => {
                    if (canNavigateVenue) {
                      navigate(`/venues/${review.venueId}`);
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                    <div>
                      <strong>{review.venueName || `Venue #${review.venueId}`}</strong>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Booking #{review.bookingId || '-'} - {formatDateTime(review.createdAt)}
                      </div>
                    </div>
                    {!isEditing && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); startEdit(review); }}>Sửa</button>
                        <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); removeReview(review.id); }}>Xóa</button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Số sao</label>
                        <select
                          className="form-control"
                          value={form.rating}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                          style={{ width: '100%', marginTop: '4px' }}
                        >
                          {[1, 2, 3, 4, 5].map((value) => (
                            <option key={value} value={value}>{value} sao</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Nhận xét</label>
                        <textarea
                          className="form-control"
                          value={form.comment}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                          rows={3}
                          style={{ width: '100%', marginTop: '4px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); saveEdit(review.id); }} disabled={saving}>
                          {saving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); cancelEdit(); }} disabled={saving}>Hủy</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginTop: '8px', fontWeight: 600, color: '#f59e0b' }}>{'★'.repeat(review.rating || 0)}</div>
                      <p style={{ margin: '8px 0 0' }}>{review.comment || '(Không có nhận xét)'}</p>
                      {review.ownerReply && (
                        <div style={{ marginTop: '10px', padding: '10px', borderRadius: '8px', background: '#f8fafc', borderLeft: '3px solid #4f46e5' }}>
                          <strong>Phản hồi từ chủ sân:</strong>
                          <p style={{ margin: '4px 0 0' }}>{review.ownerReply}</p>
                        </div>
                      )}
                    </>
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

export default MyReviews;

