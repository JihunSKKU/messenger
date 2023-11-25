from sqlalchemy import Column, String, Integer, DateTime
from database import Base

class ChatList(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    sender = Column(String)     # message를 보낸 user
    message = Column(String)    # message 내용
    time = Column(String)     # message를 보낸 time
