import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ComingSoon from '../../components/common/ComingSoon';
import '../../styles/Layout.css';

/**
 * CourtManage - Quản lý sân lẻ bên trong 1 cụm sân (OWNER)
 * TODO:
 *   - Gọi CourtController.getByVenue(venueId)
 *   - Xóa: CourtController.delete(courtId)
 */
function CourtManage() {
  const { venueId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="🏸 Quản Lý Sân Lẻ"
        subtitle={`Các sân lẻ trong cụm sân ID: ${venueId}`}
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/owner/venues')}>
              ← Quay lại
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/owner/venues/${venueId}/courts/new`)}>
              + Thêm sân
            </button>
          </div>
        }
      />
      <ComingSoon
        icon="🏸"
        title="Quản lý sân lẻ đang xây dựng"
        subtitle="Dev 3 sẽ implement danh sách, thêm/sửa/xóa sân lẻ và bảng giá tại đây"
      />
    </div>
  );
}

export default CourtManage;
