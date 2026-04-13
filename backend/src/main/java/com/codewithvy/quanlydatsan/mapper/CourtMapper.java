package com.codewithvy.quanlydatsan.mapper;

import com.codewithvy.quanlydatsan.dto.CourtDTO;
import com.codewithvy.quanlydatsan.model.Court;
import org.springframework.stereotype.Component;

@Component
public class CourtMapper {

    public CourtDTO toDto(Court court) {
        if (court == null) return null;
        return CourtDTO.builder()
                .id(court.getId())
                .description(court.getDescription())
                .isActive(court.getIsActive())
                .venueId(court.getVenues() != null ? court.getVenues().getId() : null)
                .build();
    }
}

