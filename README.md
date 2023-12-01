# KakaoTalk-like SKKU talk

## 이전 version 기능들

기존에 제출된 과제 HW1, HW2, HW3의 기능들

-   HW1의 기능

    -   내가 보낸 메시지는 노란색으로 오른쪽에, 상대방이 보낸 메시지는 흰색으로 왼쪽에 위치합니다.
    -   상대방이 보낸 메시지의 경우 누가 보냈는지 메시지 위에 이름이 뜹니다.
    -   보낸 시간이 메시지 옆에 뜹니다.
    -   CSS는 기존 카카오톡과 유사합니다. (프로필 사진 제외)

-   HW2의 기능

    -   대화창에 아무것도 없는 경우, Send 버튼을 누르거나 대화창에 focus가 된 상태에서 Enter키를 누르더라도 아무런 일이 발생하지 않습니다.
    -   Shift + Enter를 누를 경우 줄바꿈이 됩니다.
    -   대화창에 focus가 잡혀있고 대화창에 내용이 있는 경우, 대상에게 메시지가 날라갑니다.

-   HW3의 기능
    -   Put User ID칸에 본인의 ID를 입력한 후 Enter 버튼을 누르거나, 입력창에 focus를 둔 상태에서 Enter키를 누르면 로그인이 됩니다.
    -   로그인이 되어있지 않은 상태에서 메시지를 보내면 alert가 뜹니다.
    -   로그인 후에 메시지를 보내면 상대방에게 실시간으로 메시지가 날라갑니다. (Websocket 사용)
    -   대화창을 나갔다 오더라도 DB에 대화가 저장되어 있어서 데이터가 남아 있습니다. (Sqlite 사용)

## 변경해야할 내용들 (CheckList)

### Basic Function

-   Login

    -   Simple Login page
    -   You also need button to register new user
    -   Simple login form is like left is fine
    -   Please do not make messy stuff
    -   Demonstrate
        -   Register 2 new users and login to one account

-   1 to 1 chatting

    -   Simple Chatting
    -   2 people can talk each other in the same room
    -   Works like KakaoTalk
    -   Same requirement as HW3. No need to improve
    -   Demonstrate
        -   Click friend from friend list to start the chat
        -   Just some simple converstation
    -   Typically, when you log in to you website, all tabs shares seesion which means you can have only one active user
    -   To avoid this we suggest you to use Private Mode and Normal Mode

-   Friend List

    -   List of the user’s friend
    -   Click the friend to start the chat (make the 1 to 1 chatting room)
    -   Just page with list of friend name is fine
    -   No need to implement profile photo and description(상태메세지) or some messy things
    -   Need button to add friend
    -   No need to be beautiful
    -   Demonstrate
        -   Add the new friend and show the friend list

-   Chat List

    -   List of Chatting rooms you already created
    -   Show the name of the other user and recent chat
    -   Click to enter chatting room
    -   Chatting room should reserve previous conversation
    -   Demonstrate
        -   Make multiple chatting room and check the chat list
        -   Enter any chatting room

### Additional Functions

**3개 이상 구현해야 함**

-   Group Chatting

-   Profile Photo and Profile description when you click the friend(or photo thumbnail)

-   Response for individual message(답장기능)

-   Sending and Viewing Photo in Chatting room

-   Sending and Viewing Video in Chatting room

-   Push Notification when new message comes
