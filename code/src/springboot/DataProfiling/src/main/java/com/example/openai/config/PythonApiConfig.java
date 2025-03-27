package com.example.openai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PythonApiConfig {
    
    @Value("${python.api.url}")
    private String pythonApiUrl;
    
    @Value("${python.api.analyze-path}")
    private String analyzePath;
    
    @Value("${python.api.timeout}")
    private int timeout;
    
    public String getAnalyzeUrl() {
        return pythonApiUrl + analyzePath;
    }
    
    public int getTimeout() {
        return timeout;
    }
    
    // Getters
    public String getPythonApiUrl() {
        return pythonApiUrl;
    }
    
    public String getAnalyzePath() {
        return analyzePath;
    }
}