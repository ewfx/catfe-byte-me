// src/main/java/com/hackathon2025/domain/ProfileRequest.java
package com.example.openai.domain;

import java.util.List;

public class ProfileRequest {
    private String regulatoryText;
    private List<Transaction> data;

    // Constructors, getters, setters
    public ProfileRequest() {}
    
    public ProfileRequest(String regulatoryText, List<Transaction> data) {
        this.regulatoryText = regulatoryText;
        this.data = data;
    }

    // Getters and setters
    public String getRegulatoryText() { return regulatoryText; }
    public void setRegulatoryText(String regulatoryText) { this.regulatoryText = regulatoryText; }
    public List<Transaction> getData() { return data; }
    public void setData(List<Transaction> data) { this.data = data; }
}