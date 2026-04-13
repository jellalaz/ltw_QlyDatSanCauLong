package com.codewithvy.quanlydatsan.controller.address;

import com.codewithvy.quanlydatsan.dto.AddressDTO;
import com.codewithvy.quanlydatsan.dto.ApiResponse;
import com.codewithvy.quanlydatsan.service.address.AddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {
    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressDTO>>> getAll(){
        List<AddressDTO> list = addressService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(list, "List addresses"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressDTO>> getById(@PathVariable Long id){
        AddressDTO dto = addressService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressDTO>> create(@RequestBody AddressDTO req){
        AddressDTO saved = addressService.create(req);
        return ResponseEntity.ok(ApiResponse.ok(saved, "Created"));
    }
}


