import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import CourtController from '../../controllers/CourtController';
import VenueController from '../../controllers/VenueController';
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
  const [venueName, setVenueName] = useState('');
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      if (!venueId) return;
      try {
        setLoading(true);
        setError('');

        const [venue, courtData] = await Promise.all([
          VenueController.getById(venueId),
          CourtController.getByVenue(venueId),
        ]);

        if (!active) return;
        setVenueName(venue?.name || '');
        setCourts(Array.isArray(courtData) ? courtData : []);
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách sân lẻ.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [venueId]);

  const handleDelete = async (courtId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa sân lẻ này?');
    if (!confirmed) return;

    try {
      await CourtController.delete(courtId);
      setCourts((prev) => prev.filter((court) => court.id !== courtId));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể xóa sân lẻ.');
    }
  };

  return (
    <div>
      <PageHeader
        title="🏸 Quản Lý Sân Lẻ"
        subtitle={venueName ? `Venue: ${venueName}` : `Các sân lẻ trong cụm sân ID: ${venueId}`}
        actions={
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', maxWidth: '560px', minWidth: '420px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/owner/venues')} style={{ width: '100%', height: '44px', padding: '0 16px', lineHeight: 1, justifyContent: 'center', boxSizing: 'border-box', margin: 0, transform: 'none', boxShadow: 'none' }}>
              ← Quay lại
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/owner/venues/${venueId}/edit`)} style={{ width: '100%', height: '44px', padding: '0 16px', lineHeight: 1, justifyContent: 'center', boxSizing: 'border-box', margin: 0, transform: 'none', boxShadow: 'none', border: '1px solid transparent' }}>
              + Thêm sân
            </button>
          </div>
        }
      />

      <div className="card">
        <div className="table-wrapper">
          <table className="table" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '16%' }} />
              <col style={{ width: '40%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Sân</th>
                <th style={{ textAlign: 'center' }}>Mô tả</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tải danh sách sân...</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#dc2626' }}>{error}</td>
                </tr>
              )}
              {!loading && !error && courts.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Venue chưa có sân lẻ nào. Bấm "Thêm sân" để tạo mới.</td>
                </tr>
              )}
              {!loading && !error && courts.map((court, index) => (
                <tr key={court.id}>
                  <td style={{ fontWeight: 600, textAlign: 'center', verticalAlign: 'middle' }}>{`Sân ${index + 1}`}</td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', wordBreak: 'break-word' }}>{court.description || 'Chưa có mô tả'}</td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    {court.isActive ? (
                      <span className="badge badge-success">Hoạt động</span>
                    ) : (
                      <span className="badge" style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fca5a5' }}>Bảo trì</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/owner/venues/${venueId}/courts/${court.id}/edit`)}>
                        ✏️ Sửa
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(court.id)}>
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

export default CourtManage;
