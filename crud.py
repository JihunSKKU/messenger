from sqlalchemy.orm import Session

from fastapi import HTTPException
from typing import List
from models import User, Chat, ChatRoom
from schemas import ChatRequestAdd

"""User part"""
def db_register_user(db: Session, username: str, password: str):
    db_item = User(username=username, password=password)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def db_add_friend(db: Session, user_id: int, friend: User):    
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return HTTPException(status_code=400, detail="세션이 만료되었습니다. 새로고침 해주세요.")
    if friend not in user.friends:
        user.friends.append(friend)
        db.commit()
        return user
    else:
        raise HTTPException(status_code=400, detail="해당 유저는 이미 친구입니다.")

"""ChatRoom part"""
def db_create_chatroom(db: Session, room_name: str, users: List[User]):
    db_item = ChatRoom(room_name=room_name, users=users)     
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def db_get_chatrooms(db:Session, user: User):
    return db.query(ChatRoom).filter(ChatRoom.users.contains(user)).all()
   
"""Chat part"""
def db_get_chats(db: Session, chatroom: ChatRoom):
    return db.query(Chat).filter(Chat.room_id == chatroom.room_id).all()

def db_add_chat(db: Session, chat: ChatRequestAdd, chatroom: ChatRoom, sender: User):
    db_item = Chat(
        room=chatroom, 
        sender=sender,
        chat_type=chat.chat_type, 
        content=chat.content, 
        time=chat.time
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
 