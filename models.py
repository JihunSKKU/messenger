from sqlalchemy import Column, String, Integer, DateTime
from database import Base

class ChatList(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    chatType = Column(String)   # message인지, image인지, video인지 구별
    sender = Column(String)     # chat를 보낸 user
    # receiver = Column(String)   # chat를 받는 user
    content = Column(String)    # message 내용 or (image, video)의 위치
    time = Column(String)       # message를 보낸 time
