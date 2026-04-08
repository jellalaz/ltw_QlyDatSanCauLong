import PageHeader from '../../components/common/PageHeader';
import '../../styles/Layout.css';

/**
 * VenueModerate - Kiểm duyệt cụm sân toàn hệ thống (ADMIN)
 * TODO:
 *   - Gọi API lấy tất cả venue (kể cả PENDING)
 *   - Implement: Approve / Reject / Delete venue
 */
function VenueModerate() {
  const mockVenues = [
    { id: 1, name: 'CLB Bình Thạnh Mới', owner: 'Trần Văn Y', district: 'Bình Thạnh', status: 'PENDING', createdAt: '2024-11-19' },
    { id: 2, name: 'CLB Phú Nhuận', owner: 'Nguyễn Văn Z', district: 'Phú Nhuận', status: 'ACTIVE', createdAt: '2024-10-01' },
    { id: 3, name: 'Sân Cũ Quận 1', owner: 'Lê Thị W', district: 'Quận 1', status: 'INACTIVE', createdAt: '2024-08-15' },
  ];

  const statusMap = {
    PENDING:  { label: 'Chờ duyệt', cls: 'badge-warning' },
    ACTIVE:   { label: 'Hoạt động', cls: 'badge-success' },
    INACTIVE: { label: 'Ngừng',     cls: 'badge-default' },
  };

  return (
    <div>
      <PageHeader
        title="🏟️ Kiểm Duyệt Cụm Sân"
        subtitle="Phê duyệt, ẩn hoặc xóa các cụm sân trong hệ thống"
      />

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Tên cụm sân</th>
                <th>Chủ sân</th>
                <th>Địa chỉ</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {mockVenues.map((v) => {
                const s = statusMap[v.status];
                return (
                  <tr key={v.id}>
                    <td style={{ fontWeight: '600' }}>{v.name}</td>
                    <td>{v.owner}</td>
                    <td>📍 {v.district}</td>
                    <td>{v.createdAt}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {v.status === 'PENDING' && (
                          <>
                            <button className="btn btn-success btn-sm">✓ Duyệt</button>
                            <button className="btn btn-secondary btn-sm">✗ Từ chối</button>
                          </>
                        )}
                        {v.status === 'ACTIVE' && (
                          <button className="btn btn-secondary btn-sm">👁 Ẩn</button>
                        )}
                        <button className="btn btn-danger btn-sm">🗑 Xóa</button>
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

export default VenueModerate;
