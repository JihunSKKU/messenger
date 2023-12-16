var ws = new WebSocket('ws://localhost:8000/ws/' + room_id);

// Function to display my message
function displayMyMessage(message, time) {
    var myChat = $(
        "<div class='chat-box'>" +
            "<div class='chat me'>" +
            "<div class='time me'>" +
            time +
            '</div>' +
            "<div class='message me'>" +
            message.replace(/\n/g, '<br>') +
            '</div>' +
            '</div>' +
            '</div>'
    );

    $('#input').val('');
    $('.container').append(myChat);
    $('.container').scrollTop($('.container')[0].scrollHeight);
}

// Function to display other user's message
function displayOtherMessage(sender_name, message, time) {
    var chat_get = $(
        "<div class='chat-box'>" +
            "<div class='user-name'>" +
            sender_name +
            '</div>' +
            "<div class='chat you'>" +
            "<div class='message you'>" +
            message.replace(/\n/g, '<br>') +
            '</div>' +
            "<div class='time you'>" +
            time +
            '</div>' +
            '</div>' +
            '</div>'
    );

    $('.container').append(chat_get);
    $('.container').scrollTop($('.container')[0].scrollHeight);
}

// Function to display message after distinguish
function displayMessage(item) {
    var sender_name = item.sender_name;
    var message = item.content;
    var time = item.time;

    console.log(item);

    if (sender_name == username) {
        displayMyMessage(message, time);
    } else {
        displayOtherMessage(sender_name, message, time);
    }
}

// Function to send a message
function sendMessage() {
    var message = $('#input').val().trim();
    if (message !== '') {
        var time = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
        var item = {
            chat_type: 'message',
            sender_id: user_id,
            sender_name: username,
            content: message,
            time: time,
            room_id: room_id,
        };

        $.ajax({
            url: '/chatroom/' + room_id + '/chats',
            type: 'post',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(item),
            success: function () {
                ws.send(JSON.stringify(item));
            },
            error: function (xhr, status, error) {
                console.error('Error sending message:', xhr.responseText);
            },
        });
    }
}

// Function to get all messages
function getMessage() {
    $('.container').empty();
    // Fetch all messages from the database and display them
    $.getJSON('/chatroom/' + room_id + '/chats', function (chatlist) {
        chatlist.forEach((item) => {
            displayMessage(item);
        });
    });
    $('#username').val('');
    $('#input').val('');
}

$(document).ready(function () {
    getMessage();

    ws.onmessage = function (event) {
        var item = JSON.parse(event.data);
        if (item.chat_type == 'message') {
            displayMessage(item);
        }
    };

    $('.container').scrollTop($('.container')[0].scrollHeight);

    $('#input').keydown(function (event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
        }
    });

    $('#input').keyup(function (event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    $('#message_btn').click(function () {
        sendMessage();
    });
});
