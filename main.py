import uvicorn

from fastapi import Depends, FastAPI, WebSocket, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import FileResponse, RedirectResponse

from fastapi_login import LoginManager
from fastapi_login.exceptions import InvalidCredentialsException

from sqlalchemy.orm import Session

from typing import List

from models import Base, User, Chat
from schemas import ChatRequest, ChatRequestAdd, ConnectionManager
from crud import db_register_user, db_get_chats, db_add_chats
from database import SessionLocal, engine

from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
"""Websocket"""
websocket_manager = ConnectionManager()
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket_manager.broadcast(f"{data}")
    except Exception as e:
        pass
    finally:
        await websocket_manager.disconnect(websocket)
        
        
"""User part"""
class NotAuthenticatedException(Exception):
    pass

SECRET = "super-secret-key"
manager = LoginManager(SECRET, '/login', use_cookie=True,
                       custom_exception=NotAuthenticatedException)

@app.exception_handler(NotAuthenticatedException)
def auth_exception_handler(request: Request, exc: NotAuthenticatedException):
    """
    Redirect the user to the login page if not logged in
    """
    return RedirectResponse(url='/login')

@manager.user_loader() # 이게 있음으로써 Depends(manager)를 할 때마다 user를 구분하게 됨
def get_user(username: str, db: Session = None):
    if not db:
        with SessionLocal() as db:
            return db.query(User).filter(User.name == username).first()
    return db.query(User).filter(User.name == username).first()

@app.post('/token')
def login(response: Response, 
          data: OAuth2PasswordRequestForm = Depends()):
    username = data.username
    password = data.password

    user = get_user(username)
    if not user:
        raise InvalidCredentialsException
    if user.password != password:
        raise InvalidCredentialsException
    access_token = manager.create_access_token(
        data={'sub': username}
    )
    manager.set_cookie(response, access_token)
    return {'access_token': access_token}

@app.post('/register')
def register_user(response: Response,
                  data: OAuth2PasswordRequestForm = Depends(),
                  db: Session = Depends(get_db)):
    username = data.username
    password = data.password

    user = db_register_user(db, username, password)
    if user:
        access_token = manager.create_access_token(
            data={'sub': username}
        )
        manager.set_cookie(response, access_token)
        return "User created"
    else:
        return "Failed"


"""Chat part"""
@app.get("/chat", response_model=List[ChatRequest])
async def get_data(db: Session = Depends(get_db),
                   user=Depends(manager)):
    return db_get_chats(db, user)

@app.post("/chat", response_model=List[ChatRequest])
async def post_chat(chat_req: ChatRequestAdd, 
                    db: Session = Depends(get_db),
                    user=Depends(manager)):
    result = db_add_chats(db, user, chat_req)
    if not result:
        return None
    return db_get_chats(db, user)

"""Website part"""
@app.get("/")
async def client(request: Request, user=Depends(manager)):
    return templates.TemplateResponse("chatroom.html", {"request": request, "sender_name": user.name})

@app.get("/login")
async def get_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request}) 

@app.get("/friend")
async def get_friend(request: Request, user=Depends(manager)):
    return templates.TemplateResponse("friend.html", {"request": request, "sender_name": user.name}) 

@app.get("/logout")
def logout(response: Response):
    response = RedirectResponse("/login", status_code=302)
    response.delete_cookie(key="access-token")
    return response

@app.get("/signup")
async def get_signup(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request}) 


if __name__ == "__main__":
    uvicorn.run(app)
