from fastapi import FastAPI
app = FastAPI()

from Routes.auth import auth_router

app.include_router(auth_router)