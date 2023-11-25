from sqlalchemy.orm import Session

from models import ChatList
from schemas import ChatRequest

def get_chatlist(db: Session):
    return db.query(ChatList).all()

def add_chatlist(db: Session, item: ChatRequest):
    db_item = ChatList(sender=item.sender, message=item.message, time=item.time)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db.query(ChatList).all()