from urllib.request import Request

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordRequestForm
import bcrypt
from Database.database import User
from schemas import UserSchema
from Routes.resources import get_session, verify_token

requestes_router = APIRouter(prefix='/requests', tags=['Requests'])

@requestes_router.post('/create_order')
async def create_order():
    return {'message': 'Welcome!'}

@requestes_router.get('/list_order/{order_id}')
async def list_order():
    return {'message': 'Welcome!'}

@requestes_router.get('/list_all_orders')
async def list_orders():
    return {'message': 'Welcome!'}

@requestes_router.put('/update_order/{order_id}')
async def update_order():
    return {'message': 'Welcome!'}

@requestes_router.delete('/delete_order/{order_id}')
async def delete_order():
    return {'message': 'Welcome!'}
