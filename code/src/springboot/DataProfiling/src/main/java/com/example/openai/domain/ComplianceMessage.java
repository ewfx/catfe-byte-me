package com.example.openai.domain;

import java.time.LocalDateTime;

public class ComplianceMessage {
    private String sender; // "user" or "assistant"
    private String content;
    private LocalDateTime timestamp;
    private String messageType; // "text", "rule", "suggestion", "warning"
    private boolean isUserMessage;

    // Constructors
    public ComplianceMessage() {
        this.timestamp = LocalDateTime.now();
    }

    public ComplianceMessage(String sender, String content) {
        this();
        this.sender = sender;
        this.content = content;
        this.isUserMessage = "user".equalsIgnoreCase(sender);
        this.messageType = "text";
    }

    public ComplianceMessage(String sender, String content, String messageType) {
        this(sender, content);
        this.messageType = messageType;
    }

    // Getters and Setters
    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
        this.isUserMessage = "user".equalsIgnoreCase(sender);
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public boolean isUserMessage() {
        return isUserMessage;
    }

    // Helper methods
    public String getFormattedTimestamp() {
        return timestamp.toString();
    }

    public String getSenderIcon() {
        return isUserMessage ? "user" : "robot";
    }

    public String getMessageCssClass() {
        return isUserMessage ? "user-message" : "assistant-message";
    }

    @Override
    public String toString() {
        return "ComplianceMessage{" +
                "sender='" + sender + '\'' +
                ", content='" + content + '\'' +
                ", timestamp=" + timestamp +
                ", messageType='" + messageType + '\'' +
                '}';
    }
}