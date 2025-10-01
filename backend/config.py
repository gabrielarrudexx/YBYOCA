import os

# Security Configuration
SECRET_KEY = os.environ.get("SECRET_KEY", "YBYOCA_SECRET_KEY_CHANGE_IN_PRODUCTION")
ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30").strip())
except (ValueError, TypeError):
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database Configuration
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./ybyoca.db")

# Application Configuration
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")
