import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import BookingController from '../../controllers/BookingController';
import '../../styles/Layout.css';

const normalizeBankCode = (value) => String(value || '').trim().replace(/\s+/g, '').toUpperCase();

const buildVietQrUrl = ({ bankName, bankAccountNumber, bankAccountName, amount, bookingId }) => {
  const bankCode = normalizeBankCode(bankName);
  const accountNo = String(bankAccountNumber || '').trim();
  if (!bankCode || !accountNo) return '';

  const addInfo = `Thanh toan dat san #${bookingId}`;
  const params = new URLSearchParams({
    amount: String(Math.max(0, Math.round(Number(amount) || 0))),
    addInfo,
    accountName: String(bankAccountName || '').trim(),
  });

  return `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?${params.toString()}`;
};

const formatCurrency = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)}đ`;

const safeParseJson = (rawValue) => {
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

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

const statusMap = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', cls: 'badge-warning' },
  PAYMENT_UPLOADED: { label: 'Chờ chủ sân duyệt', cls: 'badge-info' },
  CONFIRMED: { label: 'Đã xác nhận', cls: 'badge-success' },
  COMPLETED: { label: 'Phê duyệt', cls: 'badge-success' },
  CANCELLED: { label: 'Đã hủy', cls: 'badge-danger' },
  REJECTED: { label: 'Từ chối', cls: 'badge-danger' },
  EXPIRED: { label: 'Hết hạn', cls: 'badge-default' },
};

const statusToneMap = {
  'badge-success': { borderColor: '#34d399', background: '#ecfdf5' },
  'badge-warning': { borderColor: '#fbbf24', background: '#fffbeb' },
  'badge-danger': { borderColor: '#fca5a5', background: '#fef2f2' },
  'badge-info': { borderColor: '#93c5fd', background: '#eff6ff' },
  'badge-default': { borderColor: '#cbd5e1', background: '#f8fafc' },
};

function BookingPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [uploadDeadlineAt, setUploadDeadlineAt] = useState(null);
  const deadlineStorageKey = useMemo(() => `booking-upload-deadline-${id || 'unknown'}`, [id]);
  const bankInfoStorageKey = useMemo(() => `booking-owner-bank-info-${id || 'unknown'}`, [id]);

  const loadBooking = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const data = await BookingController.getById(id);
      const cachedOwnerBankInfo = safeParseJson(localStorage.getItem(bankInfoStorageKey));
      const ownerBankInfo = data?.ownerBankInfo || cachedOwnerBankInfo || null;
      if (data?.ownerBankInfo) {
        localStorage.setItem(bankInfoStorageKey, JSON.stringify(data.ownerBankInfo));
      }
      setBooking(ownerBankInfo === data?.ownerBankInfo ? data : { ...data, ownerBankInfo });
      if (data?.status === 'PENDING_PAYMENT') {
        const backendExpireMs = data?.expireTime ? new Date(data.expireTime).getTime() : Number.NaN;
        const storedDeadlineMs = Number(localStorage.getItem(deadlineStorageKey) || 0);
        const fallbackNowPlus5Min = Date.now() + (5 * 60 * 1000);
        const nextDeadlineMs = Number.isFinite(backendExpireMs) && backendExpireMs > 0
          ? backendExpireMs
          : (storedDeadlineMs > 0 ? storedDeadlineMs : fallbackNowPlus5Min);

        localStorage.setItem(deadlineStorageKey, String(nextDeadlineMs));
        setUploadDeadlineAt(nextDeadlineMs);
      } else {
        localStorage.removeItem(deadlineStorageKey);
        setUploadDeadlineAt(null);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải dữ liệu thanh toán.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bankInfoStorageKey, deadlineStorageKey, id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  useEffect(() => {
    if (!uploadDeadlineAt || booking?.status !== 'PENDING_PAYMENT') {
      setRemainingMs(0);
      return undefined;
    }

    const tick = () => {
      const diff = Number(uploadDeadlineAt) - Date.now();
      setRemainingMs(Math.max(0, diff));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [uploadDeadlineAt, booking?.status]);

  const isExpiredPending = booking?.status === 'PENDING_PAYMENT' && Number(uploadDeadlineAt) > 0 && Number(uploadDeadlineAt) <= Date.now();
  const effectiveStatus = isExpiredPending ? 'EXPIRED' : booking?.status;
  const canUpload = booking?.status === 'PENDING_PAYMENT' && !isExpiredPending && remainingMs > 0;

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('vi-VN');
  };

  const formatDateOnly = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('vi-VN');
  };

  const formatTimeOnly = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const countdownText = useMemo(() => {
    const totalSeconds = Math.floor(remainingMs / 1000);
    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [remainingMs]);

  const vietQrUrl = useMemo(() => buildVietQrUrl({
    bankName: booking?.ownerBankInfo?.bankName,
    bankAccountNumber: booking?.ownerBankInfo?.bankAccountNumber,
    bankAccountName: booking?.ownerBankInfo?.bankAccountName,
    amount: booking?.totalPrice,
    bookingId: booking?.id,
  }), [booking]);

  const displayBookingItems = useMemo(() => {
    if (!booking) return [];
    if (Array.isArray(booking.bookingItems) && booking.bookingItems.length > 0) {
      return booking.bookingItems;
    }

    if (booking.courtName || booking.startTime || booking.endTime) {
      return [{
        id: booking.id,
        courtName: booking.courtName,
        startTime: booking.startTime,
        endTime: booking.endTime,
      }];
    }

    return [];
  }, [booking]);

  const bookedCourtSummary = useMemo(() => {
    const names = [...new Set(displayBookingItems.map((item, idx) => getCourtDisplayName(item, idx + 1)))];
    return names.length > 0 ? names.join(', ') : '-';
  }, [displayBookingItems]);

  const statusMeta = useMemo(() => {
    if (!booking) return { label: '-', cls: 'badge-default' };
    return statusMap[effectiveStatus] || { label: booking.getStatusLabel(), cls: 'badge-default' };
  }, [booking, effectiveStatus]);

  const statusTone = statusToneMap[statusMeta.cls] || statusToneMap['badge-default'];

  const handleUploadAndSubmit = async () => {
    if (!proofFile || !booking) {
      setError('Vui lòng chọn ảnh biên lai trước khi gửi.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const uploaded = await BookingController.uploadPaymentProof(booking.id, proofFile);
      await BookingController.confirmPayment(booking.id, uploaded.paymentProofUrl);

      setSuccess('Đã gửi biên lai thành công. Đơn đang chờ chủ sân duyệt.');
      setProofFile(null);
      await loadBooking();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể gửi biên lai thanh toán.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Thanh toán đặt sân"
        subtitle={`Mã booking: #${id}`}
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/bookings')}>
            Xem danh sách booking
          </button>
        }
      />

      <div className="card">
        <div className="card-body" style={{ display: 'grid', gap: '12px' }}>
          {loading && <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Đang tải thông tin thanh toán...</p>}

          {!loading && booking && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 6px', color: 'var(--text-secondary)' }}>Cụm sân</p>
                  <p style={{ margin: 0, fontWeight: 700 }}>{booking.venueName || '-'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', color: 'var(--text-secondary)' }}>Tổng tiền</p>
                  <p style={{ margin: 0, fontWeight: 700, color: '#059669' }}>{formatCurrency(booking.totalPrice)}</p>
                </div>
              </div>

              {booking.status === 'PENDING_PAYMENT' && (
                <p style={{ margin: 0, color: isExpiredPending ? '#dc2626' : '#d97706', fontWeight: 600 }}>
                  Hạn upload biên lai: {isExpiredPending ? 'Đã hết hạn' : countdownText}
                </p>
              )}

              {(booking.status !== 'PENDING_PAYMENT' || isExpiredPending) && (
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  Trạng thái hiện tại: <strong>{statusMeta.label}</strong>
                </p>
              )}

              <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', display: 'grid', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Chi tiết đơn đặt sân</h3>
                <p style={{ margin: 0 }}><strong>Sân đã đặt:</strong> {bookedCourtSummary}</p>
                <div style={{ margin: 0 }}>
                  <strong>Ngày giờ đã đặt:</strong>
                  {displayBookingItems.length > 0 ? (
                    <div style={{ display: 'grid', gap: '6px', marginTop: '6px' }}>
                      {displayBookingItems.map((item, idx) => (
                        <div key={`schedule-${item.id || idx}-${item.courtId || idx}`} style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '8px', background: '#f8fafc' }}>
                          <div><strong>{getCourtDisplayName(item, idx + 1)}</strong></div>
                          <div style={{ marginTop: '4px' }}>
                            Ngày: {formatDateOnly(item.startTime)} | Giờ: {formatTimeOnly(item.startTime)} - {formatTimeOnly(item.endTime)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span> -</span>
                  )}
                </div>
                <p style={{ margin: 0 }}><strong>Trạng thái thanh toán:</strong> {booking.paymentProofUploaded ? 'Đã upload biên lai' : 'Chưa upload biên lai'}</p>
                <div style={{ marginTop: '2px', border: `1px solid ${statusTone.borderColor}`, borderRadius: '8px', padding: '8px 10px', background: statusTone.background, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <strong>Trạng thái đơn:</strong>
                  <span className={`badge ${statusMeta.cls}`} style={{ border: `1px solid ${statusTone.borderColor}` }}>{statusMeta.label}</span>
                </div>
                {booking.paymentProofUploadedAt && (
                  <p style={{ margin: 0 }}><strong>Thời điểm upload:</strong> {formatDateTime(booking.paymentProofUploadedAt)}</p>
                )}
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', display: 'grid', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Thông tin chuyển khoản chủ sân</h3>
                <p style={{ margin: 0 }}><strong>Ngân hàng:</strong> {booking.ownerBankInfo?.bankName || '-'}</p>
                <p style={{ margin: 0 }}><strong>Số tài khoản:</strong> {booking.ownerBankInfo?.bankAccountNumber || '-'}</p>
                <p style={{ margin: 0 }}><strong>Chủ tài khoản:</strong> {booking.ownerBankInfo?.bankAccountName || booking.ownerBankInfo?.ownerName || '-'}</p>
                {vietQrUrl ? (
                  <img src={vietQrUrl} alt="VietQR" style={{ width: '220px', height: '220px', objectFit: 'contain', border: '1px solid var(--border)', borderRadius: '8px' }} />
                ) : (
                  <p style={{ margin: 0, color: '#b45309' }}>Thiếu thông tin ngân hàng để tạo VietQR. Vui lòng liên hệ chủ sân.</p>
                )}
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', display: 'grid', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Tải ảnh minh chứng chuyển khoản</h3>
                <input
                  type="file"
                  accept="image/*"
                  disabled={!canUpload || submitting}
                  onChange={(e) => setProofFile((e.target.files && e.target.files[0]) || null)}
                />
                <button className="btn btn-primary" onClick={handleUploadAndSubmit} disabled={!canUpload || submitting || !proofFile}>
                  {submitting ? 'Đang gửi...' : 'Upload và gửi chủ sân duyệt'}
                </button>
                {booking.paymentProofUploadedAt && (
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Biên lai đã upload lúc: {formatDateTime(booking.paymentProofUploadedAt)}
                  </p>
                )}
              </div>
            </>
          )}

          {!loading && !booking && !error && (
            <p style={{ margin: 0, color: '#dc2626' }}>Không tìm thấy thông tin đơn đặt sân.</p>
          )}

          {error && <p style={{ margin: 0, color: '#dc2626' }}>{error}</p>}
          {success && <p style={{ margin: 0, color: '#059669' }}>{success}</p>}
        </div>
      </div>
    </div>
  );
}

export default BookingPayment;

