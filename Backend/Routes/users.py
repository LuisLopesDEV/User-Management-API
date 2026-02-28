import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..Database.database import User, Local
from ..schemas import UserSchema, ChangeSchema, DeleteSchema, UserResponseSchema, UserLocalSchema
from ..Routes.resources import get_session, verify_token

users_router = APIRouter(prefix='/users', tags=['Users'])


@users_router.post('', response_model=UserResponseSchema)
async def signup(schema_user: UserSchema,schema_local: UserLocalSchema, session: Session = Depends(get_session)):
    """
    Cria um novo usuário no sistema.

    Realiza verificação de email duplicado e aplica hash
    seguro na senha antes de persistir no banco.

    Args:
        schema_user (UserSchema): Dados do usuário a ser criado.
        session (Session): Sessão ativa do banco de dados.

    Raises:
        HTTPException: Caso o email já esteja cadastrado.

    Returns:
        User: Usuário recém-criado.
    """
    email = session.query(User).filter(User.email == schema_user.email).first()

    senha_str = schema_user.senha.get_secret_value()
    senha_bytes = senha_str.encode("utf-8")
    hash_senha = bcrypt.hashpw(senha_bytes, bcrypt.gensalt()).decode("utf-8")

    if email:
        raise HTTPException(status_code=400, detail="Email já cadastrado!")
    else:
        new_user = User(
            name=schema_user.name,
            email=schema_user.email,
            senha=hash_senha,
            ativo=schema_user.ativo,
            remember=schema_user.remember,
            admin=schema_user.admin,
        )

        session.add(new_user)
        session.flush()  # gera new_user.id

        new_userlocal = Local(
            cep=schema_local.cep,
            city=schema_local.city,
            neighborhood=schema_local.neighborhood,
            street=schema_local.street,
            number=schema_local.number,
            complement=schema_local.complement,
            user_id=new_user.id,
        )

        session.add(new_userlocal)
        session.commit()
        session.refresh(new_user)
        return new_user


@users_router.get('', response_model=list[UserResponseSchema])
async def all_users(
    user: User = Depends(verify_token),
    session: Session = Depends(get_session),
    limit: int = Query(1, ge=1),
    offset: int = Query(0, ge=0)
):
    """
    Lista usuários cadastrados.

    Apenas usuários administradores podem acessar este endpoint.

    Args:
        user (User): Usuário autenticado.
        session (Session): Sessão ativa do banco.
        limit (int): Quantidade máxima de registros retornados.
        offset (int): Deslocamento para paginação (não utilizado na query atual).

    Raises:
        HTTPException: Caso o usuário não seja administrador.

    Returns:
        list[User]: Lista de usuários.
    """
    if not user.admin:
        raise HTTPException(
            status_code=403,
            detail='Você não tem autorização para fazer essa operação'
        )
    users = session.query(User)\
        .limit(limit)\
        .all()
    return users

@users_router.get('/me', response_model=UserResponseSchema)
async def get_user(
    user: User = Depends(verify_token),
    session: Session = Depends(get_session)
):
    return session.query(User).filter(User.id == user.id).first()

@users_router.put('/me')
async def change_user(
    schema_user: ChangeSchema,
    user: User = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """
    Atualiza os dados do usuário autenticado.

    Permite alteração de nome, email e senha.

    Args:
        schema_user (ChangeSchema): Novos dados do usuário.
        user (User): Usuário autenticado.
        session (Session): Sessão ativa do banco.

    Raises:
        HTTPException: Caso o usuário não exista.

    Returns:
        dict: Mensagem de confirmação.
    """
    user = session.query(User).filter(User.id == user.id).first()

    if not user:
        raise HTTPException(status_code=404, detail='Usuario não cadastrado')
    
    user.name = schema_user.nome
    user.email = schema_user.email

    senha_bytes = schema_user.senha.encode('utf-8')
    hash_senha = bcrypt.hashpw(senha_bytes, bcrypt.gensalt())
    user.senha = hash_senha.decode('utf-8')

    session.commit()
    session.refresh(user)

    return {"message": "Usuário atualizado com sucesso"}


@users_router.delete('/me')
async def delete_user(
    delete_schema: DeleteSchema,
    user: User = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """
    Remove o usuário autenticado do sistema.

    Exige confirmação explícita para evitar exclusões acidentais.

    Args:
        delete_schema (DeleteSchema): Dados de confirmação.
        user (User): Usuário autenticado.
        session (Session): Sessão ativa do banco.

    Raises:
        HTTPException: Caso o usuário não exista ou confirmação seja falsa.

    Returns:
        dict: Mensagem de sucesso.
    """
    user = session.query(User).filter(User.id == user.id).first()

    if not user:
        raise HTTPException(status_code=404, detail='Usuario não cadastrado')

    if delete_schema.confirm == True:
        session.delete(user)
        session.commit()
        return {"message": "Usuário deletado com sucesso"}
    else:
        raise HTTPException(status_code=400, detail='Confirme para deletar o usuário!')
