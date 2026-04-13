package com.codewithvy.quanlydatsan.mapper;

import com.codewithvy.quanlydatsan.dto.AddressDTO;
import com.codewithvy.quanlydatsan.dto.VenuesDTO;
import com.codewithvy.quanlydatsan.model.Address;
import com.codewithvy.quanlydatsan.model.Venues;
import org.springframework.stereotype.Component;

@Component
public class VenuesMapper {

    public VenuesDTO toDto(Venues v){
        if(v == null) return null;
        Address address = v.getAddress();
        AddressDTO addressDTO = null;
        if(address != null){
            addressDTO = AddressDTO.builder()
                    .id(address.getId())
                    .provinceOrCity(address.getProvinceOrCity())
                    .district(address.getDistrict())
                    .detailAddress(address.getDetailAddress())
                    .build();
        }
        return VenuesDTO.builder()
                .id(v.getId())
                .name(v.getName())
                .description(v.getDescription()) // Map trường description
                .address(addressDTO)
                .courtsCount(0)
                .pricePerHour(v.getPricePerHour())
                .averageRating(0.0)
                .totalReviews(0)
                .openingTime(v.getOpeningTime())
                .closingTime(v.getClosingTime())
                .images(v.getImages()) // Map danh sách ảnh
                .ownerId(v.getOwner() != null ? v.getOwner().getId() : null)
                .ownerPhoneNumber(v.getOwner() != null ? v.getOwner().getPhone() : null) // Map số điện thoại chủ sân
                .build();
    }
}
