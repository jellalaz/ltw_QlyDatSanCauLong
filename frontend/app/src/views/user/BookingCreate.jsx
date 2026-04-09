import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ComingSoon from '../../components/common/ComingSoon';
import '../../styles/Layout.css';

/**
 * BookingCreate - Luồng tạo đơn đặt sân (USER)
 * TODO: 
 *   - Nhận venueId và courtId từ query params
 *   - Cho chọn ngày và khung giờ (từ CourtController.getAvailability)
 *   - Submit gọi BookingController.create()
 */
function BookingCreate() {
  const [searchParams] = useSearchParams();
  const venueId = searchParams.get('venueId');

  return (
    <div>
      <PageHeader
        title="📅 Đặt Sân"
        subtitle="Chọn thời gian và hoàn tất đặt sân"
      />
      <ComingSoon
        icon="📅"
        title="Luồng đặt sân đang được xây dựng"
        subtitle={`Dev 4 sẽ implement đầy đủ luồng chọn sân → chọn giờ → xác nhận tại đây. VenueId: ${venueId || 'chưa chọn'}`}
      />
    </div>
  );
}

export default BookingCreate;
