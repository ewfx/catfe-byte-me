// src/main/java/com/hackathon2025/service/DataProfilerService.java
package com.example.openai.service;

import com.example.openai.domain.ProfileRequest;
import com.example.openai.domain.ProfileResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Service
public class DataProfilerService {

    @Value("${python.api.url}")
    private String pythonApiUrl;

    private final RestTemplate restTemplate;

    public DataProfilerService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ProfileResponse profileData(ProfileRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

            HttpEntity<ProfileRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<ProfileResponse> response = restTemplate.exchange(
                    pythonApiUrl + "/analyze",
                    HttpMethod.POST,
                    entity,
                    ProfileResponse.class
            );

            return response.getBody();
        } catch (Exception e) {
            return ProfileResponse.error("Error profiling data: " + e.getMessage());
        }
    }
}