package com.codewithvy.quanlydatsan.service.venue;

import com.codewithvy.quanlydatsan.dto.VenuesDTO;
import com.codewithvy.quanlydatsan.dto.VenuesRequest;
import com.codewithvy.quanlydatsan.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class VenueMediaService {

    private final VenuesService venuesService;
    private final FileStorageService fileStorageService;

    public VenueMediaService(VenuesService venuesService, FileStorageService fileStorageService) {
        this.venuesService = venuesService;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public List<String> uploadVenueImages(Long venueId, MultipartFile[] images) {
        VenuesDTO venue = venuesService.getById(venueId);

        List<String> uploadedUrls = new ArrayList<>();
        for (MultipartFile image : images) {
            if (!image.isEmpty()) {
                String imageUrl = fileStorageService.saveVenueImage(image, venueId);
                uploadedUrls.add(imageUrl);
            }
        }

        VenuesRequest updateRequest = new VenuesRequest();
        List<String> currentImages = venue.getImages() != null ? new ArrayList<>(venue.getImages()) : new ArrayList<>();
        currentImages.addAll(uploadedUrls);
        updateRequest.setImages(currentImages);
        venuesService.update(venueId, updateRequest);

        return uploadedUrls;
    }

    @Transactional
    public void deleteVenueImage(Long venueId, String imageUrl) {
        VenuesDTO venue = venuesService.getById(venueId);

        List<String> currentImages = venue.getImages() != null ? new ArrayList<>(venue.getImages()) : new ArrayList<>();
        String normalizedTarget = normalizeVenueImagePath(imageUrl);

        int removeIndex = -1;
        for (int i = 0; i < currentImages.size(); i++) {
            String existing = currentImages.get(i);
            if (Objects.equals(normalizeVenueImagePath(existing), normalizedTarget)) {
                removeIndex = i;
                break;
            }
        }

        if (removeIndex < 0) {
            throw new IllegalArgumentException("Image not found in venue");
        }

        String removedImage = currentImages.remove(removeIndex);

        VenuesRequest updateRequest = new VenuesRequest();
        updateRequest.setImages(currentImages);
        venuesService.update(venueId, updateRequest);

        fileStorageService.deleteVenueImage(removedImage);
    }

    private String normalizeVenueImagePath(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return "";
        }

        String normalized = imageUrl.trim().replace("\\", "/");
        int queryIndex = normalized.indexOf('?');
        if (queryIndex >= 0) {
            normalized = normalized.substring(0, queryIndex);
        }

        int hashIndex = normalized.indexOf('#');
        if (hashIndex >= 0) {
            normalized = normalized.substring(0, hashIndex);
        }

        int protocolIndex = normalized.indexOf("://");
        if (protocolIndex > 0) {
            int pathIndex = normalized.indexOf('/', protocolIndex + 3);
            normalized = pathIndex >= 0 ? normalized.substring(pathIndex) : "";
        }

        if (!normalized.startsWith("/")) {
            normalized = "/" + normalized;
        }

        if (normalized.startsWith("/files/")) {
            normalized = "/api" + normalized;
        }

        if (!normalized.startsWith("/api/files/")) {
            int lastSlash = normalized.lastIndexOf('/');
            String filename = lastSlash >= 0 ? normalized.substring(lastSlash + 1) : normalized;
            normalized = "/api/files/venue-images/" + filename;
        }

        return normalized;
    }
}


