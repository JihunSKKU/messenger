import uvicorn

from fastapi import Depends, FastAPI, WebSocket, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from typing import List

from schemas import ChatRequest, ChatRequestCreate, ConnectionManager
from crud import get_chatlist, add_chatlist
from models import Base, ChatList
from database import SessionLocal, engine

from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# html 파일을 서비스할 수 있는 jinja 설정 (/templates 폴더 사용)
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
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/getchatlist", response_model=List[ChatRequest])
async def get_data(db: Session = Depends(get_db)):
    return get_chatlist(db)

@app.post("/postchat", response_model=List[ChatRequest])
async def post_chat(chat_req: ChatRequestCreate, db: Session = Depends(get_db)):
    result = add_chatlist(db, chat_req)
    if not result:
        return None
    return get_chatlist(db)    


if __name__ == "__main__":
    uvicorn.run(app)
