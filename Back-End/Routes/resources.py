from fastapi import Depends, HTTPException
from ..Database.database import db, Token
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timezone
from ..config import oauth2_schema


def get_session():
    """
    Fornece uma sessão ativa do banco de dados.

    Esta função é usada como dependência do FastAPI para
    garantir que cada requisição tenha acesso a uma sessão
    válida e corretamente fechada após o uso.

    Yields:
        Session: Sessão ativa do SQLAlchemy.
    """
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
    """
    Valida um token de autenticação.

    Verifica se o token:

    - Existe no banco
    - Está ativo
    - Não está expirado

    Args:
        token (str): Token JWT extraído da requisição.
        db (Session): Sessão ativa do banco de dados.

    Raises:
        HTTPException: Caso o token seja inválido ou expirado.

    Returns:
        User: Usuário associado ao token válido.
    """
    token_db = db.query(Token).filter(
        Token.token == token,
        Token.is_active == True,
        Token.expires_at > datetime.now(timezone.utc)
    ).first()

    if not token_db:
        raise HTTPException(status_code=401, detail="Token inválido")

    return token_db.user
