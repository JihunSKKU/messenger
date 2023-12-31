function signup() {
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

    var data = {
        username: username,
        password: password,
    };

    $.ajax({
        url: '/register',
        type: 'post',
        data: data,
        success: function (response) {
            alert('회원가입에 성공하였습니다. 환영합니다!');
            window.location = '/login';
        },
        error: function (e) {
            alert('회원가입에 실패하였습니다. 다른 id를 입력해주세요.');
        },
    });
}

$(document).ready(function () {
    $('#btn_signup').click(function () {
        signup();
    });

    $('#btn_login').click(function (event) {
        window.location = '/login';
    });

    var input1 = document.getElementById('username');
    input1.onkeydown = function (event) {
        if (event.key === 'Enter') {
            signup();
        }
    };

    var input2 = document.getElementById('password');
    input2.onkeydown = function (event) {
        if (event.key === 'Enter') {
            signup();
        }
    };
});
