from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordRequestForm
from Database.database import User
from schemas import UserSchema
from Routes.resources import get_session

users_router = APIRouter(prefix='/users', tags=['Users'])

@users_router.post('/signup')
async def signup(schema_user: UserSchema, session: Session = Depends(get_session)):
    email = session.query(User).filter(User.email == schema_user.email).first()
    if email:
        return{'mensagem': 'email já cadastrado!'}
    else:
        new_user = User(
            schema_user.name,
            schema_user.email,
            schema_user.senha,
            schema_user.ativo,
            schema_user.admin
        )
        session.add(new_user)
        session.commit()
    return {'mensagem': f'Usuário criado com sucesso! Email: {schema_user.email}'}