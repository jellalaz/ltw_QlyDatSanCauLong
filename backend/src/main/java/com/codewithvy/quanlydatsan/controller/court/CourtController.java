package com.codewithvy.quanlydatsan.controller.court;

import com.codewithvy.quanlydatsan.dto.CourtRequest;
import com.codewithvy.quanlydatsan.dto.CourtAvailabilityDTO;
import com.codewithvy.quanlydatsan.dto.CourtDTO;
import com.codewithvy.quanlydatsan.service.court.CourtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/courts")
public class CourtController {
    private final CourtService courtService;

    public CourtController(CourtService courtService) {
        this.courtService = courtService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<CourtDTO> getAllCourts() {
        return courtService.getAllCourts();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CourtDTO> getCourtById(@PathVariable Long id) {
        Optional<CourtDTO> court = courtService.getCourtById(id);
        return court.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * API mới: Kiểm tra lịch trống của sân trong khoảng thời gian
     * GET /api/courts/{id}/availability?startTime=...&endTime=...
     */
    @GetMapping("/{id}/availability")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Kiểm tra availability của court trong khoảng thời gian",
        description = """
            Trả về trạng thái available/unavailable của court cụ thể trong khoảng thời gian
            
            ⏰ **THỜI GIAN:**
            - Format: `yyyy-MM-dd'T'HH:mm:ss` (VD: `2025-11-07T14:00:00`)
            - Múi giờ: Việt Nam (Asia/Ho_Chi_Minh, UTC+7)
            - **KHÔNG CẦN** thêm `Z` hoặc `+07:00`
            """,
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<CourtAvailabilityDTO> checkAvailability(
            @Parameter(description = "ID của court", required = true)
            @PathVariable Long id,
            @Parameter(
                description = "Thời gian bắt đầu kiểm tra (Giờ Việt Nam)",
                required = true,
                example = "2025-11-07T14:00:00"
            )
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(
                description = "Thời gian kết thúc kiểm tra (Giờ Việt Nam)",
                required = true,
                example = "2025-11-07T15:00:00"
            )
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return courtService.checkAvailability(id, startTime, endTime)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<CourtDTO> createCourt(@RequestBody CourtRequest request) {
        return ResponseEntity.ok(courtService.createCourt(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<CourtDTO> updateCourt(@PathVariable Long id, @RequestBody CourtRequest request) {
        return courtService.updateCourt(id, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteCourt(@PathVariable Long id) {
        if (!courtService.deleteCourt(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}

