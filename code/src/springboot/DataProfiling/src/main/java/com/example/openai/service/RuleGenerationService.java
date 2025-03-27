package com.example.openai.service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
class RuleGenerationService {
    public List<String> generateRules(String regulatoryInstruction) {
        // Future implementation for LLM integration
        return List.of("Generated rule 1", "Generated rule 2");
    }
}