import PageHeader from '../../components/common/PageHeader';
import '../../styles/Layout.css';

/**
 * BookingManage - Quản lý đơn đặt sân của khách (OWNER)
 * TODO: Gọi BookingController.getOwnerBookings()
 *       Implement: approve / reject / finish theo từng booking
 */
function BookingManage() {
  const mockBookings = [
    { id: 101, customerName: 'Nguyễn Văn A', venueName: 'CLB Phú Nhuận', courtName: 'Sân 1', bookingDate: '2024-11-20', startTime: '08:00', endTime: '10:00', totalPrice: 160000, status: 'PENDING' },
    { id: 102, customerName: 'Trần Thị B', venueName: 'CLB Phú Nhuận', courtName: 'Sân 2', bookingDate: '2024-11-21', startTime: '10:00', endTime: '12:00', totalPrice: 160000, status: 'APPROVED' },
    { id: 103, customerName: 'Lê Văn C', venueName: 'Sân Tân Bình', courtName: 'Sân 1', bookingDate: '2024-11-15', startTime: '07:00', endTime: '09:00', totalPrice: 140000, status: 'COMPLETED' },
  ];

  const statusMap = {
    PENDING:   { label: 'Chờ duyệt', cls: 'badge-warning' },
    APPROVED:  { label: 'Đã duyệt',  cls: 'badge-info' },
    COMPLETED: { label: 'Hoàn thành',cls: 'badge-success' },
    REJECTED:  { label: 'Từ chối',   cls: 'badge-danger' },
  };

  return (
    <div>
      <PageHeader
        title="📋 Quản Lý Đặt Sân"
        subtitle="Danh sách các đơn đặt sân từ khách hàng"
      />

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Cụm sân / Sân</th>
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
                    <td style={{ fontWeight: '600' }}>{b.customerName}</td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{b.venueName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{b.courtName}</div>
                    </td>
                    <td>{b.bookingDate}</td>
                    <td>{b.startTime} – {b.endTime}</td>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                      {b.totalPrice.toLocaleString('vi-VN')}đ
                    </td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {b.status === 'PENDING' && (
                          <>
                            <button className="btn btn-success btn-sm">✓ Duyệt</button>
                            <button className="btn btn-danger btn-sm">✗ Từ chối</button>
                          </>
                        )}
                        {b.status === 'APPROVED' && (
                          <button className="btn btn-secondary btn-sm">✓ Hoàn thành</button>
                        )}
                      </div>
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

export default BookingManage;
