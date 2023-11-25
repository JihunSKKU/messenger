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
    
    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections.append({"websocket": websocket, "username": username})
    
    async def disconnect(self, websocket: WebSocket):
        for conn in self.active_connections:
            if conn["websocket"] == websocket:
                self.active_connections.remove(conn)

    async def broadcast(self, chat: ChatRequest):
        for conn in self.active_connections:
            await conn["websocket"].send_text(chat)