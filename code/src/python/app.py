# ai_backend/app.py
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import openai
import os
from dotenv import load_dotenv
import re
from datetime import datetime, timedelta

app = Flask(__name__)

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

class ComplianceAnalyzer:
    def __init__(self):
        self.scaler = StandardScaler()
        self.high_risk_countries = ['RU', 'CN', 'IR', 'KP', 'SY']
        self.valid_currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF']
        
    def extract_rules(self, regulatory_text):
        """Use LLM to extract profiling rules from regulatory instructions"""
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{
                    "role": "system",
                    "content": "You are a regulatory compliance expert. Extract data validation rules from the provided text."
                }, {
                    "role": "user",
                    "content": f"Extract data validation rules as JSON with these fields for each rule: description, condition (as Python lambda), error_message, risk_score (1-10).\n\n{regulatory_text}"
                }]
            )
            return self._parse_rules(response.choices[0].message.content)
        except Exception as e:
            print(f"Error extracting rules: {str(e)}")
            return {"rules": []}

    def _parse_rules(self, rules_text):
        """Parse rules from LLM response"""
        try:
            # Extract JSON from markdown if present
            json_match = re.search(r'```json\n(.*?)\n```', rules_text, re.DOTALL)
            if json_match:
                rules_text = json_match.group(1)
            return eval(rules_text)
        except:
            return {"rules": []}

    def detect_anomalies(self, df):
        """Detect anomalies using unsupervised learning"""
        try:
            # Prepare features
            features = df[['Account_Balance', 'Transaction_Amount', 'Reported_Amount']].fillna(0)
            features['Amount_Diff'] = abs(features['Transaction_Amount'] - features['Reported_Amount'])
            
            # Scale features
            X = self.scaler.fit_transform(features)
            
            # Anomaly detection
            clf = IsolationForest(contamination=0.1, random_state=42)
            df['Is_Anomaly'] = clf.fit_predict(X)
            df['Is_Anomaly'] = np.where(df['Is_Anomaly'] == -1, 1, 0)
            
            # Clustering
            dbscan = DBSCAN(eps=0.5, min_samples=3)
            df['Anomaly_Cluster'] = dbscan.fit_predict(X)
            
            return df
        except Exception as e:
            print(f"Anomaly detection error: {str(e)}")
            df['Is_Anomaly'] = 0
            df['Anomaly_Cluster'] = -1
            return df

    def calculate_risk_scores(self, df, rules):
        """Calculate dynamic risk scores"""
        try:
            df['Calculated_Risk_Score'] = 0
            
            # Apply rule-based scoring
            for rule in rules.get('rules', []):
                try:
                    condition = eval(rule['condition'])
                    df['Rule_Violation'] = df.apply(condition, axis=1).astype(int)
                    df['Calculated_Risk_Score'] += df['Rule_Violation'] * rule.get('risk_score', 3)
                except Exception as e:
                    print(f"Error applying rule: {str(e)}")
            
            # Add additional risk factors
            df['Calculated_Risk_Score'] += np.where(
                df['Transaction_Amount'] > 5000, 2, 0)
            
            df['Calculated_Risk_Score'] += np.where(
                df['Country'].isin(self.high_risk_countries), 3, 0)
            
            df['Calculated_Risk_Score'] += np.where(
                df['Transaction_Amount'] == df['Transaction_Amount'].round(-3), 2, 0)  # Round numbers
            
            # Normalize to 1-10 scale
            df['Calculated_Risk_Score'] = np.clip(df['Calculated_Risk_Score'], 1, 10)
            
            return df
        except Exception as e:
            print(f"Risk scoring error: {str(e)}")
            df['Calculated_Risk_Score'] = df.get('Risk_Score', 3)
            return df

    def validate_data(self, df, rules):
        """Validate data against generated rules"""
        errors = []
        for rule in rules.get('rules', []):
            try:
                condition = eval(rule['condition'])
                violations = df[~df.apply(condition, axis=1)]
                for _, row in violations.iterrows():
                    errors.append({
                        'customer_id': row['Customer_Id'],
                        'error': rule['error_message'],
                        'error_type': rule['description'].split(':')[0],
                        'rule': rule['description']
                    })
            except Exception as e:
                print(f"Validation error: {str(e)}")
        return errors

    def generate_remediation(self, error_type):
        """Generate remediation suggestions"""
        suggestions = {
            "Transaction_Amount mismatch": [
                "Verify currency conversion rates",
                "Check for data entry errors",
                "Confirm reported amount with source"
            ],
            "Negative balance": [
                "Verify account overdraft status",
                "Contact customer for funds",
                "Review account terms"
            ],
            "Invalid currency": [
                "Check currency code against ISO 4217",
                "Verify transaction origin",
                "Update currency code if incorrect"
            ],
            "High-risk transaction": [
                "Perform enhanced due diligence",
                "File suspicious activity report if needed",
                "Verify customer identity"
            ],
            "Old transaction": [
                "Verify if transaction should be processed",
                "Check for system date issues",
                "Confirm with accounting department"
            ],
            "Future-dated transaction": [
                "Verify transaction date",
                "Check for system date issues",
                "Confirm with customer if needed"
            ]
        }
        return suggestions.get(error_type, ["Review transaction manually"])

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        regulatory_text = data.get('regulatory_text', '')
        transactions = data.get('transactions', [])
        
        # Convert to DataFrame
        df = pd.DataFrame(transactions)
        
        # Initialize analyzer
        analyzer = ComplianceAnalyzer()
        
        # Step 1: Extract rules
        rules = analyzer.extract_rules(regulatory_text)
        
        # Step 2: Validate data
        errors = analyzer.validate_data(df, rules)
        
        # Step 3: Detect anomalies
        df = analyzer.detect_anomalies(df)
        
        # Step 4: Calculate risk scores
        df = analyzer.calculate_risk_scores(df, rules)
        
        # Step 5: Generate remediations
        remediations = []
        for error in errors:
            remediation = analyzer.generate_remediation(error['error_type'])
            remediations.append({
                'customer_id': error['customer_id'],
                'error': error['error'],
                'remediation': remediation
            })
        
        # Prepare results
        anomalies = df[df['Is_Anomaly'] == 1].to_dict('records')
        risk_scores = df[['Customer_Id', 'Calculated_Risk_Score']].to_dict('records')
        
        return jsonify({
            'status': 'success',
            'results': {
                'rules': rules,
                'errors': errors,
                'anomalies': anomalies,
                'risk_scores': risk_scores,
                'remediations': remediations
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)