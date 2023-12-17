# KakaoTalk-like SKKU talk

## Introduction

### Framework, Software stacks you used

-   수업시간에 사용한 ajax, jquery, fastAPI, query, Sqlite3, websocket 등을 사용하였습니다.
-   필요한 library 및 사용한 버전은 아래와 같습니다.

```arduino
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

### Code Structure

```arduino
├── static
│   ├── css
│   │   ├── chatlist_style.css
│   │   ├── chatroom_style.css
│   │   ├── friend_style.css
│   │   ├── login_style.css
│   │   └── signup_style.css
│   ├── js
│   │   ├── chatlist_func.js
│   │   ├── chatroom_func.js
│   │   ├── friend_func.js
│   │   ├── login_func.js
│   │   └── signup_func.js
│   ├── icon
│   │   └── 여러 icon 파일들
│   ├── image
│   │   └── DB에 url이 저장되어 있는 image 파일들
│   └── video
│       └── DB에 url이 저장되어 있는 video 파일들
├── templates
│   ├── chatlist.html   -> Chat List
│   ├── chatroom.html   -> Chatting Room
│   ├── friend.html     -> Friend List
│   ├── login.html      -> Login
│   └── signup.html     -> Sign Up
├── README.md
├── crud.py             -> Data create, read, update functions
├── database.py         -> Related to database
├── main.py             -> main excute file
├── models.py           -> Data models
├── schemas.py          -> Data schemas
└── sql_app.db          -> Sqlite DB file
```

### How to Run

```shell
pip install -r requirements.txt
python main.py
```

-   이후 http://127.0.0.1:8000/ 접속

### What Additional Functions you implemented

1. Group Chatting
2. Sending and Viewing Photo in Chatting room
3. Sending and Viewing Video in Chatting room

### Functions

1. models.py

    - User Table

        - user_id: 현재 유저의 고유 값 (자동으로 부여됨)
        - username: 유저의 이름 / 회원가입시에 입력한 값과 동일하다.
        - password: 유저의 password

        - friends: 현재 유저의 친구들을 나타내는 참조 변수
        - chats: 현재 유저가 입력한 채팅들을 나타내는 참조 변수
        - chatrooms: 현재 유저가 참여한 채팅방들을 나타내는 참조 변수

    - ChatRoom Table

        - room_id: 현재 방의 고유 값 (자동으로 부여됨)
        - room_name: 방의 이름
            - 1:1 채팅 시에는 None (상대방의 이름이 뜨게 된다.)
            - group chatting은 만들 때의 이름으로 정해진다.
        - users: 현재 방에 속한 사용자들을 나타내는 참조 변수
        - chats: 현재 방에 속한 채팅들을 나타내는 참조 변수

    - Chat Table

        - chat_id: 특정 chat의 고유 값 (자동으로 부여됨)
        - room_id: chat이 입력된 방의 ID (외래 키)
        - sender_id: chat을 보낸 유저의 ID (외래 키)
        - sender_name: chat을 보낸 유저의 이름
        - chat_type: 메시지 유형 (text, image, video 등)
        - content: chat 내용 또는 image, video URL
        - time: chat을 보낸 시간

        - sender: 채팅을 보낸 유저 객체를 참조하는 참조 변수
        - room: 채팅이 속한 채팅방 객체를 참조하는 참조 변수

    - relationship

        - User - User (일대다 관계): 유저의 친구 관계
        - User - Chat (일대다 관계): 유저가 보낸 채팅 관계
        - User - ChatRoom (다대다 관계): 유저가 속한 채팅방 관계
        - ChatRoom - Chat (일대다 관계): 채팅방에서 오고 간 채팅 관계

2. crud.py

    - User part

        - db_register_user: 회원가입할 때 사용하는 함수

    - Friend part

        - db_get_friend: 현재 user의 친구 목록을 불러오는 함수 (이름 순으로 정렬)
        - db_add_friend: 친구추가할 때 사용하는 함수

    - ChatRoom part

        - db_create_chatroom: db에 chatroom을 추가하는 함수
        - db_get_or_create_chatroom: 개인채팅방이 존재하지 않으면 생성하고 불러오는 함수
            - private_chatroom: 모든 개인채팅방
            - chatroom: 둘 사이의 개인채팅방
        - db_get_chatrooms: chat list를 불러오는 함수
            - subquery: 채팅방과 그 채팅방의 마지막 채팅의 시간
            - chatrooms_with_chat: 채팅이 존재하는 방과 마지막 대화 (시간이 빠른 순으로 정렬)
            - chatrooms_without_chat: 채팅이 존재하지 않는 방 (만들어진 시간이 느린 순으로 정렬)

    - Chat part
        - db_get_chats: 현재 채팅방의 모든 채팅을 불러오는 함수
        - db_add_chat: 대화를 보낼 때 사용하는 함수

3. schemas.py

    - Websocket class
        - room_id 별로 websocket을 관리한다.
        - active_connections: room_id을 key값으로, websocket을 value로 가지는 dictionary

4. main.py

    - User part

        - '/' 주소에서 현재 로그인이 되어 있지 않다면 '/login'으로 넘어간다. (로그인 페이지)
        - '/token': 로그인할 때 호출됨
        - '/register': 회원가입할 때 호출됨

    - Add friend part

        - '/friends': Friend List에서 호출됨
        - '/add-friend': 친구추가할 때 호출됨

    - ChatRoom part

        - '/get-or-create-chatroom': 친구 및 채팅방을 클릭할 때 호출됨
        - '/create-group-chat': 그룹채팅방을 만들 때 호출됨
        - '/chatrooms': Chat List에서 호출됨
        - '/chatroom/{room_id}': 채팅방에 입장할 때 호출됨 -> chatroom.html

    - Chat part

        - '/chatroom/{room_id}/chats'
            - get: 채팅방에서 채팅들을 가져올 때 호출됨
            - post: 채팅방에서 채팅을 보낼 때 호출됨

    - File upload part

        - '/upload/image': image를 보낼 때 호출됨
        - '/upload/video': video를 보낼 때 호출됨

    - Website part

        - '/': Friend List -> friend.html
        - '/chatlist': Chat List -> chatlist.html
        - '/login': Login -> login.html
        - '/logout': Logout
        - '/signup': Sign up -> signup.html

    - javascript

## Basic Function

### Login

-   간단한 로그인 페이지
-   새 사용자를 등록할 수 있는 버튼이 필요함
-   간단한 로그인 양식은 왼쪽처럼 괜찮음
-   복잡한 것들을 만들지 마세요
-   Demonstrate
    -   2명의 새 사용자를 등록하고 한 계정에 로그인하기

### 1 to 1 chatting

-   간단한 채팅
-   2명이 같은 방에서 서로 대화할 수 있음
-   카카오톡처럼 작동
-   HW3과 같은 요구사항. 개선할 필요 없음
-   Demonstrate
    -   친구 목록에서 친구를 클릭하여 채팅 시작
    -   간단한 대화
-   일반적으로 웹사이트에 로그인하면 모든 탭이 세션을 공유함으로써 한 명의 활성 사용자만 가능함
-   이를 피하기 위해 프라이빗 모드와 일반 모드를 사용하는 것을 제안함

### Friend List

-   사용자의 친구 목록
-   채팅을 시작하려면 친구를 클릭 (1대1 채팅방 만들기)
-   친구 이름이 나열된 페이지면 충분함
-   프로필 사진과 설명(상태메세지)이나 복잡한 것들을 구현할 필요 없음
-   친구 추가 버튼 필요
-   아름답게 할 필요 없음
-   Demonstrate
    -   새 친구를 추가하고 친구 목록을 보여주기

### Chat List

-   이미 생성한 채팅방 목록
-   다른 사용자의 이름과 최근 채팅을 보여줌
-   채팅방에 들어가려면 클릭
-   채팅방은 이전 대화를 보존해야 함
-   Demonstrate
    -   여러 채팅방을 만들고 채팅 목록 확인
    -   아무 채팅방이나 들어가기

## Additional Functions

### Group Chatting

-   간단한 그룹 채팅
-   3명 이상이 같은 방에서 서로 대화할 수 있음
-   카카오톡처럼 작동
-   어딘가에 그룹 채팅 생성 버튼을 만들고 친구의 아이디를 입력
    (간단한 예제처럼 하면 됨)
-   그룹 채팅 생성 페이지 디자인은 평가하지 않음
-   Demonstrate
    -   그룹 채팅 만들기
    -   3명이 서로 대화하기
-   일반적으로 웹사이트에 로그인하면 모든 탭이 세션을 공유함으로써 한 명의 활성 사용자만 가능함
-   이를 피하기 위해 프라이빗 모드와 다른 브라우저를 사용하는 것을 제안함
    (일반 모드 브라우저 포함)

### Sending and Viewing Photo in Chatting room

-   한 개의 사진 메시지 보내기
-   사진 메시지는 사진의 썸네일로 렌더링됨
-   이미지를 클릭하면 원본 크기의 사진을 볼 수 있음
-   사진 메시지는 데이터베이스에 저장되어야 함
-   간단한 사진 보내기 버튼 추가
-   Demonstrate
    -   아무 사용자에게 사진 1장 보내기
    -   이미지를 클릭하여 전체 이미지 보기

### Sending and Viewing Video in Chatting room

-   한 개의 비디오 메시지 보내기
-   비디오 메시지는 비디오의 썸네일로 렌더링됨
-   비디오를 클릭하면 비디오를 재생할 수 있음
-   비디오 메시지는 데이터베이스에 저장되어야 함
-   간단한 비디오 보내기 버튼 추가
-   비디오 플레이어는 브라우저의 자체 비디오 플레이어처럼 간단하거나 인터넷에서 어떤 라이브러리를 사용할 수도 있음
-   Demonstrate
    -   아무 사용자에게 비디오 1개 보내기
    -   비디오를 클릭하여 비디오 재생하기
