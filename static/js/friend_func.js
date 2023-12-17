function fetchFriends() {
    $.get('/friends', function (data) {
        var friendsHtml = data
            .map(function (friend) {
                return (
                    '<div class="friend-item" data-username="' +
                    friend.username +
                    '">' +
                    friend.username +
                    '</div>'
                );
            })
            .join('');
        $('#friend-list').html(friendsHtml);

        $('.friend-item').click(function () {
            var friendUsername = $(this).data('username');
            $.post(
                '/get-or-create-chatroom',
                JSON.stringify({ friendUsername: friendUsername }),
                function (response) {
                    window.location.href = '/chatroom/' + response.chatroomId;
                },
                'json'
            );
        });
    });
}

function openAddFriendPopup() {
    document.getElementById('addFriendPopup').style.display = 'block';
}

function closeAddFriendPopup() {
    document.getElementById('newFriendName').value = '';
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
    fetchFriends();

    $('.icon.chat').click(function () {
        window.location = '/chatlist';
    });

    $('.icon.addfriend').click(function () {
        openAddFriendPopup();
    });

    $('#newFriendName').keyup(function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            addFriend();
        }
    });
});
