package com.example.openai.service;

import com.example.openai.domain.ComplianceMessage;
import com.example.openai.domain.ComplianceResult;
import org.python.util.PythonInterpreter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class ComplianceServiceImpl implements ComplianceService {

    @Value("${python.script.path}")
    private String pythonScriptPath;

    private final List<ComplianceMessage> chatHistory = new ArrayList<>();

    public ComplianceResult processRules(String rulesText) {
        try {
            // Call Python script to process rules
            PythonInterpreter interpreter = new PythonInterpreter();
            interpreter.execfile(new ClassPathResource(pythonScriptPath).getInputStream());

            interpreter.set("regulatory_text", rulesText);
            interpreter.exec("result = extract_profiling_rules(regulatory_text)");
            String rulesJson = interpreter.get("result").toString();

            interpreter.exec("validation_script = generate_validation_script(result)");
            String validationScript = interpreter.get("validation_script").toString();

            // Save validation script
            try (FileWriter writer = new FileWriter("validation_script.py")) {
                writer.write(validationScript);
            }

            return new ComplianceResult("Rules processed successfully", rulesJson);
        } catch (Exception e) {
            return new ComplianceResult("Error processing rules: " + e.getMessage(), null);
        }
    }

    public ComplianceResult processData(MultipartFile file) throws IOException {
        // Save uploaded file
        String filePath = "uploaded_data.csv";
        file.transferTo(new File(filePath));

        // Call Python script to validate data
        PythonInterpreter interpreter = new PythonInterpreter();
        interpreter.execfile(new ClassPathResource(pythonScriptPath).getInputStream());
        interpreter.exec("import pandas as pd");
        interpreter.exec(String.format("df = pd.read_csv('%s')", filePath));
        interpreter.exec("from validation_script import validate_data");
        interpreter.exec("result = validate_data(df)");

        String resultJson = interpreter.get("result").toString();
        return new ComplianceResult("Data processed successfully", resultJson);
    }

    public ComplianceMessage askComplianceQuestion(String question) {
        // Add to chat history
        ComplianceMessage userMessage = new ComplianceMessage("user", question);
        chatHistory.add(userMessage);

        // Call Python script to generate response
        try {
            PythonInterpreter interpreter = new PythonInterpreter();
            interpreter.execfile(new ClassPathResource(pythonScriptPath).getInputStream());
            interpreter.set("question", question);
            interpreter.exec("response = suggest_remediation(question)");

            String response = interpreter.get("response").toString();
            ComplianceMessage botMessage = new ComplianceMessage("assistant", response);
            chatHistory.add(botMessage);

            return botMessage;
        } catch (Exception e) {
            return new ComplianceMessage("assistant", "I couldn't process your request: " + e.getMessage());
        }
    }

    public List<ComplianceMessage> getChatHistory() {
        return chatHistory;
    }

    public List<ComplianceResult> getRecentResults() {
        // In a real app, this would query a database
        return List.of(
            new ComplianceResult("Last data validation", "5 issues found"),
            new ComplianceResult("Risk assessment", "3 high-risk transactions")
        );
    }
}