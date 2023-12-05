var currUsername = '';
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
function displayOtherMessage(sender, message, time) {
    var chat_get = $(
        "<div class='chat-box'>" +
            "<div class='user-name'>" +
            sender +
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
function displayMessage(sender, message, time) {
    if (sender == currUsername) {
        displayMyMessage(message, time);
    } else {
        displayOtherMessage(sender, message, time);
    }
}

// Function to get all messages
function getChat() {
    prevUsername = currUsername;
    currUsername = $('#username').val().trim();
    if (currUsername !== '') {
        $('.container').empty();
        // Fetch all messages from the database and display them
        $.getJSON('/chat', function (chat) {
            chat.forEach((item) => {
                if (item.chatType == 'message') {
                    var sender = item.sender;
                    var message = item.content;
                    var time = item.time;
                    displayMessage(sender, message, time);
                }
            });
        });
        $('#username').val('');
        $('#input').val('');
    } else {
        currUsername = prevUsername;
    }
}

// Function to send a message
function sendMessage() {
    var message = $('#input').val().trim();
    if (message !== '') {
        if (currUsername !== '') {
            var time = new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });
            var item = {
                chatType: 'message',
                sender: currUsername,
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
    ws.onmessage = function (event) {
        try {
            if (currUsername !== '') {
                var item = JSON.parse(event.data);
                // console.log(chat);
                if (item.chatType == 'message') {
                    var sender = item.sender;
                    var message = item.content;
                    var time = item.time;
                    displayMessage(sender, message, time);
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
