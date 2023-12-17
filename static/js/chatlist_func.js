/*
 * 서버에서 채팅방 목록을 불러와 화면에 표시하는 함수
 * - 사용자의 이름 또는 그룹 채팅방의 이름을 보여준다.
 * - 채팅방 이름 아래에 최근 메시지를 보여준다. 없는 경우 No messages를 띄워준다.
 */
function fetchChatRooms() {
    $.get('/chatrooms', function (chatrooms) {
        var chatroomsHtml = chatrooms
            .map(function (chatroom) {
                var displayName =
                    chatroom.room_name ||
                    chatroom.users.find((u) => u.username !== user_name)
                        .username;
                var recent_message = chatroom.recent_message || 'No messages';
                return (
                    '<div class="chatroom-item" data-room_id="' +
                    chatroom.room_id +
                    '">' +
                    '<div>' +
                    displayName +
                    '</div>' +
                    '<div id="recent_message">' +
                    recent_message +
                    '</div>' +
                    '</div>'
                );
            })
            .join('');
        $('#chat-list').html(chatroomsHtml);

        $('.chatroom-item').click(function () {
            var room_id = $(this).data('room_id');
            window.location.href = '/chatroom/' + room_id;
        });
    });
}

/*
 * 그룹 채팅방 생성 팝업을 여는 함수
 * - 서버에서 현재 사용자의 친구 목록을 불러와서 checkbox로 표시한다.
 */
function openGroupChatPopup() {
    document.getElementById('groupChatPopup').style.display = 'block';
    $.get('/friends', function (friends) {
        var checkboxesHtml = friends
            .map(function (friend) {
                return (
                    '<label class="custom-checkbox">' +
                    '<input type="checkbox" name="selectedFriends" value="' +
                    friend.username +
                    '">' +
                    '<span class="checkmark"></span>' +
                    friend.username +
                    '</label><br>'
                );
            })
            .join('');
        $('#friendCheckboxList').html(checkboxesHtml);
    });
}

/*
 * 그룹 채팅방 생성 팝업을 닫는 함수
 */
function closeGroupChatPopup() {
    document.getElementById('newChatRoomName').value = '';
    document.getElementById('groupChatPopup').style.display = 'none';
}

/*
 * 그룹 채팅방을 생성하는 함수
 * - checkbox에서 선택한 유저들이 그룹 채팅방의 user가 됩니다. (2명 이상 선택)
 * - 입력한 채팅방 이름이 Chat List에 뜹니다.
 */
function createGroupChat() {
    var selectedFriends = $('input[name="selectedFriends"]:checked')
        .map(function () {
            return this.value;
        })
        .get();
    var chatRoomName = $('#newChatRoomName').val().trim();
    if (selectedFriends.length <= 1) {
        alert('친구 2명 이상을 선택해주세요.');
    } else if (!chatRoomName) {
        alert('채팅방 이름을 작성해주세요.');
    } else {
        $.ajax({
            url: '/create-group-chat',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                roomName: chatRoomName,
                friends: selectedFriends,
            }),
            success: function () {
                alert('그룹 채팅방이 생성되었습니다!');
                fetchChatRooms();
            },
            error: function (response) {
                alert('채팅방 생성에 실패했습니다.');
            },
        });
        closeGroupChatPopup();
    }
}

$(document).ready(function () {
    fetchChatRooms();

    $('.icon.friend').click(function () {
        window.location = '/';
    });

    $('.icon.chat').click(function () {
        window.location = '/chatlist';
    });

    $('.icon.groupchat').click(function () {
        openGroupChatPopup();
    });

    $('#newChatRoomName').keyup(function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            createGroupChat();
        }
    });
});
