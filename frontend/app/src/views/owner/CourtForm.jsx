import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import CourtController from '../../controllers/CourtController';
import '../../styles/Layout.css';

/**
 * CourtForm - Form thêm mới / chỉnh sửa sân lẻ (OWNER)
 * @param {string} mode - 'create' | 'edit'
 * TODO: CourtController.create() hoặc CourtController.update()
 */
function CourtForm({ mode = 'create' }) {
  const { venueId, courtId } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let active = true;

    const loadCourt = async () => {
      if (!isEdit || !courtId) return;
      try {
        const court = await CourtController.getById(courtId);
        if (active) {
          setDescription(court?.description || '');
          setIsActive(court?.isActive !== false);
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || err?.message || 'Không thể tải thông tin sân.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCourt();
    return () => {
      active = false;
    };
  }, [courtId, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);

      if (isEdit && courtId) {
        await CourtController.update(courtId, { description, isActive });
        setSuccess('Cập nhật sân thành công.');
      } else {
        const total = Math.max(1, Number(quantity) || 1);
        for (let index = 0; index < total; index += 1) {
          await CourtController.create({
            venueId: Number(venueId),
            description: total > 1 ? `${description || 'Sân tiêu chuẩn'} #${index + 1}` : description,
            isActive,
          });
        }
        setSuccess(total > 1 ? `Đã tạo ${total} sân lẻ.` : 'Tạo sân lẻ thành công.');
      }

      setTimeout(() => {
        navigate(`/owner/venues/${venueId}/courts`);
      }, 350);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể lưu sân lẻ.');
    } finally {
      setSaving(false);
    }
  };

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

      <div className="card">
        <div className="card-body">
          {loading ? (
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Đang tải dữ liệu sân...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Mô tả sân</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Sân thảm tiêu chuẩn thi đấu, có điều hòa"
                />
              </div>

              {!isEdit && (
                <div className="form-group" style={{ maxWidth: '220px' }}>
                  <label className="form-label">Số lượng sân cần tạo</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="form-input"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group" style={{ maxWidth: '300px' }}>
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-input form-select"
                  value={isActive ? '1' : '0'}
                  onChange={(e) => setIsActive(e.target.value === '1')}
                >
                  <option value="1">Hoạt động</option>
                  <option value="0">Bảo trì</option>
                </select>
              </div>

              {error && <p style={{ color: '#dc2626', margin: '0 0 12px' }}>{error}</p>}
              {success && <p style={{ color: '#059669', margin: '0 0 12px' }}>{success}</p>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', marginLeft: 'auto' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(`/owner/venues/${venueId}/courts`)}
                  disabled={saving}
                  style={{ width: '100%', minHeight: '44px', justifyContent: 'center', boxSizing: 'border-box', margin: 0, transform: 'none' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ width: '100%', minHeight: '44px', justifyContent: 'center', boxSizing: 'border-box', margin: 0, transform: 'none' }}
                >
                  {saving ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Tạo sân')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourtForm;
