from pydantic import BaseModel
from typing import Optional, List

class UserSchema(BaseModel):
    name: str
    email: str
    senha: str
    ativo: Optional[bool]
    remember_me: Optional[bool] = False
    admin: Optional[bool] = False

    class Config:
        from_attributes = True

class ChangeSchema(BaseModel):
    nome: str
    email: str
    senha: str

    class Config:
        from_attributes = True

class DeleteSchema(BaseModel):
    confirm: bool = False

class LoginSchema(BaseModel):
    email: str
    senha: str
    class Config:
        from_attributes = True

class OrderSchema(BaseModel):
    item: str
    quantity: int
    price: float
    class Config:
        from_attributes = True