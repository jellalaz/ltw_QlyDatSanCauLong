package com.codewithvy.quanlydatsan.service.address;

import com.codewithvy.quanlydatsan.dto.AddressDTO;
import com.codewithvy.quanlydatsan.exception.ResourceNotFoundException;
import com.codewithvy.quanlydatsan.model.Address;
import com.codewithvy.quanlydatsan.repository.AddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<AddressDTO> getAll() {
        return addressRepository.findAll().stream().map(this::toDto).toList();
    }

    public AddressDTO getById(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        return toDto(address);
    }

    @Transactional
    public AddressDTO create(AddressDTO request) {
        Address address = new Address();
        address.setProvinceOrCity(request.getProvinceOrCity());
        address.setDistrict(request.getDistrict());
        address.setDetailAddress(request.getDetailAddress());

        Address saved = addressRepository.save(address);
        return toDto(saved);
    }

    private AddressDTO toDto(Address address) {
        if (address == null) return null;
        return AddressDTO.builder()
                .id(address.getId())
                .provinceOrCity(address.getProvinceOrCity())
                .district(address.getDistrict())
                .detailAddress(address.getDetailAddress())
                .build();
    }
}


