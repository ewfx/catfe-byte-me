// DOM Elements
const analyzeBtn = document.getElementById('analyzeBtn');
const quickAnalyzeBtn = document.getElementById('quickAnalyzeBtn');
const sampleRegBtn = document.getElementById('sampleRegBtn');
const addTransactionBtn = document.getElementById('addTransactionBtn');
const saveTransactionBtn = document.getElementById('saveTransactionBtn');
const transactionForm = document.getElementById('transactionForm');
const transactionModal = new bootstrap.Modal(document.getElementById('transactionModal'));
const transactionData = document.getElementById('transactionData');
const transactionCount = document.getElementById('transactionCount');
const resultsContainer = document.getElementById('resultsContainer');
const regulatoryText = document.getElementById('regulatoryText');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Load sample regulatory text
    sampleRegBtn.addEventListener('click', loadSampleRegulatoryText);

    // Transaction management
    addTransactionBtn.addEventListener('click', () => transactionModal.show());
    saveTransactionBtn.addEventListener('click', saveTransaction);

    // Analysis buttons
    analyzeBtn.addEventListener('click', analyzeData);
    quickAnalyzeBtn.addEventListener('click', analyzeData);

    // Update transaction count
    updateTransactionCount();
});

function loadSampleRegulatoryText() {
    regulatoryText.value =
        "Transaction_Amount should always match Reported_Amount, except when the transaction involves cross-currency conversions, in which case a permissible deviation of up to 1% is allowed.\n\n" +
        "Account_Balance should never be negative, except in cases of overdraft accounts explicitly marked with an \"OD\" flag.\n\n" +
        "Currency should be a valid ISO 4217 currency code.\n\n" +
        "Country should be an accepted jurisdiction based on bank regulations, and cross-border transactions should include mandatory transaction remarks if the amount exceeds $10,000.\n\n" +
        "Transaction_Date should not be in the future, and transactions older than 365 days should trigger a data validation alert.\n\n" +
        "High-risk transactions (amount > $5,000 in high-risk countries) should be flagged, with an automatic compliance check triggered.\n\n" +
        "Round-number transactions (e.g., $1000, $5000) should be analyzed for potential money laundering risks.";

    // Add visual feedback
    regulatoryText.classList.add('animate__animated', 'animate__flash');
    setTimeout(() => {
        regulatoryText.classList.remove('animate__animated', 'animate__flash');
    }, 1000);
}

function saveTransaction() {
    if (!transactionForm.checkValidity()) {
        transactionForm.classList.add('was-validated');
        return;
    }

    const transaction = {
        id: document.getElementById('customerId').value,
        balance: document.getElementById('accountBalance').value,
        amount: document.getElementById('transactionAmount').value,
        reported: document.getElementById('reportedAmount').value,
        currency: document.getElementById('currency').value,
        country: document.getElementById('country').value,
        date: document.getElementById('transactionDate').value,
        flags: document.getElementById('flags').value
    };

    addTransactionToTable(transaction);
    transactionModal.hide();
    transactionForm.reset();
    transactionForm.classList.remove('was-validated');
}

function addTransactionToTable(transaction) {
    const row = document.createElement('tr');
    row.className = 'transaction-row';

    // Format flags as badges
    let flagsHtml = '';
    if (transaction.flags) {
        flagsHtml = transaction.flags.split(',').map(flag => {
            let badgeClass = 'bg-secondary';
            if (flag === 'OD') badgeClass = 'bg-primary';
            if (flag === 'ML') badgeClass = 'bg-danger';
            if (flag === 'VERIFIED') badgeClass = 'bg-success';
            return `<span class="badge ${badgeClass} badge-flag me-1">${flag.trim()}</span>`;
        }).join('');
    }

    row.innerHTML = `
        <td>${transaction.id}</td>
        <td>${parseFloat(transaction.balance).toLocaleString()}</td>
        <td>${parseFloat(transaction.amount).toLocaleString()}</td>
        <td>${parseFloat(transaction.reported).toLocaleString()}</td>
        <td>${transaction.currency}</td>
        <td>${transaction.country}</td>
        <td>${transaction.date}</td>
        <td>${flagsHtml}</td>
        <td>
            <button class="btn btn-sm btn-outline-danger delete-transaction">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;

    transactionData.appendChild(row);
    updateTransactionCount();

    // Add event listener to delete button
    row.querySelector('.delete-transaction').addEventListener('click', function() {
        row.remove();
        updateTransactionCount();
    });
}

function updateTransactionCount() {
    const count = document.querySelectorAll('#transactionData tr').length;
    transactionCount.textContent = `${count} transaction${count !== 1 ? 's' : ''}`;

    // Enable/disable analyze button based on transaction count
    analyzeBtn.disabled = count === 0;
    quickAnalyzeBtn.disabled = count === 0;
}

function analyzeData() {
    const regulatoryTextValue = regulatoryText.value.trim();
    if (!regulatoryTextValue) {
        showError('Please provide regulatory instructions');
        return;
    }

    const transactions = prepareTransactionData();
    if (transactions.length === 0) {
        showError('Please add at least one transaction');
        return;
    }

    // Show loading state
    showLoading();

    // Call Spring Boot API
    fetch('/api/profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            regulatoryText: regulatoryTextValue,
            transactions: transactions
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Network response was not ok') });
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            displayAnalysisResults(data.results);
        } else {
            showError(data.message || 'Analysis failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError(error.message || 'Failed to connect to analysis service');
    });
}

function prepareTransactionData() {
    const rows = document.querySelectorAll('#transactionData tr');
    const transactions = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        transactions.push({
            Customer_Id: parseInt(cells[0].textContent),
            Account_Balance: parseFloat(cells[1].textContent.replace(/,/g, '')),
            Transaction_Amount: parseFloat(cells[2].textContent.replace(/,/g, '')),
            Reported_Amount: parseFloat(cells[3].textContent.replace(/,/g, '')),
            Currency: cells[4].textContent,
            Country: cells[5].textContent,
            Transaction_Date: cells[6].textContent,
            Risk_Score: 3, // Default risk score
            Flags: cells[7].textContent
        });
    });

    return transactions;
}

function showLoading() {
    resultsContainer.innerHTML = `
        <div class="text-center py-5 animate__animated animate__pulse animate__infinite">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <h5 class="mt-3 text-primary">Analyzing Transactions</h5>
            <p class="text-muted">Processing transactions through compliance rules engine</p>
            <div class="progress mt-3" style="height: 8px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
            </div>
        </div>
    `;
}

function showError(message) {
    resultsContainer.innerHTML = `
        <div class="alert alert-danger animate__animated animate__shakeX">
            <i class="bi bi-exclamation-octagon-fill me-2"></i>
            ${message}
        </div>
    `;
}

function displayAnalysisResults(results) {
    let html = `
    <div class="analysis-results animate__animated animate__fadeIn">
        <div class="alert alert-success d-flex align-items-center">
            <i class="bi bi-check-circle-fill me-2" style="font-size: 1.5rem;"></i>
            <div>
                <h5 class="mb-0">Analysis Complete</h5>
                <p class="mb-0">${results.errors.length} issues found in ${results.risk_scores.length} transactions</p>
            </div>
        </div>

        <ul class="nav nav-pills mb-4" id="analysisTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="summary-tab" data-bs-toggle="pill" data-bs-target="#summary" type="button" role="tab">
                    <i class="bi bi-speedometer2 me-1"></i>Summary
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="rules-tab" data-bs-toggle="pill" data-bs-target="#rules" type="button" role="tab">
                    <i class="bi bi-list-check me-1"></i>Rules
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="issues-tab" data-bs-toggle="pill" data-bs-target="#issues" type="button" role="tab">
                    <i class="bi bi-exclamation-triangle me-1"></i>Issues
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="remediations-tab" data-bs-toggle="pill" data-bs-target="#remediations" type="button" role="tab">
                    <i class="bi bi-lightbulb me-1"></i>Remediations
                </button>
            </li>
        </ul>

        <div class="tab-content" id="analysisTabsContent">
            <div class="tab-pane fade show active" id="summary" role="tabpanel">
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="card summary-card h-100">
                            <div class="card-body">
                                <h6 class="card-title text-muted">Risk Distribution</h6>
                                <div id="riskChartContainer"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card summary-card h-100">
                            <div class="card-body">
                                <h6 class="card-title text-muted">Quick Stats</h6>
                                <div class="d-flex flex-column">
                                    <div class="d-flex justify-content-between py-2 border-bottom">
                                        <span>Total Transactions</span>
                                        <span class="fw-bold">${results.risk_scores.length}</span>
                                    </div>
                                    <div class="d-flex justify-content-between py-2 border-bottom">
                                        <span>Validation Errors</span>
                                        <span class="fw-bold text-danger">${results.errors.length}</span>
                                    </div>
                                    <div class="d-flex justify-content-between py-2 border-bottom">
                                        <span>Anomalies Detected</span>
                                        <span class="fw-bold text-warning">${results.anomalies.length}</span>
                                    </div>
                                    <div class="d-flex justify-content-between py-2 border-bottom">
                                        <span>High Risk Transactions</span>
                                        <span class="fw-bold text-danger">${results.risk_scores.filter(r => r.Calculated_Risk_Score >= 7).length}</span>
                                    </div>
                                    <div class="d-flex justify-content-between py-2">
                                        <span>Remediation Actions</span>
                                        <span class="fw-bold text-primary">${results.remediations.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    Analysis completed at ${new Date().toLocaleTimeString()}. Click on other tabs for detailed results.
                </div>
            </div>

            <div class="tab-pane fade" id="rules" role="tabpanel">
                <div class="row">
    `;

    // Add rules
    results.rules.rules.forEach(rule => {
        html += `
        <div class="col-md-6 mb-3">
            <div class="card rule-card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6 class="card-title">${rule.description}</h6>
                        <span class="badge bg-${rule.risk_score > 6 ? 'danger' : rule.risk_score > 3 ? 'warning' : 'success'}">
                            ${rule.risk_score}/10
                        </span>
                    </div>
                    <p class="card-text text-muted small mt-2">${rule.condition}</p>
                    <div class="risk-indicator mt-2">
                        <div style="width: ${rule.risk_score * 10}%; height: 100%;
                            background: ${rule.risk_score > 6 ? '#ef4444' : rule.risk_score > 3 ? '#f59e0b' : '#4ade80'};
                            border-radius: 5px;"></div