from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Table
from database import Base
from sqlalchemy.orm import relationship

"""
    User table
    - user_id: 현재 유저의 고유 값 (자동으로 부여됨)
    - username: 유저의 이름 / 회원가입시에 입력한 값과 동일하다.
    - password: 유저의 password
    - friends: 현재 유저의 친구들을 나타내는 참조 변수
    - chats: 현재 유저가 입력한 채팅들을 나타내는 참조 변수
    - chatrooms: 현재 유저가 참여한 채팅방들을 나타내는 참조 변수
"""
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    password = Column(String)
    
    friends = relationship(
        'User',
        secondary='user_friends',
        primaryjoin='User.user_id == user_friends.c.user_id',
        secondaryjoin='User.user_id == user_friends.c.friend_id'
    )
    
    chats = relationship('Chat', back_populates='sender')
    chatrooms = relationship(
        'ChatRoom', 
        secondary='user_chatrooms', 
        back_populates='users'
    )

"""
    User간 친구 관계를 나타내는 테이블
    - user_id: 현재 user의 ID (외래 키)
    - friend_id: 친구의 ID (외래 키)
"""
user_friends = Table('user_friends', Base.metadata,
    Column('user_id', ForeignKey('users.user_id'), primary_key=True),
    Column('friend_id', ForeignKey('users.user_id'), primary_key=True)
)

"""
    Chatroom table
    - room_id: 현재 방의 고유 값 (자동으로 부여됨)
    - room_name: 방의 이름
        - 1:1 채팅 시에는 None (상대방의 이름이 뜨게 된다.) 
        - group chatting은 만들 때의 이름으로 정해진다.
    - users: 현재 방에 속한 사용자들을 나타내는 참조 변수
    - chats: 현재 방에 속한 채팅들을 나타내는 참조 변수
"""
class ChatRoom(Base):
    __tablename__ = "chatrooms"
    
    room_id = Column(Integer, primary_key=True)
    room_name = Column(String)
    
    users = relationship(
        'User', 
        secondary='user_chatrooms', 
        back_populates='chatrooms'
    )
    chats = relationship('Chat', back_populates='room')

"""
    User와 ChatRoom 간의 다대다 관계를 나타내는 테이블
    - user_id: User의 ID (외래 키)
    - room_id: ChatRoom의 ID (외래 키)
"""
user_chatrooms = Table(
    'user_chatrooms', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.user_id'), primary_key=True),
    Column('room_id', Integer, ForeignKey('chatrooms.room_id'), primary_key=True)
)

"""
    Chat table
    - chat_id: 특정 chat의 고유 값 (자동으로 부여됨)
    - room_id: chat이 입력된 방의 ID (외래 키)
    - sender_id: chat을 보낸 유저의 ID (외래 키)
    - sender_name: chat을 보낸 유저의 이름
    - chat_type: 메시지 유형 (text, image, video 등)
    - content: chat 내용 또는 image, video URL
    - time: chat을 보낸 시간
    
    - sender: 채팅을 보낸 유저 객체를 참조하는 참조 변수
    - room: 채팅이 속한 채팅방 객체를 참조하는 참조 변수
"""
class Chat(Base):
    __tablename__ = "chats"
    
    chat_id = Column(Integer, primary_key=True)
    room_id = Column(Integer, ForeignKey('chatrooms.room_id', ondelete="CASCADE"))
    sender_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"))
    sender_name = Column(String)
    chat_type = Column(String)
    content = Column(String)
    time = Column(DateTime)    

    sender = relationship('User', back_populates='chats')
    room = relationship('ChatRoom', back_populates='chats')