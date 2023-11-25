$(document).ready(function () {
    $(".container").scrollTop($(".container")[0].scrollHeight);

    // Function to send message for user1
    function user1_sendMessage() {
        var message = $("#input1").val().trim();
        if (message !== "") {
            var time = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });

            var chat_me = $(
                "<div class='chat me'>" +
                    "<div class='time me'>" +
                    time +
                    "</div>" +
                    "<div class='message me'>" +
                    message.replace(/\n/g, "<br>") +
                    "</div>" +
                    "</div>"
            );

            var chat_you = $(
                "<div class='chat you'>" +
                    "<div class='message you'>" +
                    message.replace(/\n/g, "<br>") +
                    "</div>" +
                    "<div class='time you'>" +
                    time +
                    "</div>" +
                    "</div>"
            );

            $(".container.user1").append(chat_me);
            $(".container.user2").append(chat_you);
            $(".container").scrollTop($(".container")[0].scrollHeight);

            $("#input1").val("");
        }
    }

    // Function to send message for user2
    function user2_sendMessage() {
        var message = $("#input2").val().trim();
        if (message !== "") {
            var time = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });

            var chat_me = $(
                "<div class='chat me'>" +
                    "<div class='time me'>" +
                    time +
                    "</div>" +
                    "<div class='message me'>" +
                    message.replace(/\n/g, "<br>") +
                    "</div>" +
                    "</div>"
            );

            var chat_you = $(
                "<div class='chat you'>" +
                    "<div class='message you'>" +
                    message.replace(/\n/g, "<br>") +
                    "</div>" +
                    "<div class='time you'>" +
                    time +
                    "</div>" +
                    "</div>"
            );

            $(".container.user2").append(chat_me);
            $(".container.user1").append(chat_you);
            $(".container").scrollTop($(".container")[0].scrollHeight);

            $("#input2").val("");
        }
    }

    $(".message-input").keydown(function (event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
        }
    });

    $("#input1").keyup(function (event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            user1_sendMessage();
        }
    });

    $("#input2").keyup(function (event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            user2_sendMessage();
        }
    });

    $("#btn1").click(function () {
        user1_sendMessage();
    });

    $("#btn2").click(function () {
        user2_sendMessage();
    });
});
