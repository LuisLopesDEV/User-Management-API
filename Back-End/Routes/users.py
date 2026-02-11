from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm
import bcrypt
from ..Database.database import User
from ..schemas import UserSchema, ChangeSchema, DeleteSchema, UserResponseSchema
from ..Routes.resources import get_session, verify_token
from typing import List

users_router = APIRouter(prefix='/users', tags=['Users'])

@users_router.post('', response_model=UserResponseSchema)
async def signup(schema_user: UserSchema, session: Session = Depends(get_session)):
    email = session.query(User).filter(User.email == schema_user.email).first()
    senha_bytes = schema_user.senha.encode('utf-8')
    hash_senha = bcrypt.hashpw(senha_bytes, bcrypt.gensalt())

    if email:
        raise HTTPException(
            status_code=400,
            detail="Email já cadastrado!"
        )
    else:
        new_user = User(
            schema_user.name,
            schema_user.email,
            hash_senha.decode('utf-8'),
            schema_user.ativo,
            schema_user.remember_me,
            schema_user.admin
        )
        session.add(new_user)
        session.commit()
    return new_user

@users_router.get('', response_model=list[UserResponseSchema])
async def all_users(user: User = Depends(verify_token), session: Session = Depends(get_session)):
    if not user.admin:
        raise HTTPException(
            status_code=403,
            detail='Você não tem autorização para fazer essa operação'
        )
    users = session.query(User).all()
    return users

@users_router.put('/{user_id}')
async def change_user(schema_user: ChangeSchema, user: User= Depends(verify_token), session: Session = Depends(get_session)):
    user = session.query(User).filter(User.id == user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail='Usuario não cadastrado')
    user.name = schema_user.name
    user.email = schema_user.email
    senha_bytes = schema_user.senha.encode('utf-8')
    hash_senha = bcrypt.hashpw(senha_bytes, bcrypt.gensalt())
    user.senha = hash_senha

    session.commit()
    session.refresh(user)
    return {
        "message": "Usuário atualizado com sucesso"
    }

@users_router.delete('/{user_id}')
async def delete_user(delete_schema: DeleteSchema, user: User= Depends(verify_token), session: Session = Depends(get_session)):
    user = session.query(User).filter(User.id == user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail='Usuario não cadastrado')

    if delete_schema.confirm == True:
        session.delete(user)
        session.commit()
        return {
            "message": "Usuário deletado com sucesso"
        }
    else:
        raise HTTPException(status_code=400, detail='Confirme para deletar o usuário!')