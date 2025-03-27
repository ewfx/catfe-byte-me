from app.config import get_config

config = get_config()

class LLMService:
    def __init__(self):
        self.api_key = config.OPENAI_API_KEY
        self.model = config.OPENAI_MODEL
        self.temperature = config.OPENAI_TEMPERATURE

    def extract_rules(self, regulatory_text):
        import openai
        openai.api_key = self.api_key
        
        response = openai.ChatCompletion.create(
            model=self.model,
            temperature=self.temperature,
            messages=[...]
        )
        return response