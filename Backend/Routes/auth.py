import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta, timezone
from ..config import SECRET_KEY, ALGORITHM, oauth2_schema
from ..Database.database import User, Token
from ..Routes.resources import get_session
from ..schemas import LoginSchema

auth_router = APIRouter(prefix="/auth", tags=['Auth'])


def authenticate_user(email, senha, session):
    """
    Autentica um usuário com base em email e senha.

    Args:
        email (str): Email do usuário.
        senha (str): Senha em texto puro fornecida pelo usuário.
        session (Session): Sessão ativa do banco de dados.

    Returns:
        User | bool:
            Retorna o objeto User se a autenticação for bem-sucedida,
            caso contrário retorna False.
    """
    user = session.query(User).filter(User.email == email).first()
    senha_bytes = senha.encode('utf-8')

    if not user:
        return False
    elif not bcrypt.checkpw(senha_bytes, user.senha.encode('utf-8')):
        return False
    else:
        return user


def create_token(user_id: int, remember: bool):
    """
    Cria um token JWT para o usuário autenticado.

    Args:
        user_id (int): ID do usuário autenticado.
        remember (bool): Define se o token terá expiração longa ou curta.

    Returns:
        tuple[str, datetime]:
            Token JWT gerado e data/hora de expiração.
    """
    expires = timedelta(days=30) if remember else timedelta(minutes=30)
    expires_at = datetime.now(timezone.utc) + expires

    payload = {"sub": str(user_id),"exp": expires_at}

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token, expires_at


@auth_router.post('/login')
async def login(
    login_schema: LoginSchema,
    db: Session = Depends(get_session)
):
    """
    Endpoint de login via JSON.

    Valida as credenciais do usuário e gera um token JWT válido,
    persistindo-o no banco de dados.

    Args:
        login_schema (LoginSchema): Dados de autenticação do usuário.
        db (Session): Sessão do banco de dados injetada pelo FastAPI.

    Raises:
        HTTPException: Caso email ou senha estejam incorretos.

    Returns:
        dict: Token de acesso, tipo e data de expiração.
    """
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


@auth_router.post('/login-form', include_in_schema=False)
async def login_form(
        form_data: OAuth2PasswordRequestForm = Depends(),
        session: Session = Depends(get_session)):
    """
    Endpoint de login compatível com OAuth2PasswordRequestForm.

    Usado principalmente para autenticação via Swagger UI
    ou fluxos padrão OAuth2.

    Args:
        form_data (OAuth2PasswordRequestForm): Credenciais do formulário.
        session (Session): Sessão do banco de dados.

    Raises:
        HTTPException: Caso as credenciais sejam inválidas.

    Returns:
        dict: Token de acesso e tipo.
    """
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
    """
    Endpoint de logout do usuário.

    Invalida o token JWT atual marcando-o como inativo no banco.

    Args:
        token (str): Token JWT obtido via dependência OAuth2.
        db (Session): Sessão do banco de dados.

    Raises:
        HTTPException: Caso o token já esteja inválido.

    Returns:
        dict: Mensagem de sucesso.
    """
    token_db = db.query(Token).filter(Token.token == token, Token.is_active==True).first()

    if not token_db:
        raise HTTPException(status_code=401, detail="Token já inválido")
    token_db.is_active = False
    db.commit()
    return {'message': 'Logout realizado com sucesso'}
