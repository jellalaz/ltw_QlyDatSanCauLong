import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ComingSoon from '../../components/common/ComingSoon';
import '../../styles/Layout.css';

/**
 * VenueForm - Form thêm mới / chỉnh sửa cụm sân (OWNER)
 * @param {string} mode - 'create' | 'edit'
 * TODO:
 *   - mode='create': gọi VenueController.create()
 *   - mode='edit': gọi VenueController.getById() rồi VenueController.update()
 *   - Tích hợp AddressController để chọn Tỉnh/Quận
 *   - Upload ảnh cụm sân
 */
function VenueForm({ mode = 'create' }) {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div>
      <PageHeader
        title={mode === 'create' ? '➕ Thêm Cụm Sân Mới' : '✏️ Chỉnh Sửa Cụm Sân'}
        subtitle={mode === 'create' ? 'Điền thông tin để tạo cụm sân mới' : `Đang sửa cụm sân ID: ${id}`}
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/owner/venues')}>
            ← Quay lại
          </button>
        }
      />
      <ComingSoon
        icon="🏟️"
        title="Form cụm sân đang xây dựng"
        subtitle="Dev 2 sẽ implement form thêm/sửa cụm sân (tên, mô tả, địa chỉ, giờ mở cửa, ảnh) tại đây"
      />
    </div>
  );
}

export default VenueForm;
