from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm
import bcrypt
from Database.database import User
from schemas import UserSchema, ChangeSchema, DeleteSchema
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
            schema_user.remember_me,
            schema_user.admin
        )
        session.add(new_user)
        session.commit()
    return {'mensagem': f'Usuário criado com sucesso! Email: {schema_user.email}'}

@users_router.get('/allUsers')
async def all_users(user: User = Depends(verify_token), session: Session = Depends(get_session)):
    if not user.admin:
        raise HTTPException(
            status_code=403,
            detail='Você não tem autorização para fazer essa operação'
        )
    users = session.query(User).all()
    return {'users': users}

@users_router.put('/change_user')
async def change_user(schema_user: ChangeSchema, user: User= Depends(verify_token), session: Session = Depends(get_session)):
    user = session.query(User).filter(User.id == user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail='Usuario não cadastrado')
    user.name = schema_user.name
    user.email = schema_user.email
    user.remember = schema_user.remember_me
    senha_bytes = schema_user.senha.encode('utf-8')
    hash_senha = bcrypt.hashpw(senha_bytes, bcrypt.gensalt())
    user.senha = hash_senha

    session.commit()
    session.refresh(user)
    return {
        "message": "Usuário atualizado com sucesso"
    }

@users_router.delete('/delete_user')
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