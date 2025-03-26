import os
import json
import numpy as np
import pandas as pd
from openai import OpenAI
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN


def safe_json_loads(response):
    """Safely loads JSON response from LLM"""
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return [{
            "rule_name": "default",
            "condition": "True",
            "severity": 1,
            "remediation": "Review manually"
        }]


class ComplianceEngine:
    def __init__(self, openai_api_key):
        if not openai_api_key:
            raise ValueError("Missing OpenAI API Key")

        self.llm = OpenAI(api_key=openai_api_key, model="gpt-3.5-turbo", temperature=0)
        self.historical_violations = []

    def extract_rules(self, regulatory_text):
        """LLM-based rule extraction"""
        prompt = f"""
        Extract banking compliance rules from:
        {json.dumps(regulatory_text)}

        Return JSON with:
        - rule_name: string
        - condition: string
        - severity: int (1-5)
        - remediation: string
        """
        response = self.llm(prompt)
        return safe_json_loads(response)

    def detect_anomalies(self, df):
        """Unsupervised anomaly detection"""
        features = df.select_dtypes(include=[np.number]).dropna()
        if features.empty:
            df['Anomaly_Flag'] = False
            return df

        scaler = StandardScaler()
        X = scaler.fit_transform(features)
        model = DBSCAN(eps=1.5, min_samples=2)
        df['Anomaly_Flag'] = model.fit_predict(X) == -1
        return df

    def validate_data(self, df, rules):
        """Execute profiling rules"""
        results = []
        for _, row in df.iterrows():
            violations = []

            # Sample rule implementation
            if 'Transaction_Amount' in df.columns and 'Reported_Amount' in df.columns:
                if abs(row['Transaction_Amount'] - row['Reported_Amount']) > row['Transaction_Amount'] * 0.01:
                    violations.append({
                        "rule": "amount_mismatch",
                        "severity": 3,
                        "message": "Amounts differ by >1%"
                    })

            # Calculate risk score
            risk_score = self.calculate_risk_score(row, violations)

            results.append({
                **row.to_dict(),
                "Violations": violations,
                "Risk_Score": risk_score,
                "Remediation": self.suggest_remediation(violations)
            })
        return pd.DataFrame(results)

    def calculate_risk_score(self, row, violations):
        """Dynamic risk scoring"""
        base_score = row.get('Risk_Score', 0)
        for violation in violations:
            base_score += violation.get('severity', 0)
        return min(10, base_score)

    def suggest_remediation(self, violations):
        """LLM-generated fixes"""
        if not violations:
            return ["No issues found"]

        prompt = f"""
        Suggest fixes for these violations:
        {json.dumps(violations)}
        Respond with bullet points.
        """
        response = self.llm(prompt)
        return response.strip().split('\n')


def process_compliance_check(data_path, regulations):
    """End-to-end processing"""
    engine = ComplianceEngine(os.getenv("OPENAI_API_KEY"))
    df = pd.read_csv(data_path)
    rules = engine.extract_rules(regulations)
    df = engine.detect_anomalies(df)
    results = engine.validate_data(df, rules)
    return {
        "rules": rules,
        "results": results.to_dict(orient='records'),
        "anomalies": df[df['Anomaly_Flag']].to_dict(orient='records')
    }
