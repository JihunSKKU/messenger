from sqlalchemy.orm import Session

from models import ChatList
from schemas import ChatRequest

def get_chatlist(db: Session):
    return db.query(ChatList).all()

def add_chatlist(db: Session, item: ChatRequest):
    db_item = ChatList(chatType=item.chatType,
                       sender=item.sender, 
                       content=item.content, 
                       time=item.time)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item