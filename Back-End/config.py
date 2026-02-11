from dotenv import load_dotenv
from pathlib import Path
import os
from fastapi.security import OAuth2PasswordBearer

env_path = Path(__file__).resolve().parent / ".env"   # se o .env está na mesma pasta do config.py
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRES_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRES_MINUTES", "30"))

oauth2_schema = OAuth2PasswordBearer(tokenUrl="/auth/login-form")