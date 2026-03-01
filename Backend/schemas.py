from pydantic import BaseModel, NonNegativeFloat, NonNegativeInt, EmailStr, Secret, SecretStr, conint
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

class UserLocalSchema(BaseModel):
    cep: str
    city: str
    neighborhood: str
    street: str
    number: str
    complement: Optional[str] = None
    
    class Config:
        from_attributes = True

class SignupSchema(BaseModel):
    schema_user: UserSchema
    schema_local: UserLocalSchema        

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



class OrderItemCreateSchema(BaseModel):
    product_id: str              # ex: "espresso"
    qty: conint(ge=1)            # mínimo 1
    size_id: Optional[str] = None
    addon_id: Optional[str] = None

class OrderCreateSchema(BaseModel):
    items: List[OrderItemCreateSchema]



# Response Schemas

class UserResponseSchema(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True
        
class OrderItemResponseSchema(BaseModel):
    product_id: str
    qty: int
    size_id: Optional[str] = None
    addon_id: Optional[str] = None

    class Config:
        from_attributes = True

class OrderResponseSchema(BaseModel):
    user_id: int
    order_id: int
    items: List[OrderItemResponseSchema]

    class Config:
        from_attributes = True