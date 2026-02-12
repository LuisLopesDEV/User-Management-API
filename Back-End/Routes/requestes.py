from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..Database.database import User, Order
from ..schemas import OrderSchema, OrderResponseSchemas
from ..Routes.resources import get_session, verify_token

requestes_router = APIRouter(prefix='/requests', tags=['Requests'], dependencies=[Depends(verify_token)])


@requestes_router.post('', response_model=OrderResponseSchemas)
async def create_order(order_schema: OrderSchema, user: User = Depends(verify_token), session: Session = Depends(get_session)):
    """
    Cria um novo pedido para o usuário autenticado.

    Args:
        order_schema (OrderSchema): Dados do pedido a ser criado.
        user (User): Usuário autenticado via token.
        session (Session): Sessão ativa do banco de dados.

    Returns:
        Order: Pedido recém-criado.
    """
    new_order = Order(
        user.id,
        order_schema.item,
        order_schema.quantity,
        order_schema.price,
    )
    session.add(new_order)
    session.commit()
    return new_order


@requestes_router.get('')
async def list_order(order_id: int, user: User = Depends(verify_token), session: Session = Depends(get_session)):
    """
    Retorna um pedido específico com base no ID.

    Args:
        order_id (int): ID do pedido.
        user (User): Usuário autenticado.
        session (Session): Sessão do banco de dados.

    Raises:
        HTTPException: Se o pedido não existir ou não pertencer ao usuário.

    Returns:
        list[Order]: Lista contendo o pedido encontrado.
    """
    order = session.query(Order).filter(Order.id == order_id)\
        .limit(1)\
        .all()

    if not order:
        raise HTTPException(status_code=400, detail='Pedido não encontrado')

    if not user.admin and order.user_id != user.id:
        raise HTTPException(
            status_code=403,
            detail='Você não tem autorização para fazer essa modificação!'
        )

    return order


@requestes_router.get('/{order_id}')
async def list_orders(user: User = Depends(verify_token), session: Session = Depends(get_session), limit: int = 10, offset: int = 0):
    """
    Lista pedidos do sistema (apenas administradores).

    Args:
        user (User): Usuário autenticado.
        session (Session): Sessão do banco.
        limit (int): Quantidade máxima de registros.
        offset (int): Deslocamento para paginação.

    Raises:
        HTTPException: Caso o usuário não seja administrador.

    Returns:
        list[Order]: Lista de pedidos.
    """
    if not user.admin:
        raise HTTPException(status_code=403, detail='Você não tem autorização para fazer essa operação!')

    orders = session.query(Order)\
        .offset(offset)\
        .limit(limit)\
        .all()

    return orders


@requestes_router.put('/{order_id}')
async def update_order(order_id: int, order_schema: OrderSchema, user: User = Depends(verify_token), session: Session = Depends(get_session)):
    """
    Atualiza um pedido existente.

    Args:
        order_id (int): ID do pedido.
        order_schema (OrderSchema): Novos dados do pedido.
        user (User): Usuário autenticado.
        session (Session): Sessão do banco.

    Raises:
        HTTPException: Se o pedido não existir ou o usuário não tiver permissão.

    Returns:
        dict: Mensagem de sucesso.
    """
    order = session.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=400, detail='Pedido não encontrado')

    if not user.admin and order.user_id != user.id:
        raise HTTPException(status_code=403, detail='Você não tem autorização para fazer essa operação!')

    order.user_id = order.user_id
    order.item = order_schema.item
    order.quantity = order_schema.quantity
    order.price = order_schema.price

    session.commit()
    session.refresh(order)

    return {
        "message": "Pedido atualizado com sucesso!"
    }


@requestes_router.delete('/{order_id}')
async def delete_order(order_id: int, user: User = Depends(verify_token), session: Session = Depends(get_session)):
    """
    Remove um pedido do sistema.

    Args:
        order_id (int): ID do pedido.
        user (User): Usuário autenticado.
        session (Session): Sessão do banco.

    Raises:
        HTTPException: Se o pedido não existir ou o usuário não tiver autorização.

    Returns:
        dict: Mensagem de confirmação.
    """
    order = session.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=400, detail='Pedido não encontrado')

    if not user.admin and order.user_id != user.id:
        raise HTTPException(
            status_code=403,
            detail='Você não tem autorização para fazer essa operação!'
        )

    session.delete(order)
    session.commit()

    return {'message': 'Pedido deletado com sucesso!'}
