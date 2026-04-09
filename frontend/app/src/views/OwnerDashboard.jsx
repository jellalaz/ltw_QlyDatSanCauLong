import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingService from '../services/BookingService';
import '../styles/OwnerDashboard.css';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '');

function OwnerDashboard() {
  const navigate = useNavigate();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [pendingRes, allRes] = await Promise.all([
        BookingService.getPendingBookingsForOwner(),
        BookingService.getAllBookingsForOwner(),
      ]);

      setPendingBookings(pendingRes?.data?.data || []);
      setAllBookings(allRes?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Không thể tải dữ liệu owner dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dashboardStats = useMemo(() => {
    const counts = {
      total: allBookings.length,
      pendingPayment: 0,
      paymentUploaded: 0,
      confirmed: 0,
      rejected: 0,
      cancelled: 0,
      expired: 0,
      completed: 0,
    };

    allBookings.forEach((booking) => {
      switch (booking.status) {
        case 'PENDING_PAYMENT':
          counts.pendingPayment += 1;
          break;
        case 'PAYMENT_UPLOADED':
          counts.paymentUploaded += 1;
          break;
        case 'CONFIRMED':
          counts.confirmed += 1;
          break;
        case 'REJECTED':
          counts.rejected += 1;
          break;
        case 'CANCELLED':
          counts.cancelled += 1;
          break;
        case 'EXPIRED':
          counts.expired += 1;
          break;
        case 'COMPLETED':
          counts.completed += 1;
          break;
        default:
          break;
      }
    });

    return counts;
  }, [allBookings]);

  const toImageUrl = (paymentProofUrl) => {
    if (!paymentProofUrl) {
      return '';
    }
    if (paymentProofUrl.startsWith('http://') || paymentProofUrl.startsWith('https://')) {
      return paymentProofUrl;
    }
    return `${API_ROOT}${paymentProofUrl}`;
  };

  const handleAccept = async (bookingId) => {
    try {
      setActionLoadingId(bookingId);
      await BookingService.acceptBooking(bookingId);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Xác nhận đơn thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (bookingId) => {
    const reason = window.prompt('Nhập lý do từ chối đơn:');
    if (!reason || !reason.trim()) {
      return;
    }

    try {
      setActionLoadingId(bookingId);
      await BookingService.rejectBooking(bookingId, reason.trim());
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Từ chối đơn thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="owner-dashboard-container">
      <header className="owner-dashboard-header">
        <button className="owner-btn-back" onClick={() => navigate('/home')}>
          ← Quay lại
        </button>
        <h1>Dashboard Báo Cáo & Xử Lý Đơn (OWNER)</h1>
      </header>

      {loading && <div className="owner-loading">Đang tải dữ liệu...</div>}
      {error && <div className="owner-error">{error}</div>}

      {!loading && (
        <>
          <section className="owner-stats-grid">
            <div className="owner-stat-card">
              <h3>Tổng đơn</h3>
              <p>{dashboardStats.total}</p>
            </div>
            <div className="owner-stat-card">
              <h3>Chờ upload CK</h3>
              <p>{dashboardStats.pendingPayment}</p>
            </div>
            <div className="owner-stat-card highlight">
              <h3>Chờ OWNER duyệt</h3>
              <p>{dashboardStats.paymentUploaded}</p>
            </div>
            <div className="owner-stat-card success">
              <h3>Đã xác nhận</h3>
              <p>{dashboardStats.confirmed}</p>
            </div>
            <div className="owner-stat-card danger">
              <h3>Đã từ chối</h3>
              <p>{dashboardStats.rejected}</p>
            </div>
            <div className="owner-stat-card">
              <h3>Đã hoàn thành</h3>
              <p>{dashboardStats.completed}</p>
            </div>
          </section>

          <section className="owner-pending-section">
            <h2>Đơn chờ duyệt biên lai</h2>
            {pendingBookings.length === 0 ? (
              <p className="owner-empty">Hiện chưa có đơn nào chờ duyệt.</p>
            ) : (
              <div className="owner-booking-list">
                {pendingBookings.map((booking) => (
                  <article className="owner-booking-card" key={booking.id}>
                    <div className="owner-booking-main">
                      <h3>Đơn #{booking.id}</h3>
                      <p><strong>Khách:</strong> {booking.userName}</p>
                      <p><strong>Địa điểm:</strong> {booking.venuesName}</p>
                      <p><strong>Tổng tiền:</strong> {(booking.totalPrice || 0).toLocaleString('vi-VN')} VND</p>
                      <p><strong>Trạng thái:</strong> {booking.status}</p>
                      {booking.paymentProofUploadedAt && (
                        <p><strong>Thời điểm upload:</strong> {new Date(booking.paymentProofUploadedAt).toLocaleString('vi-VN')}</p>
                      )}
                    </div>

                    <div className="owner-proof-box">
                      <h4>Biên lai chuyển khoản</h4>
                      {booking.paymentProofUrl ? (
                        <img
                          src={toImageUrl(booking.paymentProofUrl)}
                          alt={`Biên lai đơn ${booking.id}`}
                          className="owner-proof-image"
                        />
                      ) : (
                        <p>Không có ảnh biên lai</p>
                      )}
                    </div>

                    <div className="owner-actions">
                      <button
                        className="owner-btn owner-btn-accept"
                        onClick={() => handleAccept(booking.id)}
                        disabled={actionLoadingId === booking.id}
                      >
                        {actionLoadingId === booking.id ? 'Đang xử lý...' : 'Chấp thuận'}
                      </button>
                      <button
                        className="owner-btn owner-btn-reject"
                        onClick={() => handleReject(booking.id)}
                        disabled={actionLoadingId === booking.id}
                      >
                        {actionLoadingId === booking.id ? 'Đang xử lý...' : 'Từ chối'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default OwnerDashboard;
