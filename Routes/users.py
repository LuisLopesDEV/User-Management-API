from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordRequestForm
from Database.database import User
from schemas import UserSchema
from Routes.resources import get_session

users_router = APIRouter(prefix='/users', tags=['Users'])

@auth_router.post('/signup')
async def signup(schema_user: UserSchema, session: Session = Depends(get_session())):
    new_user = User(
        schema_user.username,
        schema_user.email,
        schema_user.password,
        schema_user.active,
        schema_user.admin
    )
    session.add(new_user)
    session.commit()
    return {'mensagem': f'Usuário criado com sucesso! Email: {usuario_schema.email}'}