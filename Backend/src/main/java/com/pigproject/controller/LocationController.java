package com.pigproject.controller;

import com.pigproject.dto.ApiResponse;
import com.pigproject.entity.Cell;
import com.pigproject.entity.District;
import com.pigproject.entity.Sector;
import com.pigproject.entity.Village;
import com.pigproject.repository.CellRepository;
import com.pigproject.repository.DistrictRepository;
import com.pigproject.repository.SectorRepository;
import com.pigproject.repository.VillageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private CellRepository cellRepository;

    @Autowired
    private VillageRepository villageRepository;

    @GetMapping("/districts")
    public ResponseEntity<ApiResponse<List<District>>> getDistricts() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched successfully", districtRepository.findAll()));
    }

    @GetMapping("/sectors/{districtId}")
    public ResponseEntity<ApiResponse<List<Sector>>> getSectors(@PathVariable Long districtId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched successfully", sectorRepository.findByDistrictId(districtId)));
    }

    @GetMapping("/cells/{sectorId}")
    public ResponseEntity<ApiResponse<List<Cell>>> getCells(@PathVariable Long sectorId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched successfully", cellRepository.findBySectorId(sectorId)));
    }

    @GetMapping("/villages/{cellId}")
    public ResponseEntity<ApiResponse<List<Village>>> getVillages(@PathVariable Long cellId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched successfully", villageRepository.findByCellId(cellId)));
    }
}
