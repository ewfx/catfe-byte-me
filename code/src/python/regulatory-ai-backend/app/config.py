import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration"""
    DEBUG = False
    TESTING = False
    API_TITLE = 'Regulatory Compliance API'
    API_VERSION = 'v1'
    OPENAPI_VERSION = '3.0.3'
    
    # OpenAI Configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
    OPENAI_TEMPERATURE = float(os.getenv('OPENAI_TEMPERATURE', 0.7))
    
    # ML Model Configuration
    ANOMALY_CONTAMINATION = float(os.getenv('ANOMALY_CONTAMINATION', 0.1))
    DBSCAN_EPS = float(os.getenv('DBSCAN_EPS', 0.5))
    DBSCAN_MIN_SAMPLES = int(os.getenv('DBSCAN_MIN_SAMPLES', 3))
    
    # API Configuration
    API_RATE_LIMIT = os.getenv('API_RATE_LIMIT', '100 per hour')
    
    # High-risk countries (can be overridden by env var)
    HIGH_RISK_COUNTRIES = os.getenv(
        'HIGH_RISK_COUNTRIES', 
        'RU,CN,IR,KP,SY,SD,VE,MM'
    ).split(',')
    
    # Valid currencies (ISO 4217)
    VALID_CURRENCIES = os.getenv(
        'VALID_CURRENCIES',
        'USD,EUR,GBP,JPY,CAD,AUD,CHF,CNY,INR,MXN'
    ).split(',')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    OPENAI_TEMPERATURE = 0.9  # More creative responses during development


class ProductionConfig(Config):
    """Production configuration"""
    OPENAI_TEMPERATURE = 0.3  # More deterministic responses in production


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    OPENAI_API_KEY = 'test-key'
    OPENAI_MODEL = 'text-davinci-003'


def get_config():
    """Return appropriate config class based on environment"""
    env = os.getenv('FLASK_ENV', 'development')
    configs = {
        'development': DevelopmentConfig,
        'production': ProductionConfig,
        'testing': TestingConfig
    }
    return configs.get(env, DevelopmentConfig)()