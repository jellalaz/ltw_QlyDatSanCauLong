import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import AdminService from '../../services/AdminService';
import '../../styles/Layout.css';

/**
 * VenueModerate - Kiểm duyệt cụm sân toàn hệ thống (ADMIN)
 * Hiện hỗ trợ: xem danh sách venues + xóa venue
 */
function VenueModerate() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadVenues = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await AdminService.getVenues();
      setVenues(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Không thể tải danh sách venues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const filteredVenues = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return venues;

    return venues.filter((v) => {
      const district = v?.address?.district || '';
      const city = v?.address?.provinceOrCity || '';
      return [v.name, district, city]
        .some((field) => String(field || '').toLowerCase().includes(keyword));
    });
  }, [venues, search]);

  const handleDelete = async (venueId) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa venue này?');
    if (!confirmDelete) return;

    try {
      setDeletingId(venueId);
      await AdminService.deleteVenue(venueId);
      await loadVenues();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Xóa venue thất bại');
    } finally {
      setDeletingId(null);
    }
  };

  const statusMap = {
    ACTIVE: { label: 'Đang hoạt động', cls: 'badge-success' },
    INACTIVE: { label: 'Ngừng hoạt động', cls: 'badge-default' },
  };

  return (
    <div>
      <PageHeader
        title="🏟️ Kiểm Duyệt Cụm Sân"
        subtitle="Phê duyệt, ẩn hoặc xóa các cụm sân trong hệ thống"
      />

      <div style={{ marginBottom: '16px' }}>
        <div className="search-bar">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên venue, quận/huyện, tỉnh/thành..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div style={{ marginBottom: '12px' }} className="badge badge-danger">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="card-body">Đang tải danh sách venues...</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Tên cụm sân</th>
                  <th>Số sân</th>
                  <th>Địa chỉ</th>
                  <th>Giá/giờ</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredVenues.map((v) => {
                  const isActive = (v.numberOfCourt || 0) > 0;
                  const status = isActive ? statusMap.ACTIVE : statusMap.INACTIVE;
                  const address = [v?.address?.detailAddress, v?.address?.district, v?.address?.provinceOrCity]
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <tr key={v.id}>
                      <td style={{ fontWeight: '600' }}>{v.name}</td>
                      <td>{v.numberOfCourt || 0}</td>
                      <td>📍 {address || '-'}</td>
                      <td>{(v.pricePerHour || 0).toLocaleString('vi-VN')}đ</td>
                      <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={deletingId === v.id}
                          onClick={() => handleDelete(v.id)}
                        >
                          {deletingId === v.id ? 'Đang xóa...' : '🗑 Xóa'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default VenueModerate;
