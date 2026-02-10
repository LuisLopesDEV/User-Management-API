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

class LoginSchema(BaseModel):
    email: str
    senha: str
    class Config:
        from_attributes = True

class OrderSchema(BaseModel):
    user_id: int
    item: str
    quantity: int
    price: float
    class Config:
        from_attributes = True