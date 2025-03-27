package com.example.openai.domain;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

public class ComplianceResult {
    private String operationName;
    private String summary;
    private Object resultData;
    private LocalDateTime timestamp;
    private String status; // "success", "warning", "error"
    private List<String> messages;
    private Map<String, Object> metadata;

    // Constructors
    public ComplianceResult() {
        this.timestamp = LocalDateTime.now();
        this.status = "success";
    }

    public ComplianceResult(String operationName, String summary) {
        this();
        this.operationName = operationName;
        this.summary = summary;
    }

    public ComplianceResult(String operationName, Object resultData) {
        this();
        this.operationName = operationName;
        this.resultData = resultData;
        this.summary = "Operation completed successfully";
    }
    public ComplianceResult(String operationName, String summary, Object resultData) {
        this();
        this.operationName = operationName;
        this.summary=summary;
        this.resultData = resultData;
        this.summary = "Operation completed successfully";
    }

    // Getters and Setters
    public String getOperationName() {
        return operationName;
    }

    public void setOperationName(String operationName) {
        this.operationName = operationName;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Object getResultData() {
        return resultData;
    }

    public void setResultData(Object resultData) {
        this.resultData = resultData;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getMessages() {
        return messages;
    }

    public void setMessages(List<String> messages) {
        this.messages = messages;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    // Helper methods
    public boolean isSuccess() {
        return "success".equalsIgnoreCase(status);
    }

    public boolean hasWarnings() {
        return "warning".equalsIgnoreCase(status);
    }

    public boolean hasErrors() {
        return "error".equalsIgnoreCase(status);
    }

    public void addMessage(String message) {
        if (this.messages == null) {
            this.messages = new java.util.ArrayList<>();
        }
        this.messages.add(message);
    }

    public void addMetadata(String key, Object value) {
        if (this.metadata == null) {
            this.metadata = new java.util.HashMap<>();
        }
        this.metadata.put(key, value);
    }

    @Override
    public String toString() {
        return "ComplianceResult{" +
                "operationName='" + operationName + '\'' +
                ", summary='" + summary + '\'' +
                ", status='" + status + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}