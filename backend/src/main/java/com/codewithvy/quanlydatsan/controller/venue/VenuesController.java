package com.codewithvy.quanlydatsan.controller.venue;

import com.codewithvy.quanlydatsan.dto.ApiResponse;
import com.codewithvy.quanlydatsan.dto.VenueCourtDTO;
import com.codewithvy.quanlydatsan.dto.VenueCourtsAvailabilityResponseDTO;
import com.codewithvy.quanlydatsan.dto.VenuesDTO;
import com.codewithvy.quanlydatsan.dto.VenuesRequest;
import com.codewithvy.quanlydatsan.service.court.CourtService;
import com.codewithvy.quanlydatsan.service.venue.VenueMediaService;
import com.codewithvy.quanlydatsan.service.venue.VenuesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/venues")
@Tag(name = "Venues", description = "API quản lý địa điểm/sân thể thao")
public class VenuesController {
    private static final Logger log = LoggerFactory.getLogger(VenuesController.class);

    private final VenuesService venuesService;
    private final CourtService courtService;
    private final VenueMediaService venueMediaService;

    public VenuesController(VenuesService venuesService,
                            CourtService courtService,
                            VenueMediaService venueMediaService) {
        this.venuesService = venuesService;
        this.courtService = courtService;
        this.venueMediaService = venueMediaService;
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    @Operation(
        summary = "Ly danh sch tt c venues",
        description = "Tr v danh sch tt c cc venues trong h‡ th'ng"
    )
    public ResponseEntity<ApiResponse<List<VenuesDTO>>> getAllVenues() {
        return ResponseEntity.ok(ApiResponse.ok(venuesService.getAll(), "List venues"));
    }

    @GetMapping("/my-venues")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(
        summary = "Lấy danh sách venues của tôi",
        description = "Trả về danh sách các venues thuộc sở hữu của owner đang đăng nhập (yêu cầu ROLE_OWNER)",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ApiResponse<List<VenuesDTO>>> getMyVenues() {
        return ResponseEntity.ok(ApiResponse.ok(venuesService.getMyVenues(), "My venues"));
    }

    @GetMapping("/search")
    @PreAuthorize("permitAll()")
    @Operation(
        summary = "Tìm kiếm venues - 1 ô duy nhất",
        description = "Tìm kiếm venues trong tất cả các trường (tên, tỉnh, quận, địa chỉ) bằng 1 ô input duy nhất. Dễ sử dụng cho search box đơn giản."
    )
    public ResponseEntity<ApiResponse<List<VenuesDTO>>> searchVenues(
            @Parameter(description = "Từ khóa tìm kiếm (tìm trong tên, tỉnh, quận, địa chỉ)") @RequestParam(name = "q", required = false) String query) {
        List<VenuesDTO> results = venuesService.searchUnified(query);
        return ResponseEntity.ok(ApiResponse.ok(results, "Search results"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    @Operation(
        summary = "Lấy thông tin venue theo ID",
        description = "Trả về thông tin chi tiết của một venue"
    )
    public ResponseEntity<ApiResponse<VenuesDTO>> getVenuesById(
            @Parameter(description = "ID của venue", required = true) @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(venuesService.getById(id)));
    }

    @GetMapping("/{venueId}/courts")
    @PreAuthorize("permitAll()")
    @Operation(
        summary = "Lấy danh sách courts của venue (đơn giản)",
        description = "Trả về danh sách tất cả courts của venue (KHÔNG bao gồm thông tin availability/booked slots). Sử dụng khi chỉ cần hiển thị danh sách sân đơn giản."
    )
    public ResponseEntity<ApiResponse<List<VenueCourtDTO>>> getCourtsByVenue(
            @Parameter(description = "ID của venue", required = true) @PathVariable Long venueId) {

        VenuesDTO venue = venuesService.getById(venueId);
        List<VenueCourtDTO> courtsList = courtService.getCourtsByVenue(venueId, venue.getName());

        log.info("Returning {} courts for venue {}", courtsList.size(), venueId);

        return ResponseEntity.ok(ApiResponse.ok(courtsList, "Courts list"));
    }

    @GetMapping("/{venueId}/courts/availability")
    @PreAuthorize("permitAll()")
    @Operation(
        summary = "Lấy danh sách courts của venue với trạng thái availability",
        description = """
            Trả về danh sách tất cả courts của venue kèm theo trạng thái available/unavailable trong khoảng thời gian cụ thể
            
            ⏰ **THỜI GIAN:**
            - Format: `yyyy-MM-dd'T'HH:mm:ss` (VD: `2025-11-07T14:00:00`)
            - Múi giờ: Việt Nam (Asia/Ho_Chi_Minh, UTC+7)
            - **KHÔNG CẦN** thêm `Z` hoặc `+07:00`
            
            📅 **CHO FRONTEND:**
            - Response bao gồm `openingTime` và `closingTime` để frontend chia thành các ô 30 phút
            - `bookedSlots` chứa danh sách các slot đã được đặt
            - Frontend dựa vào 2 thông tin này để render lịch với trạng thái từng ô
            """
    )
    public ResponseEntity<ApiResponse<VenueCourtsAvailabilityResponseDTO>> getCourtsWithAvailability(
            @Parameter(description = "ID của venue", required = true)
            @PathVariable Long venueId,
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

        VenuesDTO venue = venuesService.getById(venueId);
        VenueCourtsAvailabilityResponseDTO responseData = courtService.getCourtsWithAvailability(venueId, venue, startTime, endTime);

        log.info("Checked availability for venue {}: {} courts, {} available, openingTime={}, closingTime={}",
            venueId, responseData.getTotalCourts(), responseData.getAvailableCourts(),
            venue.getOpeningTime(), venue.getClosingTime());

        return ResponseEntity.ok(ApiResponse.ok(responseData, "Courts with availability and venue info"));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    @Operation(
        summary = "Tạo venue mới",
        description = "Tạo một venue mới (yêu cầu ROLE_OWNER)",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ApiResponse<VenuesDTO>> createVenues(@Valid @RequestBody VenuesRequest request) {
        log.info("POST /api/venues - Request received: name={}, address={}",
            request.getName(),
            request.getAddress() != null ? request.getAddress().getProvinceOrCity() : "null");

        VenuesDTO created = venuesService.create(request);

        log.info("Venue created successfully with id: {}", created.getId());
        return ResponseEntity.ok(ApiResponse.ok(created, "Created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(
        summary = "Cập nhật venue",
        description = "Cập nhật thông tin venue theo ID (yêu cầu ROLE_OWNER)",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ApiResponse<VenuesDTO>> updateVenues(
            @Parameter(description = "ID của venue cần cập nhật", required = true) @PathVariable Long id,
            @RequestBody VenuesRequest request) {
        VenuesDTO updated = venuesService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(
        summary = "Xóa venue",
        description = "Xóa venue theo ID (yêu cầu ROLE_OWNER)",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ApiResponse<Void>> deleteVenues(
            @Parameter(description = "ID của venue cần xóa", required = true) @PathVariable Long id) {
        venuesService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Deleted"));
    }

    @PostMapping("/{id}/upload-images")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(
        summary = "Upload ảnh cho venue",
        description = "Upload một hoặc nhiều ảnh cho venue (yêu cầu ROLE_OWNER và phải là chủ sở hữu venue)",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ApiResponse<List<String>>> uploadVenueImages(
            @Parameter(description = "ID của venue", required = true) @PathVariable Long id,
            @Parameter(description = "Các file ảnh cần upload", required = true)
            @RequestParam("images") MultipartFile[] images) {
        log.info("POST /api/venues/{}/upload-images - Uploading {} images", id, images.length);
        List<String> uploadedUrls = venueMediaService.uploadVenueImages(id, images);

        log.info("Successfully uploaded {} images for venue id: {}", uploadedUrls.size(), id);
        return ResponseEntity.ok(ApiResponse.ok(uploadedUrls, "Images uploaded successfully"));
    }

    @DeleteMapping("/{id}/delete-image")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(
        summary = "Xóa ảnh của venue",
        description = "Xóa một ảnh cụ thể của venue (yêu cầu ROLE_OWNER và phải là chủ sở hữu venue)",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ApiResponse<Void>> deleteVenueImage(
            @Parameter(description = "ID của venue", required = true) @PathVariable Long id,
            @Parameter(description = "URL của ảnh cần xóa", required = true)
            @RequestParam("imageUrl") String imageUrl) {
        log.info("DELETE /api/venues/{}/delete-image - Deleting image: {}", id, imageUrl);
        venueMediaService.deleteVenueImage(id, imageUrl);
        log.info("Successfully deleted image for venue id: {}", id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Image deleted successfully"));
    }
}

