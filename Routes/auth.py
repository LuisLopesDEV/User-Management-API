from fastapi import APIRouter, Depends, HTTPException
import bcrypt
from sqlalchemy.orm import Session
from main import SECRET_KEY, ACCESS_TOKEN_EXPIRES_MINUTES, ALGORITHM, oauth2_schema
from Database.database import User, Token
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

def create_token(user_id: int, remember: bool):
    if remember:
        expires = timedelta(days=30)
    else:
        expires = timedelta(minutes=30)

    expires_at = datetime.now(timezone.utc) + expires

    payload = {
        "sub": str(user_id),
        "exp": expires_at
    }

    token = jwt.encode(payload, SECRET_KEY, ALGORITHM)
    return token, expires_at

@auth_router.post('/login')
async def login(
    login_schema: LoginSchema,
    db: Session = Depends(get_session)
):
    user = authenticate_user(
        login_schema.email,
        login_schema.senha,
        db
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail='Email ou senha incorretos'
        )

    token, expires_at = create_token(user.id, user.remember)

    token_db = Token(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )

    db.add(token_db)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_at": expires_at
    }

@auth_router.post('/login-form')
async def login_form(
        form_data: OAuth2PasswordRequestForm = Depends(),
        session: Session = Depends(get_session)):

    user = authenticate_user(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(status_code=400, detail="Email ou senha incorreto")

    token, expires_at = create_token(user.id, user.remember)
    token_db = Token(
        token=token,
        user_id=user.id,
        expires_at=expires_at,
        is_active=True
    )

    session.add(token_db)
    session.commit()
    return {
        "access_token": token,
        "token_type": "bearer"
    }

@auth_router.post('/logout')
def logout(token: str = Depends(oauth2_schema), db: Session = Depends(get_session)):
    token_db = db.query(Token).filter(Token.token == token, Token.is_active==True).first()
    print(token)
    if not token_db:
        raise HTTPException(status_code=400, detail="Token já inválido")
    token_db.is_active = False
    db.commit()
    return {'message': 'Logout realizado com sucesso'}

