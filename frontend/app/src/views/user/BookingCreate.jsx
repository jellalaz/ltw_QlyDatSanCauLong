import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import VenueController from '../../controllers/VenueController';
import CourtController from '../../controllers/CourtController';
import BookingController from '../../controllers/BookingController';
import '../../styles/Layout.css';

/**
 * BookingCreate - Luồng tạo đơn đặt sân (USER)
 * TODO: 
 *   - Nhận venueId và courtId từ query params
 *   - Cho chọn ngày và khung giờ (từ CourtController.getAvailability)
 *   - Submit gọi BookingController.create()
 */
const pad = (value) => String(value).padStart(2, '0');

const normalizeTime = (timeValue) => {
  if (timeValue == null) return '00:00:00';

  // Spring/Jackson can serialize LocalTime as [hour, minute, second, nano]
  if (Array.isArray(timeValue)) {
    const [hours = 0, minutes = 0, seconds = 0] = timeValue;
    return `${pad(Number(hours) || 0)}:${pad(Number(minutes) || 0)}:${pad(Number(seconds) || 0)}`;
  }

  if (typeof timeValue === 'object') {
    const hours = Number(timeValue.hour ?? timeValue.hours ?? 0);
    const minutes = Number(timeValue.minute ?? timeValue.minutes ?? 0);
    const seconds = Number(timeValue.second ?? timeValue.seconds ?? 0);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  if (typeof timeValue === 'number') {
    return `${pad(timeValue)}:00:00`;
  }

  const text = String(timeValue).trim();
  if (!text) return '00:00:00';
  if (text.length === 2) return `${text}:00:00`;
  if (text.length === 5) return `${text}:00`;
  return text;
};

const toMinutes = (timeValue) => {
  const [hours, minutes] = normalizeTime(timeValue).split(':').map(Number);
  return (hours * 60) + minutes;
};

const minuteToHHMM = (totalMinutes) => `${pad(Math.floor(totalMinutes / 60))}:${pad(totalMinutes % 60)}`;

const toDateTime = (date, time) => `${date}T${normalizeTime(time)}`;

const isPastDateTimeSlot = (date, slotStart) => {
  if (!date || !slotStart) return false;
  const slotDateTime = new Date(toDateTime(date, slotStart));
  if (Number.isNaN(slotDateTime.getTime())) return false;
  return slotDateTime.getTime() < Date.now();
};

const buildTimeSlots = (openTime, closeTime) => {
  const start = toMinutes(openTime);
  const end = toMinutes(closeTime);
  const slots = [];

  for (let cursor = start; cursor < end; cursor += 30) {
    const next = cursor + 30;
    if (next > end) break;
    const startLabel = minuteToHHMM(cursor);
    const endLabel = minuteToHHMM(next);
    slots.push({
      key: startLabel,
      start: startLabel,
      end: endLabel,
      label: `${startLabel} - ${endLabel}`,
    });
  }

  return slots;
};

const rangesOverlap = (slotStart, slotEnd, bookedStart, bookedEnd) => slotStart < bookedEnd && slotEnd > bookedStart;

function BookingCreate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const venueId = searchParams.get('venueId');
  const initialCourtId = searchParams.get('courtId');

  const currentYear = new Date().getFullYear();
  const minDate = `${currentYear}-01-01`;
  const maxDate = `${currentYear}-12-31`;
  const defaultDate = (() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    return now.getFullYear() === currentYear ? today : minDate;
  })();

  const [venue, setVenue] = useState(null);
  const [courts, setCourts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedSlotsByCourt, setSelectedSlotsByCourt] = useState(() => (
    initialCourtId ? { [String(initialCourtId)]: [] } : {}
  ));
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlotMap, setBookedSlotMap] = useState({});
  const [pricePerHour, setPricePerHour] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadBaseData = async () => {
      if (!venueId) {
        setError('Thiếu venueId, vui lòng quay lại trang chi tiết sân.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [venueData, courtData] = await Promise.all([
          VenueController.getById(venueId),
          CourtController.getByVenue(venueId),
        ]);

        if (!active) return;

        setVenue(venueData);
        setCourts(courtData);

      } catch (err) {
        if (active) {
          setError(err?.message || 'Không thể tải dữ liệu đặt sân.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadBaseData();
    return () => {
      active = false;
    };
  }, [venueId, initialCourtId]);

  useEffect(() => {
    let active = true;

    const loadAvailability = async () => {
      if (!venueId || !selectedDate) return;

      try {
        setError('');
        const availability = await CourtController.getVenueAvailability(
          venueId,
          `${selectedDate}T00:00:00`,
          `${selectedDate}T23:59:59`,
        );

        if (!active) return;

        const slots = buildTimeSlots(
          availability.openingTime || venue?.openTime || '05:00:00',
          availability.closingTime || venue?.closeTime || '23:00:00',
        );
        const nextCourts = Array.isArray(availability.courts)
          ? availability.courts.map((court) => ({
            ...court,
            name: court.name || `Sân ${court.id}`,
            isActive: court.isActive ?? true,
          }))
          : [];

        const nextBookedSlotMap = {};
        nextCourts.forEach((court) => {
          const bookedSlots = Array.isArray(court.bookedSlots) ? court.bookedSlots : [];
          const blocked = new Set();

          bookedSlots.forEach((booked) => {
            const start = new Date(booked.startTime);
            const end = new Date(booked.endTime);
            const bookedStart = (start.getHours() * 60) + start.getMinutes();
            const bookedEnd = (end.getHours() * 60) + end.getMinutes();

            slots.forEach((slot) => {
              if (rangesOverlap(toMinutes(slot.start), toMinutes(slot.end), bookedStart, bookedEnd)) {
                blocked.add(slot.key);
              }
            });
          });

          nextBookedSlotMap[String(court.id)] = blocked;
        });

        setPricePerHour(Number(availability.pricePerHour) || 0);
        setTimeSlots(slots);
        setCourts(nextCourts);
        setBookedSlotMap(nextBookedSlotMap);
        setSelectedSlotsByCourt({});
      } catch (err) {
        if (active) {
          setError(err?.message || 'Không thể tải lịch trống theo ngày đã chọn.');
        }
      }
    };

    loadAvailability();
    return () => {
      active = false;
    };
  }, [venueId, selectedDate, venue?.openTime, venue?.closeTime]);

  const selectedCellsCount = useMemo(
    () => Object.values(selectedSlotsByCourt).reduce((total, keys) => total + keys.length, 0),
    [selectedSlotsByCourt],
  );

  const bookingRanges = useMemo(() => {
    const slotIndexByKey = new Map(timeSlots.map((slot, index) => [slot.key, index]));
    const ranges = [];

    Object.entries(selectedSlotsByCourt).forEach(([courtId, slotKeys]) => {
      const indexes = slotKeys
        .map((key) => slotIndexByKey.get(key))
        .filter((index) => Number.isInteger(index))
        .sort((a, b) => a - b);

      if (indexes.length === 0) return;

      let groupStart = indexes[0];
      let groupEnd = indexes[0];

      for (let i = 1; i < indexes.length; i += 1) {
        const index = indexes[i];
        if (index === groupEnd + 1) {
          groupEnd = index;
          continue;
        }

        ranges.push({
          courtId,
          startSlot: timeSlots[groupStart],
          endSlot: timeSlots[groupEnd],
          slotCount: (groupEnd - groupStart) + 1,
        });
        groupStart = index;
        groupEnd = index;
      }

      ranges.push({
        courtId,
        startSlot: timeSlots[groupStart],
        endSlot: timeSlots[groupEnd],
        slotCount: (groupEnd - groupStart) + 1,
      });
    });

    return ranges.filter((range) => range.startSlot && range.endSlot);
  }, [selectedSlotsByCourt, timeSlots]);

  const courtPriceById = useMemo(() => {
    const map = new Map();
    courts.forEach((court) => {
      map.set(String(court.id), Number(court.pricePerHour) || 0);
    });
    return map;
  }, [courts]);

  const totalPrice = useMemo(() => {
    return bookingRanges.reduce((sum, range) => {
      const hourPrice = courtPriceById.get(String(range.courtId)) || pricePerHour || 0;
      return sum + (hourPrice * range.slotCount * 0.5);
    }, 0);
  }, [bookingRanges, courtPriceById, pricePerHour]);

  const toggleSlot = (courtId, slotKey, isDisabled) => {
    if (isDisabled) return;

    setError('');

    setSelectedSlotsByCourt((prev) => {
      const nextCourtId = String(courtId);
      const currentKeys = prev[nextCourtId] || [];
      const hasSlot = currentKeys.includes(slotKey);
      const nextKeys = hasSlot
        ? currentKeys.filter((item) => item !== slotKey)
        : [...currentKeys, slotKey].sort();

      const next = { ...prev };
      if (nextKeys.length === 0) {
        delete next[nextCourtId];
      } else {
        next[nextCourtId] = nextKeys;
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!venueId) {
      setError('Thiếu venueId, vui lòng quay lại trang chi tiết sân.');
      return;
    }

    if (bookingRanges.length === 0) {
      setError('Vui lòng chọn ít nhất 1 khung giờ 30 phút.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const createdBookings = [];

      for (const range of bookingRanges) {
        const startTime = toDateTime(selectedDate, range.startSlot.start);
        const endTime = toDateTime(selectedDate, range.endSlot.end);

        if (new Date(startTime).getTime() < Date.now()) {
          setError('Không thể đặt sân ở khung giờ đã qua. Vui lòng bỏ chọn ô quá khứ rồi thử lại.');
          setSubmitting(false);
          return;
        }

        const booking = await BookingController.create({
          venueId: Number(venueId),
          courtId: Number(range.courtId),
          startTime,
          endTime,
        });

        createdBookings.push(booking);
      }

      if (createdBookings.length === 1 && createdBookings[0]?.id) {
        navigate(`/bookings/${createdBookings[0].id}/payment`, {
          state: {
            booking: createdBookings[0],
            venueName: venue?.name,
            selectedDate,
            totalPrice,
          },
        });
      } else {
        navigate('/bookings');
      }
    } catch (err) {
      setError(err?.message || 'Không thể tạo đơn đặt sân. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!venueId) {
    return <div className="card"><div className="card-body">Thiếu thông tin venue. Vui lòng quay lại trang sân.</div></div>;
  }

  return (
    <div>
      <PageHeader
        title="📅 Đặt Sân"
        subtitle="Chọn nhiều sân con và nhiều ô 30 phút trực tiếp trên lưới"
        actions={
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
        }
      />

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ display: 'grid', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>{venue?.name || 'Đặt sân'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '6px', fontSize: '14px' }}>
              <span>Ngày đặt ({currentYear})</span>
              <input
                type="date"
                value={selectedDate}
                min={minDate}
                max={maxDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={submitting}
              />
            </label>
          </div>

          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Mỗi ô tương ứng 30 phút. Tổng tiền tự động cập nhật theo số ô đã chọn.
          </p>
          {loading && <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Đang tải dữ liệu sân và lịch trống...</p>}
          {error && <p style={{ margin: 0, fontSize: '14px', color: '#dc2626' }}>{error}</p>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">Lưới đặt sân (30 phút/ô)</h3>
        </div>
        <div className="card-body">
          {courts.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Cụm sân này chưa có sân con để đặt lịch.</p>
          ) : timeSlots.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Chưa có dữ liệu khung giờ cho ngày đã chọn.</p>
          ) : (
            <div className="booking-grid-wrapper">
              <table className="booking-grid-table">
                <thead>
                  <tr>
                    <th className="booking-grid-court-col booking-grid-corner-cell">
                      <span className="booking-grid-corner-top">Giờ bắt đầu</span>
                      <span className="booking-grid-corner-bottom">Sân con</span>
                    </th>
                    {timeSlots.map((slot) => (
                      <th key={slot.key}>{slot.start}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courts.map((court, index) => {
                    const courtId = String(court.id);
                    const blockedSet = bookedSlotMap[courtId] || new Set();
                    const courtLabel = `Sân ${index + 1}`;

                    return (
                      <tr key={court.id}>
                        <th className="booking-grid-court-col">{courtLabel}</th>
                        {timeSlots.map((slot) => {
                          const isInactive = court.isActive === false;
                          const isBooked = blockedSet.has(slot.key);
                          const isPast = isPastDateTimeSlot(selectedDate, slot.start);
                          const isSelected = (selectedSlotsByCourt[courtId] || []).includes(slot.key);
                          const isDisabled = isInactive || isBooked || submitting || isPast;

                          return (
                            <td key={`${court.id}-${slot.key}`}>
                              <button
                                type="button"
                                className={`booking-slot-btn ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''} ${isInactive ? 'inactive' : ''} ${isPast ? 'past' : ''}`}
                                onClick={() => toggleSlot(court.id, slot.key, isDisabled)}
                                disabled={isDisabled}
                                title={isPast ? 'Khung giờ đã qua' : (isInactive ? 'Sân đang tạm ngưng hoạt động' : slot.label)}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Số ô đã chọn</p>
            <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 700 }}>{selectedCellsCount} ô (30 phút/ô)</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Tổng tiền tạm tính</p>
            <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 700, color: '#059669' }}>
              {new Intl.NumberFormat('vi-VN').format(totalPrice)}đ
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || loading || bookingRanges.length === 0}>
            {submitting ? 'Đang tạo đơn...' : 'Đặt sân và sang thanh toán'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingCreate;
