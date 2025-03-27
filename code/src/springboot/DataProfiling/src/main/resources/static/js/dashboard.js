// Global variables
let riskChart, anomalyChart;
const statCards = [
    { id: 'totalTransactions', label: 'Total Transactions', icon: 'fa-exchange-alt', color: 'primary' },
    { id: 'validTransactions', label: 'Valid Transactions', icon: 'fa-check-circle', color: 'success' },
    { id: 'flaggedTransactions', label: 'Flagged Transactions', icon: 'fa-exclamation-triangle', color: 'warning' },
    { id: 'highRiskTransactions', label: 'High Risk', icon: 'fa-times-circle', color: 'danger' }
];

// Global chart variable
let riskChart;

// Initialize chart when page loads
function initializeRiskChart() {
    const ctx = document.getElementById('riskChart').getContext('2d');

    riskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Low Risk (0-2)', 'Medium Risk (3-5)', 'High Risk (6-8)', 'Critical Risk (9+)'],
            datasets: [{
                data: [0, 0, 0, 0], // Initial empty data
                backgroundColor: [
                    '#4cc9f0', // Light blue
                    '#4895ef', // Medium blue
                    '#4361ee', // Dark blue
                    '#3a0ca3'  // Purple
                ],
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// Update chart with real data
function updateRiskChart(riskScores) {
    if (!riskChart) {
        console.error("Risk chart not initialized");
        return;
    }

    // Count risk levels
    const counts = [0, 0, 0, 0]; // low, medium, high, critical

    riskScores.forEach(score => {
        const risk = score.total_risk || 0;
        if (risk <= 2) counts[0]++;
        else if (risk <= 5) counts[1]++;
        else if (risk <= 8) counts[2]++;
        else counts[3]++;
    });

    // Update chart data
    riskChart.data.datasets[0].data = counts;

    // Add smooth animation
    riskChart.update();
}

// Sample data processor (connect this to your actual data processing)
function processDataAndUpdateChart(data) {
    // Extract or calculate risk scores from your data
    const riskScores = data.map(item => ({
        total_risk: calculateRiskScore(item) // Implement your risk calculation
    }));

    updateRiskChart(riskScores);
}

// Example risk calculation function
function calculateRiskScore(transaction) {
    // Implement your actual risk calculation logic
    let score = 0;

    // Example criteria (adjust based on your rules)
    if (transaction.amount > 10000) score += 3;
    if (transaction.country === 'HighRisk') score += 4;
    if (transaction.currency !== 'USD') score += 1;

    return Math.min(score, 10); // Cap at 10 for this example
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeRiskChart();

    // Test with sample data (remove in production)
    setTimeout(() => {
        const testData = generateTestData();
        updateRiskChart(testData);
    }, 1000);
});

// Test data generator (remove in production)
function generateTestData() {
    const risks = [];
    for (let i = 0; i < 50; i++) {
        risks.push({
            total_risk: Math.floor(Math.random() * 10) // Random risk 0-9
        });
    }
    return risks;
}

// Initialize application when DOM is loaded
$(document).ready(function() {
    initializeStatsCards();
    initializeCharts();
    setupEventHandlers();
    loadRecentActivity();
});

function initializeStatsCards() {
    const container = $('#statsCards');
    statCards.forEach(card => {
        container.append(`
            <div class="col-md-3">
                <div class="card stat-card ${card.color}">
                    <div class="card-body">
                        <div class="stat-value" id="${card.id}">0</div>
                        <div class="stat-label">${card.label}</div>
                        <i class="fas ${card.icon} float-end mt-2 text-${card.color}"></i>
                    </div>
                </div>
            </div>
        `);
    });
}

function initializeCharts() {
    // Risk Distribution Chart
    const riskCtx = $('#riskChart');
    riskChart = new Chart(riskCtx, {
        type: 'doughnut',
        data: {
            labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    '#4cc9f0',
                    '#4895ef',
                    '#4361ee',
                    '#3a0ca3'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Anomaly Detection Chart
    const anomalyCtx = $('#anomalyChart');
    anomalyChart = new Chart(anomalyCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Normal',
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: '#4cc9f0'
            }, {
                label: 'Anomalies',
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: '#f72585'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function setupEventHandlers() {
    // Process Rules Form Submission
    $('#rulesForm').on('submit', function(e) {
        e.preventDefault();
        processRules();
    });

    // Process Data Form Submission
    $('#dataForm').on('submit', function(e) {
        e.preventDefault();
        processData();
    });

    // File upload area click handlers
    $('#rulesUploadArea').on('click', function() {
        $('#rulesFile').trigger('click');
    });

    $('#dataUploadArea').on('click', function() {
        $('#dataFile').trigger('click');
    });

    // Handle file selection changes
    $('#rulesFile').on('change', function(e) {
        handleFileSelection(e, '#rulesText', '#rulesUploadArea', 'text');
    });

    $('#dataFile').on('change', function(e) {
        handleFileSelection(e, null, '#dataUploadArea', 'data');
    });

    // Drag and drop functionality
    setupDragAndDrop('#rulesUploadArea', '#rulesFile');
    setupDragAndDrop('#dataUploadArea', '#dataFile');
}

function setupDragAndDrop(dropAreaId, fileInputId) {
    const dropArea = $(dropAreaId);
    const fileInput = $(fileInputId);

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.on(eventName, preventDefaults);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.on(eventName, highlight);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.on(eventName, unhighlight);
    });

    // Handle dropped files
    dropArea.on('drop', function(e) {
        const dt = e.originalEvent.dataTransfer;
        const files = dt.files;
        fileInput[0].files = files;
        fileInput.trigger('change');
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.addClass('highlight');
    }

    function unhighlight() {
        dropArea.removeClass('highlight');
    }
}

function handleFileSelection(event, textAreaId, uploadAreaId, type) {
    const file = event.target.files[0];
    if (!file) return;

    const uploadArea = $(uploadAreaId);

    if (type === 'text') {
        const reader = new FileReader();
        reader.onload = function(e) {
            $(textAreaId).val(e.target.result);
            $('#processRulesBtn').prop('disabled', false);
            updateUploadArea(uploadArea, file, 'text');
        };
        reader.readAsText(file);
    } else {
        $('#processDataBtn').prop('disabled', false);
        updateUploadArea(uploadArea, file, 'data');
    }
}

function updateUploadArea(uploadArea, file, type) {
    const fileSize = (file.size / 1024).toFixed(1) + ' KB';
    const iconClass = type === 'text' ? 'fa-file-alt' : 'fa-file-csv';
    const iconColor = type === 'text' ? 'primary' : 'success';

    uploadArea.html(`
        <i class="fas ${iconClass} fa-3x mb-3 text-${iconColor}"></i>
        <h5>${file.name}</h5>
        <p class="text-muted">${fileSize}</p>
    `);
}

function processRules() {
    const rulesText = $('#rulesText').val();
    const processBtn = $('#processRulesBtn');

    if (!rulesText) {
        showToast('warning', 'Please enter regulatory rules text');
        return;
    }

    processBtn.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...');
    processBtn.prop('disabled', true);

    // Simulate API call
    setTimeout(() => {
        showToast('success', 'Rules processed successfully!');

        // Mock response data
        const mockResponse = {
            operationName: "Rules Processing",
            summary: "Successfully extracted 3 profiling rules",
            resultData: {
                rules: [
                    {
                        description: "Transaction amount must match Reported Amount",
                        condition: "row.Transaction_Amount === row.Reported_Amount",
                        risk_weight: 3
                    },
                    {
                        description: "Account balance must be positive",
                        condition: "row.Account_Balance >= 0",
                        risk_weight: 5
                    },
                    {
                        description: "Currency must be valid",
                        condition: "['USD','EUR','GBP'].includes(row.Currency)",
                        risk_weight: 2
                    }
                ]
            }
        };

        updateRecentActivity(mockResponse);
        updateRiskChart(mockResponse.resultData);

        processBtn.html('<i class="fas fa-cog me-2"></i> Process Rules');
        processBtn.prop('disabled', false);
    }, 1500);
}

function processData() {
    const fileInput = $('#dataFile')[0];
    if (!fileInput.files || fileInput.files.length === 0) {
        showToast('warning', 'Please select a CSV file first');
        return;
    }

    const processBtn = $('#processDataBtn');

    processBtn.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...');
    processBtn.prop('disabled', true);

    // Simulate API call
    setTimeout(() => {
        showToast('success', 'Data processed successfully! Found 4 issues.');

        // Mock response data
        const mockResponse = {
            operationName: "Data Validation",
            summary: "Processed 10 transactions, found 4 issues",
            resultData: {
                errors: [
                    { Customer_Id: "1004", error: "Amount mismatch" },
                    { Customer_Id: "1009", error: "Negative balance" }
                ],
                risk_scores: [
                    { Customer_Id: "1001", total_risk: 0 },
                    { Customer_Id: "1002", total_risk: 0 },
                    { Customer_Id: "1003", total_risk: 0 },
                    { Customer_Id: "1004", total_risk: 3 },
                    { Customer_Id: "1005", total_risk: 7 },
                    { Customer_Id: "1006", total_risk: 0 },
                    { Customer_Id: "1007", total_risk: 2 },
                    { Customer_Id: "1008", total_risk: 2 },
                    { Customer_Id: "1009", total_risk: 5 },
                    { Customer_Id: "1010", total_risk: 3 }
                ],
                flagged_transactions: [
                    { Customer_Id: "1004", Transaction_Amount: 2000, Issues: ["Amount mismatch"] },
                    { Customer_Id: "1005", Transaction_Amount: 10000, Issues: ["High-risk country"] },
                    { Customer_Id: "1008", Transaction_Amount: 1000, Issues: ["Round number"] },
                    { Customer_Id: "1009", Transaction_Amount: 150, Issues: ["Negative balance"] }
                ],
                anomalies: [
                    { Customer_Id: "1005", Reason: "High-value to high-risk country" },
                    { Customer_Id: "1008", Reason: "Round number transaction" }
                ]
            }
        };

        updateRecentActivity(mockResponse);
        updateStats(mockResponse.resultData);
        updateAnomalyChart(mockResponse.resultData);

        processBtn.html('<i class="fas fa-check-circle me-2"></i> Validate Data');
        processBtn.prop('disabled', false);
    }, 2000);
}

function updateRecentActivity(activity) {
    const activityList = $('.recent-activity');
    const now = new Date().toLocaleTimeString();

    const activityItem = `
        <div class="activity-item">
            <div class="d-flex justify-content-between">
                <strong>${activity.operationName}</strong>
                <span class="activity-time">${now}</span>
            </div>
            <p class="mb-0">${activity.summary}</p>
        </div>
    `;

    activityList.prepend(activityItem);

    // Keep only the last 5 items
    if (activityList.children().length > 5) {
        activityList.children().last().remove();
    }
}

function updateStats(resultData) {
    if (!resultData) return;

    // Update the stats counters
    const total = resultData.risk_scores?.length || 0;
    const valid = total - (resultData.errors?.length || 0);
    const flagged = resultData.flagged_transactions?.length || 0;
    const highRisk = resultData.risk_scores?.filter(r => r.total_risk > 7).length || 0;

    animateValue('totalTransactions', parseInt($('#totalTransactions').text()) || 0, total, 1000);
    animateValue('validTransactions', parseInt($('#validTransactions').text()) || 0, valid, 1000);
    animateValue('flaggedTransactions', parseInt($('#flaggedTransactions').text()) || 0, flagged, 1000);
    animateValue('highRiskTransactions', parseInt($('#highRiskTransactions').text()) || 0, highRisk, 1000);
}

function updateRiskChart(resultData) {
    if (!resultData || !riskChart) return;

    const riskLevels = [0, 0, 0, 0]; // low, medium, high, critical
    if (resultData.risk_scores) {
        resultData.risk_scores.forEach(score => {
            if (score.total_risk < 3) riskLevels[0]++;
            else if (score.total_risk < 6) riskLevels[1]++;
            else if (score.total_risk < 9) riskLevels[2]++;
            else riskLevels[3]++;
        });
    }

    riskChart.data.datasets[0].data = riskLevels;
    riskChart.update();
}

function updateAnomalyChart(resultData) {
    if (!resultData || !anomalyChart) return;

    const anomalies = resultData.anomalies?.length || 0;
    const normal = (resultData.risk_scores?.length || 0) - anomalies;

    // Update the current month's data
    const now = new Date();
    const monthIndex = now.getMonth() % 6;

    anomalyChart.data.datasets[0].data[monthIndex] = normal;
    anomalyChart.data.datasets[1].data[monthIndex] = anomalies;
    anomalyChart.update();
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function showToast(type, message) {
    const toast = $(`
        <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `);

    $('#toastContainer').append(toast);
    const bsToast = new bootstrap.Toast(toast[0]);
    bsToast.show();

    // Remove toast after it hides
    toast.on('hidden.bs.toast', function() {
        $(this).remove();
    });
}

function loadRecentActivity() {
    // Mock recent activities
    const mockActivities = [
        {
            operationName: "System Startup",
            summary: "Compliance system initialized successfully"
        },
        {
            operationName: "Rules Update",
            summary: "Loaded default profiling rules"
        },
        {
            operationName: "Data Validation",
            summary: "Ready to process transaction data"
        }
    ];

    mockActivities.forEach(activity => {
        updateRecentActivity(activity);
    });
}

function loadRiskDistribution() {
    $.ajax({
        url: '/api/risk/distribution',
        type: 'GET',
        success: function(response) {
            // Format response for chart
            const riskScores = [
                {total_risk: 1}, // Sample data - replace with your actual mapping
                {total_risk: 4},
                {total_risk: 7},
                {total_risk: 9}
                // ... map your actual response data
            ];
            updateRiskChart(riskScores);
        },
        error: function(xhr) {
            console.error("Error loading risk data:", xhr.responseText);
            showToast('error', 'Failed to load risk distribution data');
        }
    });
}

// Call this when your dashboard loads
document.addEventListener('DOMContentLoaded', function() {
    initializeRiskChart();
    loadRiskDistribution();
});