from app.config import get_config

config = get_config()

def validate_currency(currency):
    return currency in config.VALID_CURRENCIES

def is_high_risk_country(country):
    return country in config.HIGH_RISK_COUNTRIES