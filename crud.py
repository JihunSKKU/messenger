from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from fastapi import HTTPException
from typing import List
from models import User, Chat, ChatRoom, user_chatrooms
from schemas import ChatRequestAdd, UserSchema

"""User part"""
def db_register_user(db: Session, username: str, password: str):
    db_item = User(username=username, password=password)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


"""Friend part"""
def db_get_friend(db: Session, user_id: int):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return HTTPException(status_code=400, detail="세션이 만료되었습니다. 새로고침 해주세요.")
    friends_list = sorted(user.friends, key=lambda friend: friend.username)
                
    return [{"user_id": friend.user_id, 
             "username": friend.username} for friend in friends_list]
    
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

def db_get_or_create_chatroom(db: Session, user_id: int, friend_id: int):
    private_chatroom = db.query(ChatRoom.room_id) \
                        .join(user_chatrooms) \
                        .join(User) \
                        .group_by(ChatRoom.room_id) \
                        .having(func.count(User.user_id) == 2) \
                        .subquery()

    chatroom = db.query(ChatRoom) \
                 .join(private_chatroom, ChatRoom.room_id == private_chatroom.c.room_id) \
                 .filter(ChatRoom.users.any(User.user_id == user_id)) \
                 .filter(ChatRoom.users.any(User.user_id == friend_id)) \
                 .first()

    if not chatroom:
        user = db.query(User).filter(User.user_id == user_id).first()
        friend = db.query(User).filter(User.user_id == friend_id).first()
        chatroom = db_create_chatroom(db, None, [user, friend])

    return chatroom

def db_get_chatrooms(db:Session, user: UserSchema):
    subquery = db.query(
        Chat.room_id.label('room_id'),
        func.max(Chat.time).label('max_time')
    ).group_by(Chat.room_id).subquery()

    chatrooms_with_chat = db.query(ChatRoom, Chat) \
        .outerjoin(subquery, ChatRoom.room_id == subquery.c.room_id) \
        .outerjoin(Chat, and_(Chat.room_id == subquery.c.room_id, 
                              Chat.time == subquery.c.max_time)) \
        .filter(ChatRoom.users.any(User.user_id == user.user_id), 
                subquery.c.max_time != None) \
        .order_by(subquery.c.max_time.desc()) \
        .all()

    chatrooms_without_chat = db.query(ChatRoom) \
        .filter(ChatRoom.users.any( User.user_id == user.user_id), 
                ~ChatRoom.room_id.in_(db.query(subquery.c.room_id))) \
        .order_by(ChatRoom.room_id.desc()) \
        .all()

    result = []
    for chatroom, chat in chatrooms_with_chat:
        result.append({
            "room_id": chatroom.room_id,
            "room_name": chatroom.room_name,
            "users": chatroom.users,
            "recent_message": chat.content if chat else "No messages"
        })

    for chatroom in chatrooms_without_chat:
        result.append({
            "room_id": chatroom.room_id,
            "room_name": chatroom.room_name,
            "users": chatroom.users,
            "recent_message": "No messages"
        })

    return result


"""Chat part"""
def db_get_chats(db: Session, room_id: int):
    return db.query(Chat).filter(Chat.room_id == room_id).all()

def db_add_chat(db: Session, chat: ChatRequestAdd, room_id: int, sender: User):
    chatroom = db.query(ChatRoom).filter(ChatRoom.room_id == room_id).first()
    if not chatroom:
        return None
    
    db_item = Chat(
        sender_name=sender.username,
        chat_type=chat.chat_type, 
        content=chat.content, 
        time=chat.time,
        
        sender=sender,
        room=chatroom
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
 