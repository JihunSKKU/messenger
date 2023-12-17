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

function openAddFriendPopup() {
    document.getElementById('addFriendPopup').style.display = 'block';
}

function closeAddFriendPopup() {
    document.getElementById('addFriendPopup').val = '';
    document.getElementById('addFriendPopup').style.display = 'none';
}

function addFriend() {
    var friendName = document.getElementById('newFriendName').value;
    if (friendName) {
        $.ajax({
            url: '/add-friend',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username: friendName }),
            success: function (data) {
                alert('친구가 추가되었습니다!');
                fetchFriends();
            },
            error: function (response) {
                alert(response.responseJSON.detail);
            },
        });
    } else {
        alert('친구 이름을 입력해주세요.');
    }
    closeAddFriendPopup();
}

$(document).ready(function () {
    fetchChatRooms();

    $('.icon.friend').click(function () {
        window.location = '/';
    });
    
    $('.icon.chat').click(function () {
        window.location = '/chatlist';
    });
});
