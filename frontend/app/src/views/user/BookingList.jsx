import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import BookingController from '../../controllers/BookingController';
import ReviewController from '../../controllers/ReviewController';
import ReviewModal from '../../components/ReviewModal';
import '../../styles/Layout.css';

const extractCourtNumber = (item) => {
  const directNumber = Number(item?.courtNumber ?? item?.courtNo ?? item?.court_index ?? 0);
  if (Number.isInteger(directNumber) && directNumber > 0) return directNumber;
  const name = String(item?.courtName || '').trim();
  const matched = name.match(/\d+/);
  if (matched) return Number(matched[0]);
  const fromId = Number(item?.courtId ?? 0);
  if (Number.isInteger(fromId) && fromId > 0) return fromId;
  return null;
};

const getCourtDisplayName = (item, fallbackIndex) => {
  const number = extractCourtNumber(item);
  return number ? `Sân số ${number}` : `Sân ${fallbackIndex}`;
};

const getBookingCourtDisplay = (booking) => {
  const items = Array.isArray(booking?.bookingItems) && booking.bookingItems.length > 0
    ? booking.bookingItems : [booking];
  const labels = [...new Set(items.map((item, index) => getCourtDisplayName(item, index + 1)))];
  return labels.length > 0 ? labels.join(', ') : '-';
};

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (Array.isArray(value)) {
    const [y = 0, m = 1, d = 1, hh = 0, mm = 0, ss = 0] = value.map((part) => Number(part) || 0);
    if (y <= 0) return null;
    return new Date(y, Math.max(0, m - 1), d, hh, mm, ss);
  }
  if (typeof value === 'object') {
    const y = Number(value.year ?? 0);
    const m = Number(value.monthValue ?? value.month ?? 1);
    const d = Number(value.dayOfMonth ?? value.day ?? 1);
    const hh = Number(value.hour ?? 0);
    const mm = Number(value.minute ?? 0);
    const ss = Number(value.second ?? 0);
    if (y <= 0) return null;
    return new Date(y, Math.max(0, m - 1), d, hh, mm, ss);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toDateKey = (value) => {
  if (typeof value === 'string') {
    const matched = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (matched) return matched[1];
  }
  const date = toDate(value);
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getBookingStartTime = (booking) => {
  if (booking?.startTime) return booking.startTime;
  if (Array.isArray(booking?.bookingItems) && booking.bookingItems.length > 0)
    return booking.bookingItems[0]?.startTime || null;
  return null;
};

const getBookingEndTime = (booking) => {
  if (booking?.endTime) return booking.endTime;
  if (Array.isArray(booking?.bookingItems) && booking.bookingItems.length > 0)
    return booking.bookingItems[0]?.endTime || null;
  return null;
};

function BookingList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());

  const statusMap = {
    PENDING_PAYMENT:  { label: 'Chờ thanh toán',    cls: 'badge-warning' },
    PAYMENT_UPLOADED: { label: 'Chờ chủ sân duyệt', cls: 'badge-info'    },
    CONFIRMED:        { label: 'Đã xác nhận',        cls: 'badge-success' },
    COMPLETED:        { label: 'Phê duyệt',           cls: 'badge-success' },
    CANCELLED:        { label: 'Đã hủy',             cls: 'badge-danger'  },
    REJECTED:         { label: 'Từ chối',            cls: 'badge-danger'  },
    EXPIRED:          { label: 'Hết hạn',            cls: 'badge-default' },
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await BookingController.getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách đơn đặt sân.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReviewedBookingIds = async () => {
    try {
      const reviews = await ReviewController.getMyReviews();
      const bookingIds = (Array.isArray(reviews) ? reviews : [])
        .map((review) => Number(review?.bookingId))
        .filter((id) => Number.isInteger(id) && id > 0);
      setReviewedIds(new Set(bookingIds));
    } catch {
      // Keep UI usable even if review lookup fails.
      setReviewedIds(new Set());
    }
  };

  useEffect(() => {
    loadBookings();
    loadReviewedBookingIds();
  }, []);

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.startTime || 0) - new Date(a.startTime || 0)),
    [bookings],
  );

  const formatDateTime = (value) => {
    const date = toDate(value);
    return date ? date.toLocaleString('vi-VN') : '-';
  };

  const todayKey = toDateKey(new Date());

  const filteredBookings = useMemo(() => {
    if (filterMode === 'today') {
      const currentDateKey = toDateKey(new Date());
      return sortedBookings.filter((booking) => toDateKey(getBookingStartTime(booking)) === currentDateKey);
    }
    if (filterMode === 'date') {
      if (!selectedDate) return sortedBookings;
      return sortedBookings.filter((booking) => toDateKey(getBookingStartTime(booking)) === selectedDate);
    }
    return sortedBookings;
  }, [filterMode, selectedDate, sortedBookings]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đơn này?')) return;
    try {
      setWorkingId(bookingId);
      await BookingController.cancel(bookingId);
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể hủy đơn.');
    } finally {
      setWorkingId(null);
    }
  };

  const handleOpenReview = (e, b) => {
    e.stopPropagation();
    const startRaw = getBookingStartTime(b);
    setReviewTarget({
      id:          b.id,
      venueName:   b.venueName || '—',
      courtName:   getBookingCourtDisplay(b),
      bookingDate: startRaw ? toDateKey(startRaw) : '—',
    });
  };

  return (
    <div>
      <PageHeader
        title="📅 Lịch Đặt Sân Của Tôi"
        subtitle="Quản lý và theo dõi các lịch đặt sân đã tạo"
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/my-reviews')}>
            ⭐ Đánh giá của tôi
          </button>
        }
      />

      <div className="card" style={{ marginBottom: '12px' }}>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px', alignItems: 'center' }}>
          <button type="button" className="btn btn-sm"
            style={{ background: filterMode === 'all' ? '#4f46e5' : '#e2e8f0', color: filterMode === 'all' ? '#fff' : '#1e293b', border: '1px solid #cbd5e1' }}
            onClick={() => setFilterMode('all')}>
            Tất cả
          </button>
          <button type="button" className="btn btn-sm"
            style={{ background: filterMode === 'today' ? '#4f46e5' : '#e2e8f0', color: filterMode === 'today' ? '#fff' : '#1e293b', border: '1px solid #cbd5e1' }}
            onClick={() => { setSelectedDate(toDateKey(new Date())); setFilterMode('today'); }}>
            Hôm nay
          </button>
          <button type="button" className="btn btn-sm"
            style={{ background: filterMode === 'date' ? '#4f46e5' : '#e2e8f0', color: filterMode === 'date' ? '#fff' : '#1e293b', border: '1px solid #cbd5e1' }}
            onClick={() => { if (!selectedDate) setSelectedDate(todayKey); setFilterMode('date'); }}>
            Lọc theo ngày
          </button>
          <input type="date" value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setFilterMode('date'); }}
            disabled={filterMode !== 'date'}
            style={{ height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 10px', background: filterMode === 'date' ? '#fff' : '#f1f5f9' }}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table bookings-table">
            <thead>
              <tr>
                <th>Cụm sân</th>
                <th>Sân</th>
                <th className="bookings-time-col">Thời gian bắt đầu</th>
                <th className="bookings-time-col">Thời gian kết thúc</th>
                <th>Tiền</th>
                <th>Trạng thái</th>
                <th className="bookings-action-col">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#dc2626' }}>{error}</td></tr>
              )}
              {!loading && !error && filteredBookings.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Không có booking phù hợp bộ lọc.</td></tr>
              )}
              {!loading && !error && filteredBookings.map((b) => {
                const s = statusMap[b.status] || { label: b.status, cls: 'badge-default' };
                const canCancel = b.status === 'PENDING_PAYMENT' || b.status === 'PAYMENT_UPLOADED';
                const canPay    = b.status === 'PENDING_PAYMENT';
                const canReview      = b.status === 'CONFIRMED' || b.status === 'COMPLETED';
                const alreadyReviewed = reviewedIds.has(b.id);
                const hasPaymentActions = canCancel || canPay;

                return (
                  <tr key={b.id}
                    onClick={() => navigate(`/bookings/${b.id}/payment`)}
                    style={{ cursor: 'pointer' }}
                    title={`Xem chi tiết đơn #${b.id}`}
                  >
                    <td className="bookings-venue-cell">{b.venueName}</td>
                    <td className="bookings-court-cell">{getBookingCourtDisplay(b)}</td>
                    <td className="bookings-time-cell">{formatDateTime(getBookingStartTime(b))}</td>
                    <td className="bookings-time-cell">{formatDateTime(getBookingEndTime(b))}</td>
                    <td className="bookings-price-cell">
                      {Number(b.totalPrice || 0).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="bookings-status-cell">
                      <span className={`badge ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="bookings-action-cell">
                      <div className={`bookings-action-group ${hasPaymentActions ? 'bookings-action-group-multi' : ''}`}>
                        {canCancel && (
                          <button className="btn btn-danger btn-sm"
                            onClick={(e) => { e.stopPropagation(); handleCancel(b.id); }}
                            disabled={workingId === b.id}>
                            {workingId === b.id ? 'Đang hủy...' : 'Hủy'}
                          </button>
                        )}
                        {canPay && (
                          <button className="btn btn-success btn-sm"
                            onClick={(e) => { e.stopPropagation(); navigate(`/bookings/${b.id}/payment`); }}>
                            Thanh toán
                          </button>
                        )}
                        {canReview ? (
                          <button
                            className="btn btn-sm bookings-review-btn"
                            onClick={(e) => handleOpenReview(e, b)}
                            disabled={alreadyReviewed}
                            style={{
                              background: alreadyReviewed
                                ? '#f3f4f6'
                                : 'linear-gradient(135deg, #f59e0b, #f97316)',
                              color:  alreadyReviewed ? '#6b7280' : '#fff',
                              border: 'none',
                            }}
                          >
                            {alreadyReviewed ? 'Đã đánh giá' : '⭐ Nhận xét/Đánh giá'}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onReviewed={() => setReviewedIds(prev => new Set([...prev, reviewTarget.id]))}
        />
      )}
    </div>
  );
}

export default BookingList;