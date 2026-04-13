package com.codewithvy.quanlydatsan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueCourtDTO {
    private Long id;
    private String description;
    private Boolean isActive;
    private Long venueId;
    private String venueName;
}

