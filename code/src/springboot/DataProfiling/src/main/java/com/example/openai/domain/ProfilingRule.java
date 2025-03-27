package com.example.openai.domain;

import lombok.Data;

@Data
public class ProfilingRule {
    private String ruleId;
    private String description;
    private String condition;
    private String errorMessage;
    private int riskWeight;
    private boolean isActive;

}