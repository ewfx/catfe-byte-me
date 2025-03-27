package com.example.openai.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/dashboard")
public class DashboardController {
    @GetMapping
    public String getDashboard(Model model) {
        model.addAttribute("rules", List.of("Amount > 0", "Customer ID must be present"));
        return "data_profiling_dashboard";
    }
}
