from fastapi import WebSocket
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

"""User class"""
class UserSchema(BaseModel):
    name: str
    password: str

    class Config:
        from_attributes = True

"""Chat class"""
class ChatRequestBase(BaseModel):
    chatType: str
    sender: str
    receiver: Optional[str]
    content: str
    time: str

class ChatRequestAdd(ChatRequestBase):
    pass

class ChatRequest(ChatRequestBase):
    id: Optional[int]

    class Config:
        from_attributes = True

"""Websocket class"""
class ConnectionManager:
    def __init__(self):
        self.active_connections = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    async def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, item: str):
        for connection in self.active_connections:
            await connection.send_text(item)