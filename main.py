import uvicorn

from fastapi import Depends, FastAPI, WebSocket, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import FileResponse, RedirectResponse

from fastapi_login import LoginManager
from fastapi_login.exceptions import InvalidCredentialsException

from sqlalchemy.orm import Session

from typing import List

from models import Base, User, Chat
from schemas import ChatRequest, ChatRequestCreate, ConnectionManager
from crud import db_register_user, db_get_chats, db_add_chats
from database import SessionLocal, engine

from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"{data}")
    except Exception as e:
        pass
    finally:
        await manager.disconnect(websocket)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def client(request: Request):
    return templates.TemplateResponse("chatroom.html", {"request": request})

@app.get("/getchatlist", response_model=List[ChatRequest])
async def get_data(db: Session = Depends(get_db)):
    return db_get_chats(db)

@app.post("/postchat", response_model=List[ChatRequest])
async def post_chat(chat_req: ChatRequestCreate, db: Session = Depends(get_db)):
    result = db_add_chats(db, chat_req)
    if not result:
        return None
    return db_get_chats(db)    


if __name__ == "__main__":
    uvicorn.run(app)
