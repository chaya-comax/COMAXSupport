$(document).ready(function () {
    SetPrm();
});



function SetPrm() {
    $.ajax({
        url: "Default.aspx",
        data: {
            status: "SetPrm"
        },
        method: 'Post',
        async: false,
        cache: false,
        success: function (data) {
            var year = '';
            var companyName = '';
            var resData = JSON.parse(data);
            if (resData.success) {
                $.each(resData.messages, function (i, v) {
                    switch (v.type) {
                        case "title":
                            document.title = v.message;
                            companyName = v.message;
                            break;
                        case "year":
                            year = v.message;
                            break;
                        case "user":
                            $("#user").append('<span>' + v.message + '</span>')
                            break;
                        case "N_Lang":

                            if (v.message == "1")
                                global.user.current_language_code = "en-US";
                            else
                                global.user.current_language_code = "he";
                            changeStyleLanguage();
                            break;
                        case "SwSnif":
                            global.company.SwSnif = v.message;
                            break;
                        case "CurrSnif":
                            global.company.CurrSnif = v.message;
                            break;
                        case "SnifNm":
                            global.company.SnifNm = v.message;
                            break;
                    }
                });

                companyName != '' && year != '' ? $("#company-name").text(companyName + ' ' + year) : '';

            }

        },
        error: function (err) {
        }
    });
}

function IsDate(s) {
    var res = false;
    if (s == "" || s == "null" || s == undefined)
        return false;
    if (s instanceof Date || typeof s == 'object')

        s = getFormatStringDate(s)
    s = ReplaceSpace(s);
    s = getDateJSFormat(s);

    if (JSIsDateTime(s))
        res = true;
    else if (JSIsDate(s))
        res = true;
    else if (JSIsTime(s))
        res = true;
    else if (JSIsMonthYear(s))
        res = true;
    return res;
}

function Datepart(format, d) {
    var d1 = new Date(d);
    if (d1 instanceof Date && !isNaN(d1.valueOf())) {
        switch (format.toLowerCase()) {
            case "yyyy":
                return d1.getFullYear();
                break;
            case "m":
                return d1.getMonth() + 1;
                break;
            case "d":
                return d1.getDate();
                break;
            case "w":
                return d1.getDay();
                break;
            case "h":
                return d1.getHours();
                break;
            case "n":
                return d1.getMinutes();
                break;
            case "s":
                return d1.getSeconds();
                break;
        }
    }
    return d;
}


function DatepartNm(date, sw) {
    if (date == "" || date == null)
        return "";
    D = Datepart("w", date);
    switch (D) {
        case 0:
            D = "א";
            break;
        case 1:
            D = "ב";
            break;
        case 2:
            D = "ג";
            break;
        case 3:
            D = "ד";
            break;
        case 4:
            D = "ה";
            break;
        case 5:
            D = "ו";
            break;
        case 6:
            D = "ש";
            break;
    }
    return D + "'";
}
function DisabledCombo(name) {
    $('[name=\'' + name + '\']').attr('disabled', true)
    $('[name=\'' + name + '\']').siblings().children().first().attr('disabled', true)
}

/////
//errors from modals when didn't send from submit, as from ajax. e.g: account_check_valid()
function errors(errors, modal) {
    var clones, container, e, err, error, field, i, j, k, len, len1;
    if (errors == null) {
        errors = [];
    }
    container = modal.container;
    if ((modal != null) && (modal.container != null) && modal.container.find('.header-input').length) {
        container = modal.container.add(modal.container.find('.header-input'));
    }
    container.find('[name]').each(function () {
        clearError($(this));
    });
    for (j = 0, len = errors.length; j < len; j++) {
        error = errors[j];
        for (field in error) {
            err = error[field];
            if (Array.isArray(err)) {
                clones = modal.container.find("[name='" + field + "[]']").closest('.clone').parent().children('.clone');
                for (i = k = 0, len1 = err.length; k < len1; i = ++k) {
                    e = err[i];
                    if (e != null) {
                        addError(clones.eq(i).find("[name='" + field + "[]']"), e, modal);
                    }
                }
            } else {
                addError(modal.container.find("[name='" + field + "']"), err, modal);
            }
        }
    }
    modal.container.find('.has-error').first().focus();
}
function addError(element, error, modal) {
    var error_first, spoiler, spoilerId;
    error = BaseManager.__(error, null, true);

    clearError(element);
    if (element.hasClass('select')) {
        element = element.next('.select-container');
        element.addClass('has-error').find('.select-arrow').after($('<div class="error" />').text(error));
    } else if (element.hasClass('summernote')) {
        element = element.next('.note-editor');
        element.addClass('has-error').after($('<div class="error" />').css('marginLeft', element.css('marginLeft')).text(error));
    } else {
        element.addClass('has-error').after($('<div class="error" />').css({
            marginRight: element.css('marginLeft'),
            Right: element.position() != null ? element.position().left : 'initial'
        }).text(error));
    }
    if (!element.is(':visible')) {
        spoiler = element.closest('.spoiler-content');
        if (spoiler.length) {
            spoilerId = spoiler.attr('id');
            $("[data-spoiler='" + spoilerId + "']").trigger('click');
        }
    }
    error_first = modal.container.find('.has-error').first();
    if (error_first.hasClass('select')) {
        error_first.find('.select-input').focus();
    } else {
        error_first.focus();
    }
}
function clearError(element) {
    if (element.hasClass('select')) {
        element.next('.select-container').removeClass('has-error').find('.select-arrow').next('.error').remove();
    }
    if (element.hasClass('summernote')) {
        element.next('.note-editor').removeClass('has-error').next('.error').remove();
    } else {
        element.removeClass('has-error').next('.error').remove();
    }
}
/////