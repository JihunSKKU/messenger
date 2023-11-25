$(document).ready(function () {
    var currUsername = "";
    var ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = function (event) {
        try {
            if (currUsername !== "") {
                var chat = JSON.parse(event.data);
                // console.log(chat);
                var sender = chat.sender;
                var message = chat.message;
                var time = chat.time;
                displayMessage(sender, message, time);
            }
        } catch (error) {
            console.error("Error parsing JSON: ", error);
        }
    };

    $(".container").scrollTop($(".container")[0].scrollHeight);

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

        $("#input").val("");
        $(".container").append(myChat);
        $(".container").scrollTop($(".container")[0].scrollHeight);
    }

    // Function to display other user's message
    function displayOtherMessage(sender, message, time) {
        var chat_get = $(
            "<div class='chat-box'>" +
                "<div class='user-name'>" +
                sender +
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

    // Function to display message after distinguish
    function displayMessage(sender, message, time) {
        if (sender == currUsername) {
            displayMyMessage(message, time);
        } else {
            displayOtherMessage(sender, message, time);
        }
    }

    // Function to get all messages
    function getMessage() {
        prevUsername = currUsername;
        currUsername = $("#username").val().trim();
        if (currUsername !== "") {
            $(".container").empty();
            // Fetch all messages from the database and display them
            $.getJSON("/getchatlist", function (chatlist) {
                chatlist.forEach((chat) => {
                    var sender = chat.sender;
                    var message = chat.message;
                    var time = chat.time;
                    displayMessage(sender, message, time);
                });
            });
            $("#username").val("");
            $("#input").val("");
        } else {
            currUsername = prevUsername;
        }
    }

    // Function to send a message
    function sendMessage() {
        var message = $("#input").val().trim();
        if (message !== "") {
            if (currUsername !== "") {
                var time = new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                var chat = {
                    sender: currUsername,
                    message: message,
                    time: time,
                };

                $.ajax({
                    url: "/postchat",
                    type: "post",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(chat),
                    success: function () {
                        ws.send(JSON.stringify(chat));
                    },
                });
            } else {
                alert("로그인 후에 메세지를 보내주세요.");
            }
        }
    }

    var userInput = document.getElementById("username");
    userInput.onkeydown = function (event) {
        if (event.key === "Enter") {
            getMessage();
        }
    };

    $("#user_btn").click(function () {
        getMessage();
    });

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
});
