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
public class CourtAvailabilityDTO {
    private Long courtId;
    private Boolean available;
    private List<BookedSlotDTO> bookedSlots;
}

