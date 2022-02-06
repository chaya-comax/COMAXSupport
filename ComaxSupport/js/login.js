$(document).ready(function () {

    $('input')[0].focus();

    $(".input").on("focus", function () {
        $(this).removeClass("error");
    })

    $('input').keydown(function (e) {
        var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
        if (key == 13) {
            e.preventDefault();
            var inputs = $('input');
            var index = inputs.index(this) + 1;
            if (index + 1 == inputs.length)
                $("input[type=submit]").click();
            else
                inputs.eq(index).focus();
        }
    });

    $("input[type=submit]").on("click", function () {
        if (valid())
            chk();
    });
});



function valid() {
    var isValid = true;
    for (var i = 0; i < $(".input").length; i++) {
        if ($(".input")[i].value == "") {
            $($(".input")[i]).addClass("error");
            $($(".input")[i]).focus();
            isValid = false;
        }
    }
    return isValid;
}
function chk() {
    $.ajax({
        url: "Default.aspx",
        data: {
            status: "login",
            lk: $("#lk").val(),
            user_pass: $("#user_pass").val(),
            password_pass: $("#password_pass").val()
        },
        method: 'Post',
        async: false,
        cache: false,
        success: function (data) {
            var resData = JSON.parse(data);
            if (resData.success) {
                window.location.href = "dashboard.html";
            }
            else {
                $(".p-5").removeClass("display-none");
            }
        },
        error: function (err) {
            $(".p-5").removeClass("display-none");
            $(".alert-primary").text(err);
        }
    });
}
