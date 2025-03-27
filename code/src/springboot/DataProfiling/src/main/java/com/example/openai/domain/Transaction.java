package com.example.openai.domain;

import java.time.LocalDate;

public class Transaction {
    private int customerId;
    private double accountBalance;
    private double transactionAmount;
    private double reportedAmount;
    private String currency;
    private String country;
    private String transactionDate;
    private int riskScore;

    // Constructors
    public Transaction() {}

    public Transaction(int customerId, double accountBalance, double transactionAmount,
                       double reportedAmount, String currency, String country,
                       String transactionDate, int riskScore) {
        this.customerId = customerId;
        this.accountBalance = accountBalance;
        this.transactionAmount = transactionAmount;
        this.reportedAmount = reportedAmount;
        this.currency = currency;
        this.country = country;
        this.transactionDate = transactionDate;
        this.riskScore = riskScore;
    }

    // Getters and setters
    public int getCustomerId() { return customerId; }
    public void setCustomerId(int customerId) { this.customerId = customerId; }
    public double getAccountBalance() { return accountBalance; }
    public void setAccountBalance(double accountBalance) { this.accountBalance = accountBalance; }
    public double getTransactionAmount() { return transactionAmount; }
    public void setTransactionAmount(double transactionAmount) { this.transactionAmount = transactionAmount; }
    public double getReportedAmount() { return reportedAmount; }
    public void setReportedAmount(double reportedAmount) { this.reportedAmount = reportedAmount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getTransactionDate() { return transactionDate; }
    public void setTransactionDate(String transactionDate) { this.transactionDate = transactionDate; }
    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }
}