package com.example.openai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/profiling")
public class DataProfilingController {

    private static final Set<String> VALID_CURRENCIES = Set.of("USD", "EUR", "INR", "GBP");
    private static final Set<String> ACCEPTED_COUNTRIES = Set.of("US", "DE", "IN", "FR", "UK");
    private static final Set<String> HIGH_RISK_COUNTRIES = Set.of("IR", "NK");

    @PostMapping("/ingest")
    public ResponseEntity<Map<String, String>> ingestData(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(Map.of("status", "Data ingested successfully", "data", data.toString()));
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateData(@RequestBody Map<String, Object> data) {
        Map<String, String> errors = new LinkedHashMap<>();
        String currency = (String) data.get("Currency");
        String country = (String) data.get("Country");
        double transactionAmount = Double.parseDouble(data.get("Transaction_Amount").toString());
        double reportedAmount = Double.parseDouble(data.get("Reported_Amount").toString());
        double accountBalance = Double.parseDouble(data.get("Account_Balance").toString());
        LocalDate transactionDate = LocalDate.parse(data.get("Transaction_Date").toString());

        // Transaction Amount Validation
        if (transactionAmount != reportedAmount) {
            errors.put("Transaction Amount", "Mismatch with reported amount");
        }

        // Account Balance Validation
        if (accountBalance < 0 && !"OD".equals(data.getOrDefault("Account_Type", ""))) {
            errors.put("Account Balance", "Negative balance without overdraft flag");
        }

        // Currency Validation
        if (!VALID_CURRENCIES.contains(currency)) {
            errors.put("Currency", "Invalid currency code");
        }

        // Country Validation
        if (!ACCEPTED_COUNTRIES.contains(country)) {
            errors.put("Country", "Non-accepted jurisdiction");
        }

        // Date Validation
        if (transactionDate.isAfter(LocalDate.now())) {
            errors.put("Transaction Date", "Cannot be in the future");
        }
        if (ChronoUnit.DAYS.between(transactionDate, LocalDate.now()) > 365) {
            errors.put("Transaction Date", "Older than 365 days");
        }

        // High-Risk Transaction Detection
        int riskScore = 1;
        if (transactionAmount > 5000 && HIGH_RISK_COUNTRIES.contains(country)) {
            errors.put("High-Risk Transaction", "Amount exceeds limit in high-risk country");
            riskScore += 3;
        }
        if (transactionAmount % 1000 == 0) {
            errors.put("Potential AML Risk", "Round number detected");
            riskScore += 2;
        }

        // Response with risk score
        Map<String, Object> result = new HashMap<>();
        result.put("errors", errors.isEmpty() ? "No errors" : errors);
        result.put("risk_score", riskScore);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/remediation")
    public ResponseEntity<Map<String, Object>> suggestRemediation(@RequestBody Map<String, Object> data) {
        List<String> suggestions = new ArrayList<>();
        double transactionAmount = Double.parseDouble(data.get("Transaction_Amount").toString());

        if (transactionAmount % 1000 == 0) {
            suggestions.add("Validate source of funds for round-number transaction.");
        }
        if (HIGH_RISK_COUNTRIES.contains(data.get("Country"))) {
            suggestions.add("Trigger enhanced due diligence check.");
        }
        if (Double.parseDouble(data.getOrDefault("Account_Balance", "0").toString()) < 0) {
            suggestions.add("Review account for overdraft flag or possible fraud.");
        }

        return ResponseEntity.ok(Map.of("suggestions", suggestions.isEmpty() ? "No remediation needed" : suggestions));
    }
}
