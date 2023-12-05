from sqlalchemy.orm import Session

from models import User, Chat
from schemas import ChatRequest

def db_register_user(db: Session, name, password):
    db_item = User(name=name, password=password)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def db_get_chats(db: Session, user: User):
    db_items = db.query(Chat) \
                .filter((Chat.sender == user.name) 
                        | (Chat.receiver == user.name))
    
    if db_items:
        return db_items.all()
    return None

def db_add_chats(db: Session, user: User, chat: ChatRequest):
    db_item = Chat(chatType=chat.chatType, 
                   sender=chat.sender, 
                   receiver=chat.receiver,
                   content=chat.content, 
                   time=chat.time)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item