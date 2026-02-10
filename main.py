from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')
ACCESS_TOKEN_EXPIRES_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRES_MINUTES"))

app = FastAPI()

oauth2_schema = OAuth2PasswordBearer(tokenUrl="auth/login-form")

from Routes.auth import auth_router
from Routes.users import users_router
from Routes.requestes import requestes_router

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(requestes_router)