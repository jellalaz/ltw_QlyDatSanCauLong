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
public class VenueCourtAvailabilityDTO {
    private Long id;
    private String description;
    private Boolean isActive;
    private Boolean available;
    private List<BookedSlotDTO> bookedSlots;
}

