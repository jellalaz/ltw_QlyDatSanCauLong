package com.codewithvy.quanlydatsan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueCourtsAvailabilityResponseDTO {
    private Long venueId;
    private String venueName;
    private String openingTime;
    private String closingTime;
    private Double pricePerHour;
    private TimeRangeDTO timeRange;
    private List<VenueCourtAvailabilityDTO> courts;
    private Integer totalCourts;
    private Long availableCourts;
}

