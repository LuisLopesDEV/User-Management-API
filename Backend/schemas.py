from pydantic import BaseModel, NonNegativeFloat, NonNegativeInt, EmailStr, Secret, SecretStr
from typing import Optional, List

class UserSchema(BaseModel):
    name: str
    email: EmailStr
    senha: SecretStr
    ativo: Optional[bool] = True
    remember: Optional[bool] = False
    admin: Optional[bool] = False

    class Config:
        from_attributes = True

class ChangeSchema(BaseModel):
    nome: str
    email: EmailStr
    senha: SecretStr

    class Config:
        from_attributes = True

class DeleteSchema(BaseModel):
    confirm: bool = False

class LoginSchema(BaseModel):
    email: EmailStr
    senha: SecretStr
    class Config:
        from_attributes = True

class OrderSchema(BaseModel):
    item: str
    quantity: NonNegativeInt
    price: NonNegativeFloat
    class Config:
        from_attributes = True

# Response Schemas

class UserResponseSchema(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True

class OrderResponseSchemas(BaseModel):
    id: int
    user_id: int
    item: str
    quantity: int
    price: float

    class Config:
        from_attributes = True