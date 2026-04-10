import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import VenueController from '../../controllers/VenueController';
import '../../styles/Layout.css';

/**
 * VenueManage - Quản lý danh sách cụm sân của OWNER
 * TODO: Gọi VenueController.getMyVenues() để lấy danh sách
 *       Implement xóa: VenueController.delete(id)
 */
function VenueManage() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadMyVenues = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await VenueController.getMyVenues();
        if (active) {
          setVenues(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách cụm sân.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMyVenues();
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (venueId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa cụm sân này?');
    if (!confirmed) return;

    try {
      await VenueController.delete(venueId);
      setVenues((prev) => prev.filter((item) => item.id !== venueId));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể xóa cụm sân.');
    }
  };

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
          <table className="table" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '24%' }} />
              <col style={{ width: '38%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '28%' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Tên cụm sân</th>
                <th style={{ textAlign: 'center' }}>Địa chỉ</th>
                <th style={{ textAlign: 'center' }}>Số sân</th>
                <th style={{ textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#dc2626' }}>{error}</td>
                </tr>
              )}
              {!loading && !error && venues.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Bạn chưa có cụm sân nào. Bấm "Thêm cụm sân" để bắt đầu.</td>
                </tr>
              )}
              {!loading && !error && venues.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600, textAlign: 'center', verticalAlign: 'middle' }}>{v.name}</td>
                  <td style={{ color: 'var(--text-secondary)', textAlign: 'center', verticalAlign: 'middle', wordBreak: 'break-word' }}>
                    📍 {v.address?.detailAddress}, {v.address?.district}, {v.address?.provinceOrCity}
                  </td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{v.courtsCount || 0} sân</td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/owner/venues/${v.id}/courts`)}>
                        🏸 Quản lý sân
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/owner/venues/${v.id}/edit`)}>
                        ✏️ Sửa
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>
                        🗑️ Xóa
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
