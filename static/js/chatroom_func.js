var ws = new WebSocket('ws://localhost:8000/ws/' + room_id);

// Function to display my message
function displayMyMessage(message, time) {
    var myChat = $(
        "<div class='chat-box'>" +
            "<div class='chat me'>" +
            "<div class='time me'>" +
            new Date(time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }) +
            '</div>' +
            message +
            '</div>' +
            '</div>'
    );

    $('.container').append(myChat);
}

// Function to display other user's message
function displayOtherMessage(sender_name, message, time) {
    var chat_get = $(
        "<div class='chat-box'>" +
            "<div class='user-name'>" +
            sender_name +
            '</div>' +
            "<div class='chat you'>" +
            message +
            "<div class='time you'>" +
            new Date(time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }) +
            '</div>' +
            '</div>' +
            '</div>'
    );

    $('.container').append(chat_get);
}

// Scroll을 맨 밑으로 내려주는 함수
function updateScroll() {
    $('.container').scrollTop($('.container')[0].scrollHeight);
}

// Function to display message after distinguish
function displayMessage(item) {
    var sender_name = item.sender_name;
    var message = item.content;
    var time = item.time;

    if (item.chat_type === 'image') {
        var imagePath = item.content.replace('./static/image/', '');
        message =
            `<a href='/static/image/${imagePath}' target='_blank'>` +
            `<img src='/static/image/${imagePath}'` +
            `onload='updateScroll()'` +
            `alt='Image'` +
            `style='max-width: 200px; min-width: 100px; max-height: 400px; min-height: 100px;` +
            `border-radius: 7px; margin: 5px;'>` +
            `</a>`;
    } else if (item.chat_type === 'video') {
        var videoPath = item.content.replace('./static/video/', '');
        message =
            `<a href='/static/video/${videoPath}' target='_blank'>` +
            `<video controls ` +
            `onloadedmetadata='updateScroll()'` +
            `style='max-width: 200px; min-width: 100px; max-height: 400px; min-height: 100px;` +
            `border-radius: 7px; margin: 5px'>` +
            `<source src='/static/video/${videoPath}' type='video/mp4'>` +
            `Your browser does not support the video tag.` +
            `</video>` +
            `</a>`;
    }

    if (sender_name == username) {
        if (item.chat_type === 'message') {
            message =
                "<div class='message me'>" +
                item.content.replace(/\n/g, '<br>') +
                '</div>';
        }
        displayMyMessage(message, time);
    } else {
        if (item.chat_type === 'message') {
            message =
                "<div class='message you'>" +
                item.content.replace(/\n/g, '<br>') +
                '</div>';
        }
        displayOtherMessage(sender_name, message, time);
    }

    updateScroll();
}

// Function to send a message
function sendMessage(type, content) {
    var time = new Date();
    var item = {
        chat_type: type,
        sender_id: user_id,
        sender_name: username,
        content: content,
        time: time,
        room_id: room_id,
    };
    console.log(time.toISOString);

    $.ajax({
        url: '/chatroom/' + room_id + '/chats',
        type: 'post',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(item),
        success: function () {
            ws.send(JSON.stringify(item));
            if (type === 'message') {
                $('#input').val('');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error sending message:', xhr.responseText);
        },
    });
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
        displayMessage(item);
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
            var message = $('#input').val().trim();
            if (message !== '') {
                sendMessage('message', message);
            }
        }
    });

    $('#message_btn').click(function () {
        var message = $('#input').val().trim();
        if (message !== '') {
            sendMessage('message', message);
        }
    });

    $('.icon.back').click(function () {
        ws.close();
        if (document.referrer.includes('/chatlist')) {
            window.location = '/chatlist';
        } else {
            window.location = '/';
        }
    });

    $('.icon.image').click(function () {
        $('#image_input').click();
    });

    $('.icon.video').click(function () {
        $('#video_input').click();
    });

    document
        .getElementById('image_input')
        .addEventListener('change', async function (event) {
            var file = event.target.files[0];
            var formData = new FormData();
            formData.append('file', file);

            try {
                let response = await fetch('/upload/image/', {
                    method: 'POST',
                    body: formData,
                });
                let result = await response.json();

                sendMessage('image', result.filename);
            } catch (error) {
                console.error('Error:', error);
            }
        });

    document
        .getElementById('video_input')
        .addEventListener('change', async function (event) {
            var file = event.target.files[0];
            var formData = new FormData();
            formData.append('file', file);

            try {
                let response = await fetch('/upload/video/', {
                    method: 'POST',
                    body: formData,
                });
                let result = await response.json();

                sendMessage('video', result.filename);
            } catch (error) {
                console.error('Error:', error);
            }
        });
});
