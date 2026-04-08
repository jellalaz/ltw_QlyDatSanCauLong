import PageHeader from '../../components/common/PageHeader';
import ComingSoon from '../../components/common/ComingSoon';
import '../../styles/Layout.css';

/**
 * BookingList - Lịch sử đặt sân của người dùng (USER)
 * TODO: Gọi BookingController.getMyBookings()
 */
function BookingList() {
  // TODO: Replace với API call
  const mockBookings = [
    { id: 1, venueName: 'CLB Cầu Lông Phú Nhuận', courtName: 'Sân 1', bookingDate: '2024-11-20', startTime: '08:00', endTime: '10:00', totalPrice: 160000, status: 'APPROVED' },
    { id: 2, venueName: 'Nhà Thi Đấu Quận 3', courtName: 'Sân 3', bookingDate: '2024-11-18', startTime: '18:00', endTime: '20:00', totalPrice: 200000, status: 'PENDING' },
    { id: 3, venueName: 'Sân Cầu Lông Tân Bình', courtName: 'Sân 2', bookingDate: '2024-11-10', startTime: '07:00', endTime: '09:00', totalPrice: 140000, status: 'COMPLETED' },
  ];

  const statusMap = {
    PENDING:   { label: 'Chờ duyệt', cls: 'badge-warning' },
    APPROVED:  { label: 'Đã duyệt',  cls: 'badge-info' },
    COMPLETED: { label: 'Hoàn thành',cls: 'badge-success' },
    CANCELLED: { label: 'Đã hủy',    cls: 'badge-danger' },
    REJECTED:  { label: 'Từ chối',   cls: 'badge-danger' },
  };

  return (
    <div>
      <PageHeader
        title="📅 Lịch Đặt Sân Của Tôi"
        subtitle="Quản lý và theo dõi các lịch đặt sân đã tạo"
      />

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Cụm sân</th>
                <th>Sân</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Tiền</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.map((b) => {
                const s = statusMap[b.status] || { label: b.status, cls: 'badge-default' };
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: '600' }}>{b.venueName}</td>
                    <td>{b.courtName}</td>
                    <td>{b.bookingDate}</td>
                    <td>{b.startTime} – {b.endTime}</td>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                      {b.totalPrice.toLocaleString('vi-VN')}đ
                    </td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td>
                      {b.status === 'PENDING' && (
                        <button className="btn btn-danger btn-sm">
                          Hủy {/* TODO: BookingController.cancel(b.id) */}
                        </button>
                      )}
                      {b.status === 'APPROVED' && (
                        <button className="btn btn-success btn-sm">
                          Thanh toán {/* TODO: BookingController.pay(b.id) */}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BookingList;
