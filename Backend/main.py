from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

app = FastAPI()
templates = Jinja2Templates(directory="Back-End/templates")

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )

from .Routes.auth import auth_router
from .Routes.users import users_router
from .Routes.requestes import requestes_router

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(requestes_router)