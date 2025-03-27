"""
Regulatory Compliance AI Backend

This package provides AI-powered regulatory compliance analysis for financial transactions.
"""

__version__ = "1.0.0"
__all__ = ['config', 'services', 'models', 'utils', 'api']

from flask import Flask
from app.config import get_config

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    config = get_config()
    
    # Configure application
    app.config.from_object(config)
    
    # Initialize extensions
    from app.api import api_blueprint
    app.register_blueprint(api_blueprint)
    
    return app