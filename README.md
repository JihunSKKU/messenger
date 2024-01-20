# KakaoTalk-like SKKU talk

## SKKU Talk 소개

### 사용된 프레임워크 및 소프트웨어 스택

- 사용된 기술 스택: Ajax, jQuery, FastAPI, Query, SQLite3, Websocket 등
- 필요한 라이브러리 및 사용한 버전은 아래와 같습니다.

```python
fastapi==0.104.1
fastapi-login==1.9.2
fastjsonschema==2.19.0
pydantic==2.5.2
pydantic-extra-types==2.1.0
pydantic-settings==2.1.0
pydantic_core==2.14.5
SQLAlchemy==2.0.23
uvicorn==0.24.0.post1
webcolors==1.13
webencodings==0.5.1
websocket-client==1.7.0
websockets==12.0
```

### 코드 구조

```python
├── static
│   ├── css
│   │   └── style 파일들 (.css)
│   ├── js
│   │   └── 기능 파일들 (.js)
│   ├── icon
│   │   └── 아이콘 파일들
│   ├── image
│   │   └── DB에 URL이 저장된 이미지 파일들
│   └── video
│       └── DB에 URL이 저장된 비디오 파일들
├── templates
│   └── 여러 HTML 파일들
├── README.md
├── crud.py
├── database.py
├── main.py
├── models.py
├── schemas.py
└── sql_app.db
```

### 실행 방법

```shell
pip install -r requirements.txt
python main.py
```

- http://127.0.0.1:8000/ 에 접속하여 실행

### 주요 기능

1. **models.py**
   - User Table
   - ChatRoom Table
   - Chat Table
   - 관계: User - User, User - Chat, User - ChatRoom, ChatRoom - Chat

2. **crud.py**
   - User, Friend, ChatRoom, Chat과 관련된 데이터 조작 함수들

3. **schemas.py**
   - Websocket 클래스: room_id를 기반으로 웹소켓 관리

4. **main.py**
   - 사용자, 친구, 채팅방, 채팅 등의 기능 구현
   - 웹 소켓 관리

## 동작 방식

### 로그인 및 회원가입

- 간단한 로그인 페이지 및 회원가입 기능

### 1:1 채팅

- 두 명이 같은 방에서 채팅 가능
- 친구 목록에서 친구 클릭하여 채팅 시작

### 친구 목록

- 사용자의 친구 목록 표시
- 친구 클릭하여 1:1 채팅 시작
- 친구 추가 기능

### 채팅 목록

- 생성한 채팅방 목록 표시
- 다른 사용자 이름과 최근 채팅 표시
- 채팅방 클릭하여 입장 가능

### 그룹 채팅

- 3명 이상이 같은 방에서 채팅 가능
- 그룹 채팅 생성 후 초대 가능

### 사진 및 비디오 전송

- 채팅방에서 이미지 및 비디오 전송 가능
- 썸네일 및 원본 크기로 보기 가능

### 웹사이트 접속

- 홈, 친구 목록, 채팅 목록, 로그인, 로그아웃, 회원가입 페이지 제공

### JavaScript 사용

- 각 기능별 JavaScript 파일로 분리
