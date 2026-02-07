from fastapi import APIRouter, Depends, HTTPException

auth_router = APIRouter(prefix="/auth", tags=['Auth'])




@auth_router.post('/login')
async def login():
    return {'message': 'login concluido'}

@auth_router.post('/logout')
async def logout():
    return {'message': 'logout concluido'}

