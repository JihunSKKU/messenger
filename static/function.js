$(document).ready(function () {
    var socket;
    var username = "";

    $(".container").scrollTop($(".container")[0].scrollHeight);

    // Function to get all messages
    function getMessage() {
        username = $("#username").val().trim();
        if (username !== "") {
            socket = new WebSocket("ws://localhost:8000/ws/" + username);

            // Fetch all messages from the database and display them
            $.ajax({
                type: "GET",
                url: "/chat_history",
                success: function (data) {
                    for (var i = 0; i < data.length; i++) {
                        // Check if the message is from the current user or another user
                        if (data[i].sender === username) {
                            displayMyMessage(data[i].message, data[i].time);
                        } else {
                            displayOtherMessage(
                                data[i].message,
                                data[i].sender,
                                data[i].time
                            );
                        }
                    }
                },
            });
        }
    }

    // Function to display my message
    function displayMyMessage(message, time) {
        var myChat = $(
            "<div class='chat-box'>" +
                "<div class='chat me'>" +
                "<div class='time me'>" +
                time +
                "</div>" +
                "<div class='message me'>" +
                message.replace(/\n/g, "<br>") +
                "</div>" +
                "</div>" +
                "</div>"
        );

        $(".container").append(myChat);
        $(".container").scrollTop($(".container")[0].scrollHeight);
    }

    // Function to send a message
    function sendMessage() {
        var message = $("#input").val().trim();

        if (message !== "") {
            if (username !== "") {
                var time = new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });

                $.ajax({
                    type: "POST",
                    url: "/save_message",
                    data: {
                        message: message,
                        sender: username,
                        time: time,
                    },
                    success: function (response) {
                        displayMyMessage(message, time);
                        $("#input").val("");
                    },
                });
            } else {
                alert("로그인 후에 메세지를 보내주세요.");
            }
        }
    }

    // Function to display other user's message
    function displayOtherMessage(message, username, time) {
        var chat_get = $(
            "<div class='chat-box'>" +
                "<div class='user-name'>" +
                username +
                "</div>" +
                "<div class='chat you'>" +
                "<div class='message you'>" +
                message.replace(/\n/g, "<br>") +
                "</div>" +
                "<div class='time you'>" +
                time +
                "</div>" +
                "</div>" +
                "</div>"
        );

        $(".container").append(chat_get);
        $(".container").scrollTop($(".container")[0].scrollHeight);
    }

    $("#input").keydown(function (event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
        }
    });

    $("#input").keyup(function (event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    $("#message_btn").click(function () {
        sendMessage();
    });

    $("#user_btn").click(function () {
        getMessage();
    });
});
