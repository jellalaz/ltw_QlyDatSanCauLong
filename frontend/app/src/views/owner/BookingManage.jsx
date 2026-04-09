import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import BookingService from '../../services/BookingService';
import '../../styles/Layout.css';

/**
 * BookingManage - Quản lý đơn đặt sân của khách (OWNER)
 * Luồng chính: kiểm tra biên lai và Chấp thuận / Từ chối đơn
 */
function BookingManage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await BookingService.getAllBookingsForOwner();
      setBookings(response?.data?.data || []);
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
    CONFIRMED: { label: 'Đã duyệt', cls: 'badge-info' },
    COMPLETED: { label: 'Hoàn thành', cls: 'badge-success' },
    REJECTED:  { label: 'Từ chối',   cls: 'badge-danger' },
    CANCELLED: { label: 'Đã hủy', cls: 'badge-default' },
    EXPIRED: { label: 'Hết hạn', cls: 'badge-default' },
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('vi-VN');
  };

  const formatAmount = (value) => `${(value || 0).toLocaleString('vi-VN')}đ`;

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

      <div className="card">
        {loading ? (
          <div className="card-body">Đang tải danh sách booking...</div>
        ) : bookings.length === 0 ? (
          <div className="card-body">Chưa có booking nào.</div>
        ) : (
          <div style={{ display: 'grid', gap: '14px', padding: '16px' }}>
            {bookings.map((b) => {
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
                      </div>
                      <span className={`badge ${status.cls}`}>{status.label}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '8px' }}>
                      <div><strong>Cụm sân:</strong> {b.venuesName || '-'}</div>
                      <div><strong>Sân:</strong> {b.courtName || '-'}</div>
                      <div><strong>Tổng tiền:</strong> {formatAmount(b.totalPrice)}</div>
                      <div><strong>Upload biên lai:</strong> {formatDateTime(b.paymentProofUploadedAt)}</div>
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

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-success btn-sm"
                        disabled={!canProcess || workingId === b.id}
                        onClick={() => handleApprove(b.id)}
                      >
                        {workingId === b.id ? 'Đang xử lý...' : '✓ Chấp thuận'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={!canProcess || workingId === b.id}
                        onClick={() => handleReject(b.id)}
                      >
                        {workingId === b.id ? 'Đang xử lý...' : '✗ Từ chối'}
                      </button>
                    </div>
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
