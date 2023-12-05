$(document).ready(function () {
    $('#btn_login').click(function (event) {
        var username = $('#username').val();
        var password = $('#password').val();

        var data = { username: username, password: password };
        $.ajax({
            url: '/token',
            type: 'post',
            data: data,
            success: function (data, txtStatus, xhr) {
                window.location = '/';
            },
            error: function (e) {
                alert('Login Failed!');
            },
        });
    });

    $('#btn_signup').click(function (event) {
        window.location = '/signup';
    });
});
