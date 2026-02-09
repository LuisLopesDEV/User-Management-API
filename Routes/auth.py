from fastapi import APIRouter, Depends, HTTPException
import bcrypt
from sqlalchemy.orm import Session
from main import SECRET_KEY, ACCESS_TOKEN_EXPIRES_MINUTES, ALGORITHM
from Database.database import User
from Routes.resources import get_session
from schemas import LoginSchema
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordRequestForm

auth_router = APIRouter(prefix="/auth", tags=['Auth'])


def authenticate_user(email, senha, session):
    user = session.query(User).filter(User.email == email).first()
    senha_bytes = senha.encode('utf-8')
    if not user:
        return False
    elif not bcrypt.checkpw(senha_bytes, user.senha.encode('utf-8')):
        return False
    else:
        return user

def create_token(id_usuario, duracao_token=timedelta(minutes=ACCESS_TOKEN_EXPIRES_MINUTES)):
    expiration_date = datetime.now(timezone.utc) + duracao_token
    dic_info = {'sub': str(id_usuario), 'exp': expiration_date}
    jwt_codify = jwt.encode(dic_info, SECRET_KEY, ALGORITHM)
    return jwt_codify

@auth_router.post('/login')
async def login(login_schema: LoginSchema,session: Session = Depends(get_session)):
    user = authenticate_user(login_schema.email,login_schema.senha, session)
    if not user:
        return HTTPException(status_code=400, detail='Email ou senha incorretos')
    else:
        access_token = create_token(user.id)
        refresh_token = create_token(user.id, duracao_token=timedelta(days=7))
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'bearer'
        }

@auth_router.post('/login-form')
async def login_form(
        form_data: OAuth2PasswordRequestForm = Depends(),
        session: Session = Depends(get_session)):

    user = authenticate_user(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(status_code=400, detail="Email ou senha incorreto")
    else:
        access_token = create_token(user.id)
        return {
            'access_token': access_token,
            'token_type': 'bearer'
        }

@auth_router.post('/logout')
async def logout():
    return {'message': 'logout concluido'}

