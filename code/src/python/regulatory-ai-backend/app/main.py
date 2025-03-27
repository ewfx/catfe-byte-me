from app.config import get_config
from flask import Flask

config = get_config()

def create_app():
    app = Flask(__name__)
    app.config['DEBUG'] = config.DEBUG
    
    if config.ENABLE_RATE_LIMITING:
        from flask_limiter import Limiter
        Limiter(app, default_limits=[config.API_RATE_LIMIT])
    
    return app