// src/main/java/com/hackathon2025/controller/ProfileController.java
package com.example.openai.controller;
import com.example.openai.domain.ProfileRequest;
import com.example.openai.domain.ProfileResponse;
import com.example.openai.service.DataProfilerService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final DataProfilerService profilerService;

    public ProfileController(DataProfilerService profilerService) {
        this.profilerService = profilerService;
    }

    @PostMapping("/profile")
    public ProfileResponse profileData(@RequestBody ProfileRequest request) {
        return profilerService.profileData(request);
    }
}