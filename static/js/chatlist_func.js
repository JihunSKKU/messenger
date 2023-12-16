function fetchFriends() {
    $.get('/friends', function (data) {
        var friendsHtml = data
            .map(function (friend) {
                return '<div class="friend-item">' + friend.username + '</div>';
            })
            .join('');
        $('#chat-list').html(friendsHtml);
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
    fetchFriends();

    $('.icon.friend').click(function () {
        window.location = '/';
    });

    // $('.icon.groupchat').click(function () {
    //     openAddFriendPopup();
    // });
});
