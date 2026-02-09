from pydantic import BaseModel
from typing import Optional, List

class UserSchema(BaseModel):
    name: str
    email: str
    senha: str
    ativo: Optional[bool]
    admin: Optional[bool] = False

    class Config:
        from_attributes = True

class LoginSchema(BaseModel):
    email: str
    senha: str