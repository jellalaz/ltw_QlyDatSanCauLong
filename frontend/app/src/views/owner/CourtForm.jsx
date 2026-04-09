import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ComingSoon from '../../components/common/ComingSoon';
import '../../styles/Layout.css';

/**
 * CourtForm - Form thêm mới / chỉnh sửa sân lẻ (OWNER)
 * @param {string} mode - 'create' | 'edit'
 * TODO: CourtController.create() hoặc CourtController.update()
 */
function CourtForm({ mode = 'create' }) {
  const { venueId, courtId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title={mode === 'create' ? '➕ Thêm Sân Lẻ' : '✏️ Chỉnh Sửa Sân Lẻ'}
        subtitle={`Cụm sân ID: ${venueId}${courtId ? ` | Sân ID: ${courtId}` : ''}`}
        actions={
          <button className="btn btn-secondary" onClick={() => navigate(`/owner/venues/${venueId}/courts`)}>
            ← Quay lại
          </button>
        }
      />
      <ComingSoon
        icon="🏸"
        title="Form sân lẻ đang xây dựng"
        subtitle="Dev 3 sẽ implement form tên sân, mô tả, bảng giá theo giờ tại đây"
      />
    </div>
  );
}

export default CourtForm;
