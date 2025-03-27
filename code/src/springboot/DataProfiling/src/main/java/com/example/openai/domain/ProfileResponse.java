// src/main/java/com/hackathon2025/domain/ProfileResponse.java
package com.example.openai.domain;

import java.util.List;
import java.util.Map;

public class ProfileResponse {
    private String status;
    private String message;
    private Map<String, Object> rules;
    private List<Map<String, Object>> errors;
    private List<Map<String, Object>> anomalies;
    private List<Map<String, Object>> riskScores;
    private List<Map<String, Object>> remediations;

    // Constructors
    public ProfileResponse() {}
    
    public static ProfileResponse success(Map<String, Object> results) {
        ProfileResponse response = new ProfileResponse();
        response.setStatus("success");
        response.setRules((Map<String, Object>) results.get("rules"));
        response.setErrors((List<Map<String, Object>>) results.get("errors"));
        response.setAnomalies((List<Map<String, Object>>) results.get("anomalies"));
        response.setRiskScores((List<Map<String, Object>>) results.get("risk_scores"));
        response.setRemediations((List<Map<String, Object>>) results.get("remediations"));
        return response;
    }
    
    public static ProfileResponse error(String message) {
        ProfileResponse response = new ProfileResponse();
        response.setStatus("error");
        response.setMessage(message);
        return response;
    }

    // Getters and setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Map<String, Object> getRules() { return rules; }
    public void setRules(Map<String, Object> rules) { this.rules = rules; }
    public List<Map<String, Object>> getErrors() { return errors; }
    public void setErrors(List<Map<String, Object>> errors) { this.errors = errors; }
    public List<Map<String, Object>> getAnomalies() { return anomalies; }
    public void setAnomalies(List<Map<String, Object>> anomalies) { this.anomalies = anomalies; }
    public List<Map<String, Object>> getRiskScores() { return riskScores; }
    public void setRiskScores(List<Map<String, Object>> riskScores) { this.riskScores = riskScores; }
    public List<Map<String, Object>> getRemediations() { return remediations; }
    public void setRemediations(List<Map<String, Object>> remediations) { this.remediations = remediations; }
}