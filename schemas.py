import json
from fastapi import WebSocket
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

"""User class"""  
class UserSchema(BaseModel):
    user_id: Optional[int]
    username: str
    password: str

    class Config:
        from_attributes = True

class FriendRequestAdd(BaseModel):
    username: str

"""ChatRoom class"""
class ChatRoomSchema(BaseModel):
    room_id: Optional[int]
    room_name: Optional[str]
    users: List[UserSchema]
    recent_message: Optional[str]
    
    class Config:
        from_attributes = True

"""Chat class"""
class ChatRequestBase(BaseModel):
    room_id: Optional[int]
    sender_id: Optional[int]
    sender_name: Optional[str]
    chat_type: str
    content: str
    time: datetime

class ChatRequestAdd(ChatRequestBase):
    pass

class ChatRequest(ChatRequestBase):
    chat_id: Optional[int]

    class Config:
        from_attributes = True

"""Websocket class"""
class ConnectionManager:
    def __init__(self):
        self.active_connections = {}
    
    async def connect(self, websocket: WebSocket, room_id: int):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
    
    async def disconnect(self, websocket: WebSocket, room_id: int):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)

    async def broadcast(self, room_id:int, chat: str):
        if room_id in self.active_connections:  
            for connection in self.active_connections[room_id]:
                await connection.send_text(chat)