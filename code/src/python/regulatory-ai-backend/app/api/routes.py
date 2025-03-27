from flask import Blueprint, request, jsonify
from app.config import get_config
from app.services.compliance_service import ComplianceService

config = get_config()
api_blueprint = Blueprint('api', __name__)

@api_blueprint.route('/analyze', methods=['POST'])
def analyze():
    if request.headers.get('X-API-KEY') != config.API_SECRET_KEY:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Process request