var receiverName = '';
var ws = new WebSocket('ws://localhost:8000/ws');

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
    var receiver_name = item.receiver_name;
    var message = item.content;
    var time = item.time;
    if (sender_name == user_name) {
        displayMyMessage(message, time);
    } else if (receiver_name == user_name) {
        displayOtherMessage(sender_name, message, time);
    }
}

// Function to update all chats
function updateChat(chats) {
    chats.forEach((item) => {
        if (item.chat_type == 'message') {
            displayMessage(item);
        }
    });
}

// Function to get all chats
function getChat() {
    tmp = receiverName;
    receiverName = $('#username').val().trim();
    if (receiverName !== '') {
        $('.container').empty();
        $.getJSON('/chat', updateChat);
        $('#username').val('');
        $('#input').val('');
    } else {
        receiverName = tmp;
    }
}

// Function to send a message
function sendMessage() {
    var message = $('#input').val().trim();
    if (message !== '') {
        if (receiverName !== '') {
            var time = new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });
            var item = {
                chat_type: 'message',
                sender_name: user_name,
                receiver_name: receiverName,
                content: message,
                time: time,
            };

            $.ajax({
                url: '/chat',
                type: 'post',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(item),
                success: function () {
                    ws.send(JSON.stringify(item));
                },
            });
        } else {
            alert('로그인 후에 메세지를 보내주세요.');
        }
    }
}

$(document).ready(function () {
    getChat();

    ws.onmessage = function (event) {
        try {
            if (receiverName !== '') {
                var item = JSON.parse(event.data);
                // console.log(chat);
                if (item.chat_type == 'message') {
                    displayMessage(item);
                }
            }
        } catch (error) {
            console.error('Error parsing JSON: ', error);
        }
    };

    $('.container').scrollTop($('.container')[0].scrollHeight);

    var userInput = document.getElementById('username');
    userInput.onkeydown = function (event) {
        if (event.key === 'Enter') {
            getChat();
        }
    };

    $('#user_btn').click(function () {
        getChat();
    });

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
