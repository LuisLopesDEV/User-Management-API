from fastapi import FastAPI

app = FastAPI()

from Routes.auth import auth_router
from Routes.users import users_router
from Routes.requestes import requestes_router

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(requestes_router)