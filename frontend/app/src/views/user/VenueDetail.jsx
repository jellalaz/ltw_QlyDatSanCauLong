import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import VenueController from '../../controllers/VenueController';
import ReviewController from '../../controllers/ReviewController';
import CourtController from '../../controllers/CourtController';
import UserController from '../../controllers/UserController';
import '../../styles/Layout.css';

// ✅ Fix ngày: Instant từ Java có thể là số epoch giây hoặc string ISO
const formatReviewDate = (createdAt) => {
    if (!createdAt) return '';
    const ms = typeof createdAt === 'number' ? createdAt * 1000 : createdAt;
    return new Date(ms).toLocaleDateString('vi-VN');
};

const formatDateOnlySafe = (value) => {
    if (!value) return '';

    if (Array.isArray(value)) {
        const [y = 0, m = 1, d = 1, hh = 0, mm = 0, ss = 0] = value.map((n) => Number(n) || 0);
        if (y > 0) {
            return new Date(y, Math.max(0, m - 1), d, hh, mm, ss).toLocaleDateString('vi-VN');
        }
        return '';
    }

    if (typeof value === 'object' && !(value instanceof Date)) {
        const y = Number(value.year ?? 0);
        const m = Number(value.monthValue ?? value.month ?? 1);
        const d = Number(value.dayOfMonth ?? value.day ?? 1);
        const hh = Number(value.hour ?? 0);
        const mm = Number(value.minute ?? 0);
        const ss = Number(value.second ?? 0);
        if (y > 0) {
            return new Date(y, Math.max(0, m - 1), d, hh, mm, ss).toLocaleDateString('vi-VN');
        }
        return '';
    }

    return formatReviewDate(value);
};

function VenueDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [venue, setVenue] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courtLoading, setCourtLoading] = useState(true);
    const [error, setError] = useState('');
    const [courtError, setCourtError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replySubmitting, setReplySubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setCourtLoading(true);
                setCourtError('');
                const [venueData, reviewData, courtData] = await Promise.all([
                    VenueController.getById(id),
                    ReviewController.getByVenue(id),
                    CourtController.getByVenue(id),
                ]);
                let userData = null;
                try {
                    userData = await UserController.getCurrentUser();
                } catch {
                    userData = null;
                }
                if (isMounted) {
                    setVenue(venueData);
                    setReviews(reviewData);
                    setCourts(courtData);
                    setCurrentUser(userData);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err?.message || 'Không thể tải dữ liệu sân');
                    setCourtError('Không thể tải danh sách sân lẻ');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setCourtLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const isVenueOwner = !!(
        currentUser
        && venue
        && Number(currentUser.id) > 0
        && Number(venue.ownerId ?? venue.owner?.id ?? 0) > 0
        && Number(currentUser.id) === Number(venue.ownerId ?? venue.owner?.id)
    );

    const hasOwnerReply = (review) => !!String(review?.ownerReply || '').trim();

    const handleStartReply = (reviewId) => {
        setReplyingId(reviewId);
        setReplyText('');
    };

    const handleCancelReply = () => {
        setReplyingId(null);
        setReplyText('');
    };

    const handleSubmitReply = async (reviewId) => {
        if (!replyText.trim()) {
            alert('Vui lòng nhập nội dung phản hồi');
            return;
        }
        try {
            setReplySubmitting(true);
            const updated = await ReviewController.reply(reviewId, replyText);
            setReviews((prev) => prev.map((r) => (r.id === reviewId
                ? {
                    ...r,
                    ownerReply: String(updated?.ownerReply || replyText).trim(),
                    updatedAt: updated?.updatedAt || new Date().toISOString(),
                }
                : r)));
            setReplyingId(null);
            setReplyText('');
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || 'Không thể gửi phản hồi');
        } finally {
            setReplySubmitting(false);
        }
    };

    const addressText = useMemo(() => {
        if (!venue?.address) return '';
        const { detailAddress, district, provinceOrCity, street, city } = venue.address;
        return [detailAddress || street, district, provinceOrCity || city].filter(Boolean).join(', ');
    }, [venue]);

    const ratingText = useMemo(() => {
        if (!venue) return '0.0';
        if (venue.rating && venue.reviewCount) return venue.rating.toFixed(1);
        if (!reviews.length) return '0.0';
        const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        return (total / reviews.length).toFixed(1);
    }, [venue, reviews]);

    const reviewCount = venue?.reviewCount ?? reviews.length;

    const venueImages = useMemo(() => {
        const images = Array.isArray(venue?.images) ? venue.images.filter(Boolean) : [];
        if (images.length) return images;
        return venue?.imageUrl ? [venue.imageUrl] : [];
    }, [venue]);

    const galleryItems = useMemo(() => {
        const courtImages = courts
            .filter((court) => court.imageUrl)
            .map((court) => ({
                id: `court-${court.id}`,
                url: court.imageUrl,
                title: court.name || `Sân ${court.id}`,
            }));

        if (courtImages.length > 0) return courtImages;

        return venueImages.map((url, index) => ({
            id: `venue-${index}`,
            url,
            title: venue?.name || `Ảnh sân ${index + 1}`,
        }));
    }, [courts, venue?.name, venueImages]);

    if (loading) {
        return <div className="card"><div className="card-body">Đang tải dữ liệu...</div></div>;
    }

    if (error) {
        return <div className="card"><div className="card-body">{error}</div></div>;
    }

    if (!venue) {
        return <div className="card"><div className="card-body">Không tìm thấy sân.</div></div>;
    }

    return (
        <div>
            <PageHeader
                title={venue.name}
                subtitle={addressText ? `📍 ${addressText}` : '📍 Chưa có địa chỉ'}
                actions={
                    <button className="btn btn-secondary" onClick={() => navigate('/venues')}>
                        ← Quay lại
                    </button>
                }
            />

            {/* Info Card */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Mô tả</p>
                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>{venue.description || 'Chưa có mô tả'}</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Giờ mở cửa</p>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                🕐 {venue.openTime || '--:--'} – {venue.closeTime || '--:--'}
                            </p>
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                        <button className="btn btn-primary" onClick={() => navigate(`/bookings/new?venueId=${id}`)}>
                            📅 Đặt sân ngay
                        </button>
                    </div>
                </div>
            </div>

            {/* Venue/Court Images Section */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <h3 className="card-title">Hình ảnh sân</h3>
                </div>
                <div className="card-body">
                    {courtLoading ? (
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Đang tải hình ảnh sân...</p>
                    ) : courtError ? (
                        <p style={{ margin: 0, fontSize: '14px', color: '#dc2626' }}>{courtError}</p>
                    ) : galleryItems.length === 0 ? (
                        <div style={{ height: '220px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '48px' }}>
                            🏸
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                            {galleryItems.map((item) => (
                                <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                                    <img
                                        src={item.url}
                                        alt={item.title}
                                        style={{ width: '100%', height: '170px', objectFit: 'cover' }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Đánh giá ({reviewCount})</h3>
                    <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>⭐ {ratingText}</span>
                </div>
                <div className="card-body">
                    {reviews.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Chưa có đánh giá nào.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {reviews.map((review) => (
                                <div key={review.id} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong style={{ fontSize: '14px' }}>{review.authorName || review.userFullname || 'Người dùng'}</strong>
                                        {/* ✅ Sửa: format ngày đúng */}
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {formatReviewDate(review.createdAt)}
                    </span>
                                    </div>
                                    <div style={{ marginTop: '6px', color: '#f59e0b', fontWeight: '600', fontSize: '13px' }}>
                                        {'⭐'.repeat(review.rating || 0)}
                                        <span style={{ marginLeft: '6px', color: 'var(--text-secondary)' }}>{review.rating || 0}/5</span>
                                    </div>
                                    <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--text-primary)' }}>{review.comment}</p>

                                    {hasOwnerReply(review) && (
                                        <div style={{ marginTop: '10px', padding: '10px', background: '#f3f4f6', borderLeft: '3px solid #3b82f6', borderRadius: '6px' }}>
                                            <strong style={{ fontSize: '13px', color: '#1d4ed8' }}>↪ Phản hồi từ chủ sân:</strong>
                                            <div style={{ marginTop: '3px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                Ngày phản hồi: {formatDateOnlySafe(review.updatedAt) || formatDateOnlySafe(review.createdAt) || formatDateOnlySafe(new Date())}
                                            </div>
                                            <p style={{ margin: '4px 0 0', fontSize: '14px' }}>{review.ownerReply}</p>
                                        </div>
                                    )}

                                    {isVenueOwner && !hasOwnerReply(review) && replyingId !== review.id && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            style={{ marginTop: '8px' }}
                                            onClick={() => handleStartReply(review.id)}
                                        >
                                            Phản hồi
                                        </button>
                                    )}

                                    {isVenueOwner && replyingId === review.id && (
                                        <div style={{ marginTop: '8px' }}>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                placeholder="Nhập phản hồi của bạn..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                            />
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleSubmitReply(review.id)}
                                                    disabled={replySubmitting}
                                                >
                                                    {replySubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={handleCancelReply}
                                                    disabled={replySubmitting}
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VenueDetail;

