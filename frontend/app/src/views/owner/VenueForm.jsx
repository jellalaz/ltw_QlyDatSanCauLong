import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import VenueController from '../../controllers/VenueController';
import CourtController from '../../controllers/CourtController';
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
  const { id, venueId } = useParams();
  const editingVenueId = id || venueId;
  const isEdit = mode === 'edit';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [courtDescription, setCourtDescription] = useState('');
  const [courtQuantity, setCourtQuantity] = useState(1);
  const [form, setForm] = useState({
    name: '',
    description: '',
    phoneNumber: '',
    email: '',
    pricePerHour: '',
    openingTime: '06:00',
    closingTime: '23:00',
    provinceOrCity: '',
    district: '',
    detailAddress: '',
  });

  const apiOrigin = useMemo(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    return apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl;
  }, []);

  const toImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${apiOrigin}${url}`;
  };

  useEffect(() => {
    let active = true;

    const loadVenue = async () => {
      if (!isEdit || !editingVenueId) return;
      try {
        setLoading(true);
        const venue = await VenueController.getById(editingVenueId);
        if (!active) return;

        setForm({
          name: venue.name || '',
          description: venue.description || '',
          phoneNumber: venue.phoneNumber || '',
          email: venue.email || '',
          pricePerHour: venue.pricePerHour || '',
          openingTime: (venue.openTime || '06:00:00').slice(0, 5),
          closingTime: (venue.closeTime || '23:00:00').slice(0, 5),
          provinceOrCity: venue.address?.provinceOrCity || '',
          district: venue.address?.district || '',
          detailAddress: venue.address?.detailAddress || '',
        });
        setExistingImages(Array.isArray(venue.images) ? venue.images : []);
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || err?.message || 'Không thể tải dữ liệu cụm sân.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadVenue();
    return () => {
      active = false;
    };
  }, [editingVenueId, isEdit]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Tên cơ sở không được để trống.';
    if (!form.provinceOrCity.trim() || !form.district.trim() || !form.detailAddress.trim()) {
      return 'Vui lòng nhập đầy đủ địa chỉ (Tỉnh/Thành, Quận/Huyện, Địa chỉ chi tiết).';
    }
    if (!isEdit && !form.phoneNumber.trim()) return 'Số điện thoại không được để trống.';
    if (!isEdit && (!form.pricePerHour || Number(form.pricePerHour) <= 0)) return 'Giá theo giờ phải lớn hơn 0.';
    if (!isEdit && (!courtQuantity || Number(courtQuantity) < 1)) return 'Số lượng sân lẻ phải từ 1 trở lên.';
    if (!form.openingTime || !form.closingTime) return 'Vui lòng chọn giờ mở và giờ đóng cửa.';
    if (form.openingTime >= form.closingTime) return 'Giờ đóng cửa phải lớn hơn giờ mở cửa.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      phoneNumber: form.phoneNumber || undefined,
      email: form.email || undefined,
      pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : undefined,
      openingTime: `${form.openingTime}:00`,
      closingTime: `${form.closingTime}:00`,
      address: {
        provinceOrCity: form.provinceOrCity,
        district: form.district,
        detailAddress: form.detailAddress,
      },
    };

    try {
      setSaving(true);
      const savedVenue = isEdit
        ? await VenueController.update(editingVenueId, payload)
        : await VenueController.create(payload);

      const savedVenueId = savedVenue?.id || editingVenueId;
      if (newImages.length > 0 && savedVenueId) {
        await VenueController.uploadImages(savedVenueId, newImages);
      }

      const addingCourts = Number(courtQuantity) > 0;
      if (savedVenueId && addingCourts) {
        const total = Math.max(0, Number(courtQuantity) || 0);
        for (let index = 0; index < total; index += 1) {
          await CourtController.create({
            venueId: Number(savedVenueId),
            description: total > 1
              ? `${courtDescription || 'Sân tiêu chuẩn'} #${index + 1}`
              : courtDescription,
          });
        }
      }

      const suffix = Number(courtQuantity) > 0 ? ` và ${Number(courtQuantity)} sân lẻ` : '';
      setSuccess(isEdit ? `Cập nhật cụm sân thành công${suffix}.` : `Tạo cụm sân thành công${suffix}.`);
      setTimeout(() => {
        navigate(`/owner/venues/${savedVenueId}/courts`);
      }, 400);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể lưu cụm sân.');
    } finally {
      setSaving(false);
    }
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageUrl) => {
    if (!editingVenueId) return;
    try {
      const imagePathForDelete = (() => {
        if (!imageUrl) return imageUrl;
        if (imageUrl.startsWith('/api/')) return imageUrl;
        if (imageUrl.startsWith('/files/')) return `/api${imageUrl}`;

        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          try {
            const { pathname } = new URL(imageUrl);
            if (pathname.startsWith('/api/')) return pathname;
            if (pathname.startsWith('/files/')) return `/api${pathname}`;
            return pathname;
          } catch {
            return imageUrl;
          }
        }

        return imageUrl;
      })();

      await VenueController.deleteImage(editingVenueId, imagePathForDelete);
      setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể xóa ảnh.');
    }
  };

  return (
    <div>
      <PageHeader
        title={mode === 'create' ? '➕ Thêm Cụm Sân Mới' : '✏️ Chỉnh Sửa Cụm Sân'}
        subtitle={mode === 'create' ? 'Tạo cơ sở và tạo sân lẻ ngay trong 1 trang' : `Đang sửa cụm sân ID: ${editingVenueId}`}
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/owner/venues')}>
            ← Quay lại
          </button>
        }
      />

      <div className="card">
        <div className="card-body">
          {loading ? (
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="form-group">
                  <label className="form-label">Tên cơ sở *</label>
                  <input className="form-input" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá theo giờ (VND) {isEdit ? '' : '*'}</label>
                  <input type="number" min="0" className="form-input" value={form.pricePerHour} onChange={(e) => updateField('pricePerHour', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại {isEdit ? '' : '*'}</label>
                  <input className="form-input" value={form.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Giờ mở cửa *</label>
                  <input type="time" className="form-input" value={form.openingTime} onChange={(e) => updateField('openingTime', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Giờ đóng cửa *</label>
                  <input type="time" className="form-input" value={form.closingTime} onChange={(e) => updateField('closingTime', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tỉnh/Thành *</label>
                  <input className="form-input" value={form.provinceOrCity} onChange={(e) => updateField('provinceOrCity', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Quận/Huyện *</label>
                  <input className="form-input" value={form.district} onChange={(e) => updateField('district', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Địa chỉ chi tiết *</label>
                <input className="form-input" value={form.detailAddress} onChange={(e) => updateField('detailAddress', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả cơ sở</label>
                <textarea className="form-input" rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Ảnh giới thiệu </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="form-input"
                  onChange={(e) => setNewImages(Array.from(e.target.files || []))}
                />
              </div>

              <div className="form-group" style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px dashed var(--border)' }}>
                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Số lượng sân con cần thêm</label>
                    <input
                      type="number"
                      min={isEdit ? '0' : '1'}
                      max="20"
                      className="form-input"
                      value={courtQuantity}
                      onChange={(e) => setCourtQuantity(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Mô tả sân con ( có thể trống )</label>
                    <input
                      className="form-input"
                      value={courtDescription}
                      onChange={(e) => setCourtDescription(e.target.value)}
                      placeholder="Ví dụ: Sân tiêu chuẩn, thảm mới"
                    />
                  </div>
                </div>
                <p style={{ margin: '8px 0 0', color: '#1d4ed8', fontSize: '13px', fontWeight: 600 }}>
                  {isEdit
                    ? 'Để 0 nếu chỉ muốn cập nhật thông tin venue, không tạo thêm sân.'
                    : ""}
                </p>
              </div>

              {existingImages.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Ảnh hiện có</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                    {existingImages.map((imageUrl) => (
                      <div key={imageUrl} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '8px' }}>
                        <img src={toImageUrl(imageUrl)} alt="venue" style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px' }} />
                        <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: '8px', width: '100%' }} onClick={() => removeExistingImage(imageUrl)}>
                          Xóa ảnh
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newImages.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Ảnh sẽ upload</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                    {newImages.map((file, index) => (
                      <div key={`${file.name}-${index}`} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '8px' }}>
                        <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px' }} />
                        <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: '8px', width: '100%' }} onClick={() => removeNewImage(index)}>
                          Bỏ ảnh này
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <p style={{ color: '#dc2626', margin: '0 0 12px' }}>{error}</p>}
              {success && <p style={{ color: '#059669', margin: '0 0 12px' }}>{success}</p>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', maxWidth: '380px', marginLeft: 'auto' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/owner/venues')}
                  disabled={saving}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    lineHeight: 1,
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    margin: 0,
                    transform: 'none',
                    boxShadow: 'none',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    lineHeight: 1,
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    margin: 0,
                    transform: 'none',
                    boxShadow: 'none',
                    border: '1px solid transparent',
                  }}
                >
                  {saving ? 'Đang lưu...' : (isEdit ? 'Lưu venue + thêm sân lẻ' : 'Tạo')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default VenueForm;
