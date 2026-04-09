import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import '../../styles/Layout.css';

/**
 * VenueManage - Quản lý danh sách cụm sân của OWNER
 * TODO: Gọi VenueController.getMyVenues() để lấy danh sách
 *       Implement xóa: VenueController.delete(id)
 */
function VenueManage() {
  const navigate = useNavigate();

  const mockVenues = [
    { id: 1, name: 'CLB Cầu Lông Phú Nhuận', address: { district: 'Phú Nhuận', city: 'TP.HCM' }, courtCount: 4, status: 'ACTIVE' },
    { id: 2, name: 'Sân Cầu Lông Tân Bình', address: { district: 'Tân Bình', city: 'TP.HCM' }, courtCount: 2, status: 'ACTIVE' },
    { id: 3, name: 'Cơ Sở Quận 7', address: { district: 'Quận 7', city: 'TP.HCM' }, courtCount: 6, status: 'INACTIVE' },
  ];

  return (
    <div>
      <PageHeader
        title="🏟️ Cụm Sân Của Tôi"
        subtitle="Quản lý toàn bộ cơ sở sân cầu lông bạn sở hữu"
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/owner/venues/new')}>
            + Thêm cụm sân
          </button>
        }
      />

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Tên cụm sân</th>
                <th>Địa chỉ</th>
                <th>Số sân</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {mockVenues.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: '600' }}>{v.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>📍 {v.address.district}, {v.address.city}</td>
                  <td>{v.courtCount} sân</td>
                  <td>
                    <span className={`badge ${v.status === 'ACTIVE' ? 'badge-success' : 'badge-default'}`}>
                      {v.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/owner/venues/${v.id}/courts`)}>
                        🏸 Quản lý sân
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/owner/venues/${v.id}/edit`)}>
                        ✏️ Sửa
                      </button>
                      <button className="btn btn-danger btn-sm">
                        🗑️ Xóa {/* TODO: VenueController.delete(v.id) */}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default VenueManage;
