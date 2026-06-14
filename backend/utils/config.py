import os

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "feedflow_hackathon_super_secret_key_1337_lol")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./feedflow.db")

settings = Settings()
