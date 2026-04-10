import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import '../../styles/Layout.css';

function BookingPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

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
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            Đơn đặt sân đã được tạo thành công.
          </p>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Trang thanh toán chi tiết sẽ được triển khai sau. Hiện tại bạn đã có thể điều hướng tới bước thanh toán từ luồng đặt sân.
          </p>

          {state?.venueName && (
            <p style={{ margin: 0 }}>
              <strong>Sân:</strong> {state.venueName}
            </p>
          )}
          {state?.courtName && (
            <p style={{ margin: 0 }}>
              <strong>Sân con:</strong> {state.courtName}
            </p>
          )}
          {typeof state?.totalPrice === 'number' && (
            <p style={{ margin: 0 }}>
              <strong>Tạm tính:</strong> {new Intl.NumberFormat('vi-VN').format(state.totalPrice)}đ
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingPayment;

