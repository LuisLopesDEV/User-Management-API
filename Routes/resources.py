from fastapi import Depends, HTTPException
from Database.database import db, User

from sqlalchemy.orm import sessionmaker, Session
from jose import jwt, JWTError
from main import SECRET_KEY, ALGORITHM, oauth2_schema

def get_session():
    try:
        SessionLocal = sessionmaker(bind=db)
        session = SessionLocal()
        yield session
    finally:
        session.close()

def verify_token(token: str = Depends(oauth2_schema), session: Session = Depends(get_session)):
    try:
        dict_info = jwt.decode(token, SECRET_KEY, ALGORITHM)
        id_usuario = int(dict_info.get("sub"))
    except:
        raise HTTPException(status_code=401, detail='Acesso Negado')
    user = session.query(User).filter(User.id == id_usuario).first()
    if not user:
        raise HTTPException(status_code=401, detail='Acesso Inválido')

    return user
