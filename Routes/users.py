import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordRequestForm
import bcrypt
from Database.database import User
from schemas import UserSchema
from Routes.resources import get_session, verify_token

users_router = APIRouter(prefix='/users', tags=['Users'])

@users_router.post('/signup')
async def signup(schema_user: UserSchema, session: Session = Depends(get_session)):
    email = session.query(User).filter(User.email == schema_user.email).first()
    senha_bytes = schema_user.senha.encode('utf-8')
    hash_senha = bcrypt.hashpw(senha_bytes, bcrypt.gensalt())

    if email:
        return{'mensagem': 'email já cadastrado!'}
    else:
        new_user = User(
            schema_user.name,
            schema_user.email,
            hash_senha,
            schema_user.ativo,
            schema_user.admin
        )
        session.add(new_user)
        session.commit()
    return {'mensagem': f'Usuário criado com sucesso! Email: {schema_user.email}'}

@users_router.get('/users')
async def all_users(user: User = Depends(verify_token), session: Session = Depends(get_session)):
    if not user.admin:
        raise HTTPException(
            status_code=403,
            detail='Você não tem autorização para fazer essa operação'
        )
    users = session.query(User).all()
    return {'users': users}
