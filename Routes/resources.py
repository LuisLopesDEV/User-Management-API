from fastapi import Depends, HTTPException
from Database.database import db, User
from sqlalchemy.orm import sessionmaker, Session
from jose import jwt, JWTError
from main import SECRET_KEY, ALGORITHM, oauth2_schema
from security import token_blacklist

def get_session():
    try:
        SessionLocal = sessionmaker(bind=db)
        session = SessionLocal()
        yield session
    finally:
        session.close()

def verify_token(
    token: str = Depends(oauth2_schema),
    db: Session = Depends(get_session)
):
    token_db = db.query(Token).filter(
        Token.token == token,
        Token.is_active == True,
        Token.expires_at > datetime.now(timezone.utc)
    ).first()

    if not token_db:
        raise HTTPException(status_code=401, detail="Token inválido")

    return token_db.user