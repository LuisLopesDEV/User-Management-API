from pydantic import BaseModel
from typing import Optional, List

class UserSchema(BaseModel):
    username: str
    email: str
    password: str
    active: Optional[bool]
    admin: Optional[bool] = False

    class Config:
        from_attributes = True