package com.codewithvy.quanlydatsan.service.court;

import com.codewithvy.quanlydatsan.dto.CourtRequest;
import com.codewithvy.quanlydatsan.dto.CourtDTO;
import com.codewithvy.quanlydatsan.dto.BookedSlotDTO;
import com.codewithvy.quanlydatsan.dto.CourtAvailabilityDTO;
import com.codewithvy.quanlydatsan.dto.TimeRangeDTO;
import com.codewithvy.quanlydatsan.dto.VenueCourtAvailabilityDTO;
import com.codewithvy.quanlydatsan.dto.VenueCourtDTO;
import com.codewithvy.quanlydatsan.dto.VenueCourtsAvailabilityResponseDTO;
import com.codewithvy.quanlydatsan.dto.VenuesDTO;
import com.codewithvy.quanlydatsan.mapper.CourtMapper;
import com.codewithvy.quanlydatsan.model.BookingItem;
import com.codewithvy.quanlydatsan.model.Court;
import com.codewithvy.quanlydatsan.model.Venues;
import com.codewithvy.quanlydatsan.repository.BookingItemRepository;
import com.codewithvy.quanlydatsan.repository.CourtRepository;
import com.codewithvy.quanlydatsan.repository.VenuesRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CourtService {

    private final CourtRepository courtRepository;
    private final VenuesRepository venuesRepository;
    private final BookingItemRepository bookingItemRepository;
    private final CourtMapper courtMapper;

    public CourtService(CourtRepository courtRepository,
                        VenuesRepository venuesRepository,
                        BookingItemRepository bookingItemRepository,
                        CourtMapper courtMapper) {
        this.courtRepository = courtRepository;
        this.venuesRepository = venuesRepository;
        this.bookingItemRepository = bookingItemRepository;
        this.courtMapper = courtMapper;
    }

    public List<CourtDTO> getAllCourts() {
        return courtRepository.findAll().stream().map(courtMapper::toDto).collect(Collectors.toList());
    }

    public Optional<CourtDTO> getCourtById(Long id) {
        return courtRepository.findById(id).map(courtMapper::toDto);
    }

    public Optional<CourtAvailabilityDTO> checkAvailability(Long courtId, LocalDateTime startTime, LocalDateTime endTime) {
        if (courtRepository.findById(courtId).isEmpty()) {
            return Optional.empty();
        }

        List<BookingItem> bookedSlots = bookingItemRepository.findBookedSlots(courtId, startTime, endTime);
        return Optional.of(CourtAvailabilityDTO.builder()
                .courtId(courtId)
                .available(bookedSlots.isEmpty())
                .bookedSlots(mapBookedSlots(bookedSlots))
                .build());
    }

    @Transactional
    public CourtDTO createCourt(CourtRequest request) {
        if (request.getVenueId() == null) {
            throw new IllegalArgumentException("venueId is required");
        }

        Venues venues = venuesRepository.findById(request.getVenueId())
                .orElseThrow(() -> new IllegalArgumentException("Venues not found"));

        Court court = new Court();
        court.setDescription(request.getDescription());
        court.setIsActive(request.getIsActive() == null ? Boolean.TRUE : request.getIsActive());
        court.setVenues(venues);

        return courtMapper.toDto(courtRepository.save(court));
    }

    @Transactional
    public Optional<CourtDTO> updateCourt(Long id, CourtRequest request) {
        return courtRepository.findById(id).map(court -> {
            if (request.getDescription() != null) {
                court.setDescription(request.getDescription());
            }
            if (request.getIsActive() != null) {
                court.setIsActive(request.getIsActive());
            }
            if (request.getVenueId() != null) {
                venuesRepository.findById(request.getVenueId()).ifPresent(court::setVenues);
            }
            return courtMapper.toDto(courtRepository.save(court));
        });
    }

    @Transactional
    public boolean deleteCourt(Long id) {
        if (courtRepository.findById(id).isEmpty()) {
            return false;
        }
        courtRepository.deleteById(id);
        return true;
    }

    public List<VenueCourtDTO> getCourtsByVenue(Long venueId, String venueName) {
        List<Court> courts = courtRepository.findByVenuesId(venueId);
        return courts.stream().map(court -> VenueCourtDTO.builder()
                .id(court.getId())
                .description(court.getDescription())
                .isActive(court.getIsActive())
                .venueId(venueId)
                .venueName(venueName)
                .build()).collect(Collectors.toList());
    }

    public VenueCourtsAvailabilityResponseDTO getCourtsWithAvailability(Long venueId,
                                                                        VenuesDTO venue,
                                                                        LocalDateTime startTime,
                                                                        LocalDateTime endTime) {
        List<Court> courts = courtRepository.findByVenuesId(venueId);

        List<VenueCourtAvailabilityDTO> courtsList = courts.stream().map(court -> {
            List<BookingItem> bookedSlots = bookingItemRepository.findBookedSlots(court.getId(), startTime, endTime);
            return VenueCourtAvailabilityDTO.builder()
                    .id(court.getId())
                    .description(court.getDescription())
                    .isActive(court.getIsActive())
                    .available(bookedSlots.isEmpty())
                    .bookedSlots(bookedSlots.isEmpty() ? new ArrayList<>() : mapBookedSlots(bookedSlots))
                    .build();
        }).collect(Collectors.toList());

        long availableCourts = courtsList.stream().filter(VenueCourtAvailabilityDTO::getAvailable).count();

        return VenueCourtsAvailabilityResponseDTO.builder()
                .venueId(venueId)
                .venueName(venue.getName())
                .openingTime(venue.getOpeningTime() != null ? venue.getOpeningTime().toString() : null)
                .closingTime(venue.getClosingTime() != null ? venue.getClosingTime().toString() : null)
                .pricePerHour(venue.getPricePerHour())
                .timeRange(TimeRangeDTO.builder().startTime(startTime).endTime(endTime).build())
                .courts(courtsList)
                .totalCourts(courtsList.size())
                .availableCourts(availableCourts)
                .build();
    }

    private List<BookedSlotDTO> mapBookedSlots(List<BookingItem> bookedSlots) {
        return bookedSlots.stream().map(slot -> BookedSlotDTO.builder()
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .bookingId(slot.getBooking().getId())
                .build()).collect(Collectors.toList());
    }
}


