import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import BookingService from '../../services/BookingService';
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
    ? booking.bookingItems
    : [booking];
  const labels = [...new Set(items.map((item, index) => getCourtDisplayName(item, index + 1)))];
  return labels.length > 0 ? labels.join(', ') : '-';
};

const getCustomerPhone = (booking) => (
  booking?.userPhone
  || booking?.userphone
  || booking?.user?.phone
  || booking?.user?.phoneNumber
  || booking?.phone
  || booking?.customerPhone
  || booking?.customerPhoneNumber
  || booking?.customer_phone
  || booking?.contactPhone
  || '-'
);

const toDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

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

  if (Array.isArray(value)) {
    const [y = 0, m = 0, d = 0] = value.map((part) => Number(part) || 0);
    if (y > 0 && m > 0 && d > 0) {
      return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  if (typeof value === 'object' && value && !(value instanceof Date)) {
    const y = Number(value.year ?? 0);
    const m = Number(value.monthValue ?? value.month ?? 0);
    const d = Number(value.dayOfMonth ?? value.day ?? 0);
    if (y > 0 && m > 0 && d > 0) {
      return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  const date = toDate(value);
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getBookingTimeBounds = (booking) => {
  const itemSources = Array.isArray(booking?.bookingItems) && booking.bookingItems.length > 0
    ? booking.bookingItems
    : [booking];

  const starts = itemSources.map((item) => item?.startTime).filter(Boolean);
  const ends = itemSources.map((item) => item?.endTime).filter(Boolean);

  const sortedStarts = starts.sort((a, b) => {
    const aa = toDate(a)?.getTime() || 0;
    const bb = toDate(b)?.getTime() || 0;
    return aa - bb;
  });
  const sortedEnds = ends.sort((a, b) => {
    const aa = toDate(a)?.getTime() || 0;
    const bb = toDate(b)?.getTime() || 0;
    return aa - bb;
  });

  return {
    start: sortedStarts[0] || booking?.startTime || null,
    end: sortedEnds[sortedEnds.length - 1] || booking?.endTime || null,
  };
};

const getBookingStartTime = (booking) => {
  return getBookingTimeBounds(booking).start;
};

const getBookingEndTime = (booking) => getBookingTimeBounds(booking).end;

/**
 * BookingManage - Quản lý đơn đặt sân của khách (OWNER)
 * Luồng chính: kiểm tra biên lai và Chấp thuận / Từ chối đơn
 */
function BookingManage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await BookingService.getAllBookingsForOwner();
      const list = Array.isArray(response?.data?.data) ? response.data.data : [];

      const missingPhoneBookings = list.filter((booking) => getCustomerPhone(booking) === '-');
      if (missingPhoneBookings.length === 0) {
        setBookings(list);
        return;
      }

      const detailPairs = await Promise.all(
        missingPhoneBookings.map(async (booking) => {
          try {
            const detailResponse = await BookingService.getById(booking.id);
            const detail = detailResponse?.data?.data || detailResponse?.data || {};
            return [booking.id, getCustomerPhone(detail)];
          } catch {
            return [booking.id, '-'];
          }
        }),
      );

      const phoneMap = new Map(detailPairs.filter(([, phone]) => phone && phone !== '-'));
      const merged = list.map((booking) => (
        phoneMap.has(booking.id)
          ? { ...booking, userPhone: phoneMap.get(booking.id) }
          : booking
      ));
      setBookings(merged);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Không thể tải danh sách booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleApprove = async (bookingId) => {
    try {
      setWorkingId(bookingId);
      await BookingService.acceptBooking(bookingId);
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Duyệt đơn thất bại');
    } finally {
      setWorkingId(null);
    }
  };

  const handleReject = async (bookingId) => {
    const reason = window.prompt('Nhập lý do từ chối đơn:');
    if (!reason || !reason.trim()) {
      return;
    }

    try {
      setWorkingId(bookingId);
      await BookingService.rejectBooking(bookingId, reason.trim());
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Từ chối đơn thất bại');
    } finally {
      setWorkingId(null);
    }
  };

  const statusMap = {
    PENDING_PAYMENT: { label: 'Chờ thanh toán', cls: 'badge-default' },
    PAYMENT_UPLOADED: { label: 'Chờ duyệt biên lai', cls: 'badge-warning' },
    CONFIRMED: { label: 'Đã duyệt', cls: 'badge-success' },
    COMPLETED: { label: 'Hoàn thành', cls: 'badge-success' },
    REJECTED:  { label: 'Từ chối',   cls: 'badge-danger' },
    CANCELLED: { label: 'Đã hủy', cls: 'badge-default' },
    EXPIRED: { label: 'Hết hạn', cls: 'badge-default' },
  };

  const formatDateTime = (value) => {
    const date = toDate(value);
    return date ? date.toLocaleString('vi-VN') : '-';
  };

  const formatTimeOnly = (value) => {
    const date = toDate(value);
    return date ? date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-';
  };

  const formatAmount = (value) => `${(value || 0).toLocaleString('vi-VN')}đ`;

  const todayKey = toDateKey(new Date());

  const filteredBookings = useMemo(() => {
    if (filterMode === 'today') {
      const currentDateKey = toDateKey(new Date());
      return bookings.filter((booking) => toDateKey(getBookingStartTime(booking)) === currentDateKey);
    }

    if (filterMode === 'date') {
      if (!selectedDate) return bookings;
      return bookings.filter((booking) => toDateKey(getBookingStartTime(booking)) === selectedDate);
    }

    return bookings;
  }, [bookings, filterMode, selectedDate]);

  const apiRoot = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '');
  const toImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${apiRoot}${url}`;
  };

  return (
    <div>
      <PageHeader
        title="📋 Quản Lý Đặt Sân"
        subtitle="Chủ sân kiểm tra biên lai và xác nhận chấp thuận / từ chối"
      />

      {error && <div style={{ marginBottom: '12px' }} className="badge badge-danger">{error}</div>}

      <div className="card" style={{ marginBottom: '12px' }}>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-sm"
            style={{ background: filterMode === 'all' ? '#4f46e5' : '#e2e8f0', color: filterMode === 'all' ? '#fff' : '#1e293b', border: '1px solid #cbd5e1' }}
            onClick={() => setFilterMode('all')}
          >
            Tất cả
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ background: filterMode === 'today' ? '#4f46e5' : '#e2e8f0', color: filterMode === 'today' ? '#fff' : '#1e293b', border: '1px solid #cbd5e1' }}
            onClick={() => {
              setSelectedDate(toDateKey(new Date()));
              setFilterMode('today');
            }}
          >
            Hôm nay
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ background: filterMode === 'date' ? '#4f46e5' : '#e2e8f0', color: filterMode === 'date' ? '#fff' : '#1e293b', border: '1px solid #cbd5e1' }}
            onClick={() => {
              if (!selectedDate) setSelectedDate(todayKey);
              setFilterMode('date');
            }}
          >
            Lọc theo ngày
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setFilterMode('date');
            }}
            disabled={filterMode !== 'date'}
            style={{ height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 10px', background: filterMode === 'date' ? '#fff' : '#f1f5f9' }}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="card-body">Đang tải danh sách booking...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="card-body">Không có booking phù hợp bộ lọc.</div>
        ) : (
          <div style={{ display: 'grid', gap: '14px', padding: '16px' }}>
            {filteredBookings.map((b) => {
              const status = statusMap[b.status] || { label: b.status, cls: 'badge-default' };
              const canProcess = b.status === 'PAYMENT_UPLOADED';

              return (
                <div key={b.id} className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
                  <div className="card-body" style={{ display: 'grid', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>Đơn #{b.id}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                          Khách: {b.userName || '-'}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                          SĐT: {getCustomerPhone(b)}
                        </div>
                      </div>
                      <span className={`badge ${status.cls}`}>{status.label}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '8px' }}>
                      <div><strong>Cụm sân:</strong> {b.venuesName || '-'}</div>
                      <div><strong>Sân:</strong> {getBookingCourtDisplay(b)}</div>
                      <div><strong>Tổng tiền:</strong> {formatAmount(b.totalPrice)}</div>
                      <div style={{ display: 'grid', gap: '2px' }}>
                        <strong>Ngày giờ đặt sân:</strong>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {formatDateTime(getBookingStartTime(b))}
                          {' - '}
                          {toDateKey(getBookingStartTime(b)) === toDateKey(getBookingEndTime(b))
                            ? formatTimeOnly(getBookingEndTime(b))
                            : formatDateTime(getBookingEndTime(b))}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gap: '2px' }}>
                        <strong>Ngày giờ gửi minh chứng:</strong>
                        <span style={{ color: 'var(--text-secondary)' }}>{formatDateTime(b.paymentProofUploadedAt)}</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ marginBottom: '6px', fontWeight: 600 }}>Ảnh biên lai</div>
                      {b.paymentProofUrl ? (
                        <img
                          src={toImageUrl(b.paymentProofUrl)}
                          alt={`Biên lai booking ${b.id}`}
                          style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'contain', border: '1px solid var(--border)', borderRadius: '8px' }}
                        />
                      ) : (
                        <div style={{ color: 'var(--text-secondary)' }}>Không có ảnh biên lai.</div>
                      )}
                    </div>

                    {b.rejectionReason && (
                      <div><strong>Lý do từ chối:</strong> {b.rejectionReason}</div>
                    )}

                    {canProcess && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-success btn-sm"
                          disabled={workingId === b.id}
                          onClick={() => handleApprove(b.id)}
                        >
                          {workingId === b.id ? 'Đang xử lý...' : '✓ Chấp thuận'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={workingId === b.id}
                          onClick={() => handleReject(b.id)}
                        >
                          {workingId === b.id ? 'Đang xử lý...' : '✗ Từ chối'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingManage;
