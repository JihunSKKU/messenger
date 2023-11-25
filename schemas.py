from fastapi import WebSocket
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatRequestBase(BaseModel):
    sender: str
    message: str
    time: str

class ChatRequestCreate(ChatRequestBase):
    pass

class ChatRequest(ChatRequestBase):
    id: Optional[int]

    class Config:
        orm_mode = True

class ConnectionManager:
    def __init__(self):
        self.active_connections = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    async def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, chat: str):
        for connection in self.active_connections:
            await connection.send_text(chat)