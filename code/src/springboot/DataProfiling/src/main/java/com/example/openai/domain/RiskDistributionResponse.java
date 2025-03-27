package com.example.openai.domain;

import lombok.Data;

@Data
public class RiskDistributionResponse {
    private int lowRisk;
    private int mediumRisk;
    private int highRisk;
    private int criticalRisk;
    
    // constructor, getters, setters
}