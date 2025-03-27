package com.example.openai.controller;

import com.example.openai.domain.ComplianceMessage;
import com.example.openai.domain.ComplianceResult;
import com.example.openai.service.ComplianceService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Controller
@RequestMapping("/compliance")
public class ComplianceController {

    private final ComplianceService complianceService;

    public ComplianceController(ComplianceService complianceService) {
        this.complianceService = complianceService;
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("recentResults", complianceService.getRecentResults());
        return "dashboard";
    }

    @PostMapping("/upload-rules")
    public String uploadRules(@RequestParam("rulesText") String rulesText, Model model) {
        ComplianceResult result = complianceService.processRules(rulesText);
        model.addAttribute("result", result);
        return "rules-result";
    }

    @PostMapping("/upload-data")
    public String uploadData(@RequestParam("dataFile") MultipartFile file, Model model) {
        try {
            ComplianceResult result = complianceService.processData(file);
            model.addAttribute("result", result);
            return "data-result";
        } catch (IOException e) {
            model.addAttribute("error", "Error processing file");
            return "error";
        }
    }

    @GetMapping("/assistant")
    public String assistant(Model model) {
        model.addAttribute("messages", complianceService.getChatHistory());
        return "assistant";
    }

    @PostMapping("/ask")
    public String askQuestion(@RequestParam("question") String question, Model model) {
        ComplianceMessage response = complianceService.askComplianceQuestion(question);
        model.addAttribute("response", response);
        return "assistant-response";
    }
}