$(document).ready(function () {
    $('#btn_login').click(function (event) {
        var username = $('#username').val();
        var password = $('#password').val();

        if (username === '') {
            alert('id를 입력해주세요!');
            return;
        }
        if (password === '') {
            alert('password를 입력해주세요!');
            return;
        }

        var data = { username: username, password: password };
        $.ajax({
            url: '/token',
            type: 'post',
            data: data,
            success: function (data, txtStatus, xhr) {
                window.location = '/';
            },
            error: function (e) {
                alert(
                    '로그인에 실패했습니다. id와 password를 다시 확인해주세요.'
                );
            },
        });
    });

    $('#btn_signup').click(function (event) {
        window.location = '/signup';
    });
});
