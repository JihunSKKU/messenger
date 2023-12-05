from sqlalchemy.orm import Session

from models import User, Chat
from schemas import ChatRequest

def db_register_user(db: Session, name, password):
    db_item = User(name=name, password=password)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def db_get_chats(db: Session):
    return db.query(Chat).all()

def db_add_chats(db: Session, item: ChatRequest):
    db_item = Chat(chatType=item.chatType, 
                   sender=item.sender, 
                   content=item.content, 
                   time=item.time)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item