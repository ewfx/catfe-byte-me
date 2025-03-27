package com.example.openai.service;

import com.example.openai.domain.ComplianceMessage;
import com.example.openai.domain.ComplianceResult;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ComplianceService {
    ComplianceResult processRules(String rulesText);
    ComplianceResult processData(MultipartFile file) throws IOException;
    ComplianceMessage askComplianceQuestion(String question);
    List<ComplianceMessage> getChatHistory();
    List<ComplianceResult> getRecentResults();
}