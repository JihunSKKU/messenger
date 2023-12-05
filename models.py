from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from database import Base

class User(Base):
    __tablename__ = "users"

    # id = Column(Integer, primary_key=True)
    name = Column(String, primary_key=True)
    password = Column(String)

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True)
    chatType = Column(String)   # message인지, image인지, video인지 구별
    sender = Column(String)     # chat를 보낸 user
    receiver = Column(String)   # chat를 받는 user
    # sender = Column(String, ForeignKey("users.name", ondelete="CASCADE"))   # chat를 보낸 user
    # receiver = Column(String, ForeignKey("users.name", ondelete="CASCADE")) # chat를 받는 user
    content = Column(String)    # message 내용 or (image, video)의 위치
    time = Column(String)       # message를 보낸 time
