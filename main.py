import uvicorn
import shutil

from pathlib import Path

from fastapi import Depends, FastAPI, WebSocket, Request, Response, HTTPException, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from fastapi_login import LoginManager
from fastapi_login.exceptions import InvalidCredentialsException

from sqlalchemy.orm import Session

from typing import List

from models import Base, User, Chat, ChatRoom
from schemas import UserSchema, ChatRoomSchema, ChatRequest, ChatRequestAdd, ConnectionManager, FriendRequestAdd
from crud import db_register_user, db_add_friend, db_create_chatroom, db_get_chatrooms, db_get_chats, db_add_chat, db_get_or_create_chatroom
from database import SessionLocal, engine


app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
"""Websocket part"""
websocket_manager = ConnectionManager()

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: int):
    await websocket_manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()           
            await websocket_manager.broadcast(room_id, f"{data}")
    except Exception as e:
        print(f"WebSocket Error: {e}")
        pass
    finally:
        await websocket_manager.disconnect(websocket, room_id)
               
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

@manager.user_loader()
def get_user(username: str, db: Session = None):
    if not db:
        with SessionLocal() as db:
            return db.query(User).filter(User.username == username).first()
    return db.query(User).filter(User.username == username).first()

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

"""Add friend part"""
@app.get("/friends")
async def get_friends(db: Session = Depends(get_db), user: UserSchema = Depends(manager)):
    try:
        current_user = db.query(User).filter(User.username == user.username).first()
        if not current_user:
            raise InvalidCredentialsException
        
        friends_list = []
        for friend in current_user.friends:
            friend_info = {
                "user_id": friend.user_id,
                "username": friend.username
            }
            friends_list.append(friend_info)

        return friends_list
    except Exception as e:
        raise InvalidCredentialsException

@app.post("/add-friend")
async def add_friend(friend_req: FriendRequestAdd, 
                     db: Session = Depends(get_db),
                     user: UserSchema = Depends(manager)):
    friend = db.query(User).filter(User.username == friend_req.username).first()
    if not friend:
        raise HTTPException(status_code=400, detail="해당 유저는 존재하지 않습니다.")
    if user.user_id == friend.user_id:
        raise HTTPException(status_code=400, detail="본인은 친구로 추가할 수 없습니다.")

    return db_add_friend(db, user.user_id, friend)

"""ChatRoom part"""
@app.post("/get-or-create-chatroom")
async def get_or_create_chatroom(request: Request, 
                                 db: Session = Depends(get_db),
                                 user: UserSchema = Depends(manager)):
    data = await request.json()
    friend_username = data['friendUsername']
    friend = db.query(User).filter(User.username == friend_username).first()
    if not friend:
        raise HTTPException(status_code=400, detail="해당 유저를 찾을 수 없습니다.")

    chatroom = db_get_or_create_chatroom(db, user.user_id, friend.user_id)
    return {"chatroomId": chatroom.room_id}

@app.get("/chatrooms", response_model=List[ChatRoomSchema])
async def get_chatrooms(db: Session = Depends(get_db),
                        user: UserSchema = Depends(manager)):
    return db_get_chatrooms(db, user)

@app.get("/chatroom/{room_id}")
async def get_friend(request: Request, 
                     room_id: int,
                     db: Session = Depends(get_db),
                     user=Depends(manager)):
    chatroom = db.query(ChatRoom).filter(ChatRoom.room_id == room_id).first()
    if not chatroom:
        raise HTTPException(status_code=404, detail="채팅방을 찾을 수 없습니다.")
    
    if not any(member.user_id == user.user_id for member in chatroom.users):
        raise HTTPException(status_code=403, detail="접근 권한이 없습니다.")
    
    return templates.TemplateResponse("chatroom.html", {
        "request": request, 
        "user": user, 
        "chatroom": chatroom
    }) 
    
@app.get("/chatroom/{room_id}/chats", response_model=List[ChatRequest])
async def get_chatroom_chats(room_id: int, db: Session = Depends(get_db)):
    return db_get_chats(db, room_id)

@app.post("/chatroom/{room_id}/chats", response_model=List[ChatRequest])
async def post_chatroom_chat(room_id: int, chat_req: ChatRequestAdd,
                             db: Session = Depends(get_db),
                             user: UserSchema = Depends(manager)):
    result = db_add_chat(db, chat_req, room_id, user)
    if not result:
        return None
    return db_get_chats(db, room_id)


"""Website part"""
@app.get("/")
async def client(request: Request, user=Depends(manager)):
    return templates.TemplateResponse("friend.html", {"request": request, "user_name": user.username})

@app.get("/chatlist")
async def client(request: Request, user=Depends(manager)):
    return templates.TemplateResponse("chatlist.html", {"request": request, "user_name": user.username})


@app.get("/login")
async def get_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request}) 

@app.get("/logout")
def logout(response: Response):
    response = RedirectResponse("/login", status_code=302)
    response.delete_cookie(key="access-token")
    return response

@app.get("/signup")
async def get_signup(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request}) 

"""File upload part"""
@app.post("/upload/image/")
async def upload_image(file: UploadFile = File(...)):
    file_location = f"./static/image/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file_location}

if __name__ == "__main__":
    uvicorn.run(app)
