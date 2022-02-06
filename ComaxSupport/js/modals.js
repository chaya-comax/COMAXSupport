
'use strict'

function language() {
    let flags = $('<form style="direction: ltr;"/>')
    flags.append($('<input />', {
        type: 'radio',
        name: 'language[]',
        value: 'en-US',
        id: 'language_usa'
    }).add($('<label />', {
        for: 'language_usa',
        'data-i18n': '[title]' + BaseManager.__('LanguageTitleUSA', 'United States', true)
    })))
    flags.append($('<input />', {
        type: 'radio',
        name: 'language[]',
        value: 'he',
        id: 'language_he'
    }).add($('<label />', {
        for: 'language_he',
        'data-i18n': '[title]' + BaseManager.__('LanguageTitleIsrael', 'Israel', true)
    })))
    // flags.append($('<input />', {
    //   type: 'radio',
    //   name: 'language[]',
    //   value: 'en-GB',
    //   id: 'language_en'
    // }).add($('<label />', {
    //   for: 'language_en',
    //   'data-i18n': '[title]' + BaseManager.__('LanguageTitleUK', 'United Kingdom', true)
    // })))
    //flags.append($('<input />', {
    //    type: 'radio',
    //    name: 'language[]',
    //    value: 'ro',
    //    id: 'language_ro'
    //}).add($('<label />', {
    //    for: 'language_ro',
    //    'data-i18n': '[title]' + BaseManager.__('LanguageTitleRomania', 'Romania', true)
    //})))
    // flags.append($('<input />', {
    //   type: 'radio',
    //   name: 'language[]',
    //   value: 'it',
    //   id: 'language_it'
    // }).add($('<label />', {
    //   for: 'language_it',
    //   'data-i18n': '[title]' + BaseManager.__('LanguageTitleIt', 'Italian', true)
    // })))
    //flags.append($('<input />', {
    //    type: 'radio',
    //    name: 'language[]',
    //    value: 'ru',
    //    id: 'language_ru'
    //}).add($('<label />', {
    //    for: 'language_ru',
    //    'data-i18n': '[title]' + BaseManager.__('LanguageTitleRussia', 'Russia', true)
    //})))
    BaseManager.modal.open({
        id: 'language',
        title: BaseManager.__('UserMenuChangeLanguage', 'Change language'),
        width: 268,
        form: {
            content: flags,
            sendData: { language: $.i18n.lng() },
            callbacks: {
                submit: form => {
                    var lng = form.sendData.language;
                    BaseManager.i18n(form.sendData.language, null, () => {
                        form.parent.lock(form.modal.id, false)
                        BaseManager.modal.close(form.modal.id, false, true)
                        global.user.current_language_code = lng;
                        updateLang();
                    })
                },
                after: form => {
                    form.container.find('[name=\'language[]\']').val([form.sendData.language])
                    form.container.find('[name=\'language[]\']').change(function () {
                        if (!form.modal.container.hasClass('lock')) {
                            form.parent.lock(form.modal.id, true)
                            form.sendData.language = $(this).val()
                            form.submit()
                        }
                    })
                }
            }
        },
        cancel: {
            header: true
        }
    })
}
function logout() {
    BaseManager.modal.open({
        id: 'logout',
        title: BaseManager.__('UserMenuLogOut', 'Are you sure want to logout?'),
        ok: {
            header: true,
            callback: () => {
                if (window.localStorage) {
                    localStorage.clear()
                }
                window.location = 'Default.aspx?status=logout'
                return false
            }
        },
        cancel: {
            header: true
        }
    })
}
function help() {
    BaseManager.modal.open({
        id: 'help',
        title: BaseManager.__('UserMenuHelp', 'help me!!'),

        cancel: {
            header: true
        }
    })
}
function import_csv(title, model, param, fields, inner, folder, width) {
    if (typeof inner == 'undefined') {
        inner = false
    }
    if (typeof width == 'undefined') {
        width = 450
    }
    var load = 'get_import_form/import_form.aspx/';
    if (typeof folder != 'undefined') {
        load = folder + '/' + folder + '.aspx/';
    }
    BaseManager.modal.open({
        id: 'import',
        attrs: {
            class: 'import modal-danger'
        },
        title: title,
        inner: inner,
        keepLoad: false,
        load: load + model + '?param=' + param,
        form: {
            valid: {
                files: false
            },
            callbacks: {
                after: form => {
                    $(form.container).on('click', '[name=example]', () => {
                        download_sample(model)
                    })
                },
                onError: (form, response) => {
                    let modal = BaseManager.modal.modals[getModal('import')]
                    let file = modal._form.sendData.files
                    delete modal._form.sendData.files
                    if (modal._form.sendData.date) {
                        modal._form.sendData.date = (new Date(modal._form.sendData.date)).toISOString()
                    }
                    let data = $.extend({ file: file }, modal._form.sendData, fields)
                    let url = modal.container.find('form').data('action')
                    BaseManager.modal.close('import')
                    preview_csv(title, response, model, file, url, data)
                },
                onSend: (form, sendData) => {
                    sendData = $.extend(sendData, fields)
                }
            }
        },
        width: width,
        errDara: [],
        ok: {
            header: true,
            callback: modal => {
                if (model == 'accountsGroup') {
                    if (modal.confirmOk == null && $('[name=TType]').val() == '') {
                        var a = window.confirm("?קבוצות ללא סוג יקלטו כמאזני, האם להמשיך");
                        if (a) {
                            let $el = $('[name=TType]')
                            $el.data('select').reset()
                            $el.data('select').set('8', '')
                            modal._form.submit()
                        }
                        return false
                    } else {
                        modal._form.submit()
                    }
                }
                else {
                    modal._form.submit()
                }
            }

        },
        cancel: {
            header: true
        }
    })
}
function import_progress_modal(title) {
    BaseManager.modal.open({
        id: 'import_progress',
        title: title,
        inner: true,
        keepLoad: false,
        width: 450,
        errDara: [],
        actions: []
    })
}
function import_loading_modal() {
    let content = "<span class='spinner' style='font-size:115px; color:#777678; text-align:center;'>" +
        "<i class='fa fa-spinner fa-spin'></i>" +
        "</span>"
    BaseManager.modal.open({
        id: 'import_loading_modal',
        attrs: {
            class: 'text-center'
        },
        title: 'טעינה מתבצעת...',
        width: 400,
        inner: true,
        content: content,
        cancel: {
            header: true
        }
    })
}
function preview_csv(title, content, model, file, url, sendData) {
    function import_progress(id, container, modal, tabId) {
        modal.container.find('.option-wrapper').addClass('hidden')
        let i = 0
        //let pull = setInterval(() => {
        //    $.ajax({
        //        url: 'get_import_form/check_import_status.aspx?id=' + id + '&' + i,
        //        dataType: 'json',
        //        success: response => {
        //            /*container.find('.count').text(response.count)
        //            container.find('.imported').text(response.imported)
        //            container.find('.updated').text(response.updated)
        //            container.find('.errors').text(response.count - (response.imported + response.updated))*/
        //            if (response.errors) {
        //                modal.errData = response.errors
        //            }
        //            if (response.total == response.count) {
        //                clearInterval(pull)
        //                if (response.imported + response.updated == 0) {
        //                    BaseManager.notify(BaseManager.__('NotifyImportFail', 'Import failed!', true), 'danger')
        //                } else if (response.total > (response.imported + response.updated)) {
        //                    BaseManager.notify(BaseManager.__('NotifyImportDoneWithErrors', 'Import was successful, with some errors!', true), 'warning')
        //                } else {
        //                    BaseManager.notify(BaseManager.__('NotifyImportDone', 'Import was successful!', true), 'success')
        //                }
        //                if (response.total > (response.imported + response.updated) && modal.container.find('.clearfix .actions .btn-errors').length == 0) {
        //                    let btn_error = $('<button/>', {
        //                        text: 'תצוגת שגיאות',
        //                        class: 'btn btn-default btn-ok btn-errors',
        //                        style: 'width:inherit'
        //                    }).on('click', () => {
        //                        view_errors(modal)
        //                    })
        //                    modal.container.find('.clearfix .actions').append(btn_error)
        //                }
        //                if (modal.container.find('.clearfix .actions .btnok').length == 0) {
        //                    let btn_ok = $('<button/>', {
        //                        text: 'אישור',
        //                        class: 'btn btn-default btn-ok btnok',
        //                        style: 'padding-left:45px;'
        //                    }).on('click', () => {
        //                        BaseManager.modal.close(modal.id)
        //                    })
        //                    modal.container.find('.clearfix .actions').append(btn_ok)
        //                }
        //                let tab = getTableOrTab(tabId)
        //                if (tab !== null) {
        //                    BaseManager.tab.load(tab, true)
        //                }
        //            }
        //        },
        //        error: () => {
        //            clearInterval(pull)
        //            if (container.find('.import-progress').is(':visible')) {
        //                BaseManager.modal.close(modal.id)
        //            }
        //        }
        //    })
        //    i += 1
        //}, 1000)
    }

    let width = (model == 'price_list_line' || model == 'inventory_count_line') ? '35%' : '90%'

    BaseManager.modal.open({
        id: 'import-preview',
        title: 'תצוגת ' + title,
        content: content,
        inner: true,
        width: width,
        height: '100%',
        keepLoad: false,
        onOpen: modal => {
            const _sendData = JSON.parse(JSON.stringify(sendData))
            delete _sendData['file']
            if (content != "")
                sendData = $.extend({ tbl: tbl.innerHTML }, _sendData)
            else {
                BaseManager.notify(BaseManager.__('NotifyImportFail', 'Import failed!', true), 'danger')
                return false;
            }
            const data = $.extend({ header: model }, _sendData)

            let paginator = {
                url: 'preview_excel_file_lines.aspx',
                length: 50,
                start: 100,
                data: data,
                success: (result) => {
                    let trs = $(result).find('.scrollable .import-preview tbody').html()
                    modal.container.find('.scrollable .import-preview tbody').append(trs)
                    modal.container.find('.scrollable').removeClass('loading')
                },
                loadMore: (response, paginator) => {
                    if ($(response).find('.scrollable .import-preview tbody').children().length == paginator.length) {
                        paginator.start += paginator.length
                        return true
                    } else {
                        return false
                    }
                }
            }
            let loader = () => {
                if (paginator._loadMore) {
                    modal.container.find('.scrollable').addClass('loading')
                }
                paginate(paginator)
            }
            onBottomScroll(modal.container.find('.scrollable'), loader)
        },
        ok: {
            header: true,
            callback: () => {
                //import_progress_modal(title)
                //let modal = BaseManager.modal.modals[getModal('import_progress')]
                $.ajax({
                    type: 'POST',
                    data: sendData,
                    url: url,
                    headers: { 'X-CSRFToken': global.csrf },
                    success: data => {
                        //modal.container
                        //    .find('.modal-body')
                        //    .html(data)
                        //modal.container
                        //    .find('.actions .btn')
                        //    .removeClass('hidden')
                        //    .filter('.btn-ok, .btn-cancel, .btn-ok-confirm, .btn-danger')
                        //    .addClass('hidden')
                        //import_progress(
                        //    modal.container.find('.import-progress').attr('id'),
                        //    modal.container.find('.modal-body'),
                        //    modal,
                        //    model
                        //)
                        if (data == "")
                            BaseManager.notify(BaseManager.__('NotifyImportDone', 'Import was successful!', true), 'success')
                        else
                            BaseManager.notify(BaseManager.__('NotifyImportDoneWithErrors', 'Import was successful, with some errors!', true), 'warning')
                    }
                })
            }
        },
        cancel: {
            header: true,
            callback: () => {
                $.get('preview_excel_file_lines/?delete=true')
                return true
            }
        }
    })
}
function view_errors(modal) {
    BaseManager.modal.open({
        id: 'view_errors',
        errorData: modal.errData,
        title: 'תצוגת שגיאות',
        inner: true,
        width: '70%',
        height: '70%',
        load: '/view_import_errors/',
        keepLoad: false,
        cancel: {
            header: true
        },
        callback: error_modal => {
            let tbody = $('<tbody />')
            if (error_modal.errorData) {
                for (let i = 0; i < error_modal.errorData.length; i++) {
                    let tr = $('<tr />')
                    tr.append($('<td />', { class: 'line' }).text(error_modal.errorData[i].line))
                    tr.append($('<td />', { class: 'field' }).text(BaseManager.__(error_modal.errorData[i].field, 'No translation', true)))
                    tr.append($('<td />', { class: 'error_log' }).text(BaseManager.__(error_modal.errorData[i].error, 'Some errors with translation', true)))
                    let error_value = ''
                    if (typeof error_modal.errorData[i].value != 'undefined' && error_modal.errorData[i].value != null) {
                        error_value = error_modal.errorData[i].value
                    }
                    tr.append($('<td />', { class: 'value' }).text(error_value))
                    tbody.append(tr)
                }
            }
            error_modal.container.find('.scrollable .table tbody').html(tbody.children())
            error_modal.container.find('.scrollable .table').addClass('table-bordered')
        }
    })
}
function download_sample(model) {
    if (typeof model == 'undefined' || model == '') {
        return false
    }
    let url = 'download-excel-sample?model=' + model
    window.location = url
}
function export_csv(url, inner, callback) {
    if (typeof inner == 'undefined') {
        inner = false
    }
    BaseManager.modal.open({
        id: 'export',
        inner: inner,
        keepLoad: false,
        attrs: {
            class: 'modal-danger'
        },
        title: "האם ברצונך לייצא את הנתונים לאקסל?",
        ok: {
            header: true,
            callback: () => {
                if (typeof callback != 'undefined') {
                    callback(url)
                } else {
                    downloadUrl(url)
                }
            }
        },
        cancel: {
            header: true
        }
    })
}
function confirm_modal(title, callback, args) {
    BaseManager.modal.open({
        id: 'confirm-modal',
        title: title,
        keepLoad: false,
        inner: true,
        ok: {
            header: true,
            callback: () => {
                if (typeof callback != 'undefined')
                    callback(args)
            }
        },
        cancel: {
            header: true
        }
    })
}
function password(modal, kod) {

    $.ajax({
        url: 'password/password.aspx/chkPasswordSet',
        type: 'post',
        data: '{"kod":"' + kod + '"}',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: response => {
            if (response.d == "0") {
                modal._form.submit()
                return;
            }
            if (response.d == "-1") {
                alert("ERROR");
            }
        },
        error: () => {

        }
    })
    BaseManager.modal.open({
        id: 'password',
        title: BaseManager.__('ModalPassword', 'סיסמה'),
        load: 'password/password.aspx/get_form',
        keepLoad: false,
        inner: true,
        form: {
            data: {
                kod: kod
            },
            callbacks: {
                onSuccess: (response) => {
                    modal._form.submit()
                },
                onError: (form, response) => {
                }
            }
        },
        ok: {
            header: true
        },
        cancel: {
            header: true,
        }
    })
}
function password_company(curr_company, prev_company_id, prev_company_text) {
    BaseManager.modal.open({
        id: 'password_company',
        title: BaseManager.__('ModalPassword', 'סיסמה'),
        load: 'password/password.aspx/get_form_company',
        keepLoad: false,
        inner: true,
        form: {
            callbacks: {
                onSuccess: () => {
                    $('[name=SwMhrSpk_CurrCompany]').show();
                    $('label[for="SwMhrSpk_CurrCompany"]').show();
                    $('[name=SwNoUpdPaturMaam]').show();
                    $('label[for="SwNoUpdPaturMaam"]').show();
                },
                onError: (form, response) => {
                    //return_prev_company(curr_company, prev_company_id, prev_company_text);
                }
            }
        },
        ok: {
            header: true,
        },
        cancel: {
            header: true,
            callback: () => {
                return_prev_company(curr_company, prev_company_id, prev_company_text);
                return true
            }
        }
    })
}

function set_details_customers_company(tabObj) {
    let companySelect = $('#filters .active select[name=customer_company]', tabObj.closest('#content'))
    /*if (global.customers_companies.count_customers_companies == 1) {
        if (companySelect.length && !companySelect.data('select').isDisabled) {
            companySelect.data('select').set(
                global.customers_companies.main_customers_companies.id,
                global.customers_companies.main_customers_companies.code + ' - ' + global.customers_companies.main_customers_companies.nm
            )
            companySelect.data('select').disabled(true)
            $('#filters .active [data-i18n="FieldCompany"]', tabObj.closest('#content')).css('pointer-events', 'none')
        }
        let locationSelect = $('#filters .active select[name=location]', tabObj.closest('#content'))
        if (global.customers_companies.count_locations == 1) {
            if (locationSelect.length && !locationSelect.data('select').isDisabled) {
                locationSelect.data('select').set(
                    global.customers_companies.main_customers_companies.locations[0].id,
                    global.customers_companies.main_customers_companies.locations[0].code + ' - ' + global.customers_companies.main_customers_companies.locations[0].nm
                )
                locationSelect.data('select').disabled(true)
                $('#filters .active [data-i18n="FilterLocation"]', tabObj.closest('#content')).css('pointer-events', 'none')
            }
        }
    }*/
}
function item_price_logs(item_id, item_nm, item_code, buy_or_sale, inner, pricelist_id) {
    inner = true
    let data = {
        item_id: '1',
        buy_or_sale: '2'
    }
    if (typeof pricelist_id != 'undefined') {
        data.pricelist_id = pricelist_id
    }
    BaseManager.modal.open({
        id: 'item_price_logs',
        keepLoad: false,
        inner: inner,
        title: BaseManager.__('ModalItemPriceLogTitle', {
            defaultValue: 'Price log for item __name__ (__code__)',
            variables: {
                name: item_nm,
                code: item_code
            }
        }, true),
        load: 'item-price-logs.aspx/get_form?' + $.param(data),
        form: {
            callbacks: {

            }
        },
        width: 900,
        cancel: {
            header: true
        }
    })
}

function return_prev_company(curr_company, prev_company_id, prev_company_text) {
    $('[name=SwMhrSpk_CurrCompany]').hide();
    $('label[for="SwMhrSpk_CurrCompany"]').hide();
    $('[name=SwNoUpdPaturMaam]').hide();
    $('label[for="SwNoUpdPaturMaam"]').hide();
    curr_company.data('select').reset();
    curr_company.data('select').set(prev_company_id, prev_company_text);
}





function supporter(id, element, callback) {
    let editData = null
    if (typeof id != 'undefined') {
        editData = {
           supporter_id: id, action: "edit"
        }
    }
    BaseManager.modal.open({
        id: 'supporter',
        width: 650,
        inner: typeof callback != 'undefined',
        keepLoad: false,
        animation: (typeof element != 'undefined' ? { element: element, type: 'card' } : null),
        title: 'הוספת תומך',
        load: 'form/supporter/supporter.aspx/get_form',
        form: {
            elementId: id,
            tabId: 'supporters',
            edit: {
                load: 'form/supporter/supporter.aspx/info',
                data: editData,
                modal: {
                    title: 'עדכון תומך'
                }
            },
            callbacks: {
                onSuccess: (form, response) => {
                    if (typeof callback != 'undefined') {
                        callback(form, response)
                    }
                }
            }
        },
        ok: {
            header: true,
        },
        okPlus: {
            header: true
        },
        cancel: {
            header: true
        }
    })
}

function product(id, element, callback) {
    let editData = null
    if (typeof id != 'undefined') {
        editData = {
            product_id: id, action: "edit"
        }
    }
    BaseManager.modal.open({
        id: 'product',
        width: 650,
        inner: typeof callback != 'undefined',
        keepLoad: false,
        animation: (typeof element != 'undefined' ? { element: element, type: 'card' } : null),
        title: 'הוספת מוצר',
        load: 'form/product/product.aspx/get_form',
        form: {
            elementId: id,
            tabId: 'products',
            edit: {
                load: 'form/product/product.aspx/info',
                data: editData,
                modal: {
                    title: 'עדכון מוצר'
                }
            },
            callbacks: {
                onSuccess: (form, response) => {
                    if (typeof callback != 'undefined') {
                        callback(form, response)
                    }
                }
            }
        },
        ok: {
            header: true,
        },
        okPlus: {
            header: true
        },
        cancel: {
            header: true
        }
    })
}


function institution_theme(id, element, callback) {
    let editData = null
    if (typeof id != 'undefined') {
        editData = {
            institution_theme_id: id,
            action: "edit"
        }
    }
    BaseManager.modal.open({
        id: 'institution_theme',
        width: 450,
        keepLoad: false,
        animation: (typeof element != 'undefined' ? { element: element, type: 'card' } : null),
        title: BaseManager.__('ModalAddDepartmentsTitle', 'הוספת מוסד/נושא'),
        load: 'institution_theme/institution_theme.aspx/get_form',
        inner: typeof callback != 'undefined',
        form: {
            elementId: id,
            tabId: 'institution_themes',
            edit: {
                load: 'institution_theme/institution_theme.aspx/info',
                data: editData,
                modal: {
                    title: BaseManager.__('ModalEditDepartmentsTitle', 'עדכון מוסד/נושא'),
                }
            },
            callbacks: {
                onSuccess: (form, response) => {
                    if (typeof callback != 'undefined') {
                        callback(form, response)
                    }
                }
            }
        },
        ok: {
            header: true
        },
        okPlus: {
            header: true
        },
        cancel: {
            header: true
        }
    })
}

function characters(form) {
    let editData = null

    editData = {
        action: "edit"
    }

    BaseManager.modal.open({
        id: 'characters',
        width: 650,
        keepLoad: false,
        title: BaseManager.__('ModalAddDepartmentsTitle', 'תווים'),
        load: 'characters/characters.aspx/get_form',
        inner: true,
        form: {
            edit: {
                load: 'characters/characters.aspx/info',
                data: editData
            },
            callbacks: {
                onSuccess: (form, response) => {

                }
            }
        },
        ok: {
            header: true
        },
        cancel: {
            header: true
        }
    })
}

function account_check_pass(modal) {
    var swPass = false;
    if (eval(modal._form.sendData.cntRevHef) > 0)
        if (modal._form.sendData.wFromType == "7" && modal._form.sendData.wType != "7")
            swPass = true;
    if (swPass) {
        password(modal, 92);
        return false;
    }
    else
        modal._form.submit()
}
function setVisType(form) {
    var $tr_FromType = $('[name=tr_FromType]');
    var $lbl_wType = $('[name=lbl_wType]');
    var $IdxA = $('[name=IdxA]');
    var $IdxM = $('[name=IdxM]');
    $.ajax({
        url: 'account/account.aspx/getCountIdx_Type',
        type: 'post',
        data: '{"IdxType":"7","IdxM":"' + $IdxM.val() + '","IdxA":"' + $IdxA.val() + '","swIdxType":"0"}',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: response => {
            var cntRevHef = response.d;
            form.sendData.cntRevHef = cntRevHef;
            if (eval(cntRevHef) > 0) {
                $tr_FromType.removeClass('hide');
                $lbl_wType.text("לסוג:");
            }
            else {
                $tr_FromType.addClass('hide');
                $lbl_wType.text("סוג:");
            }
        },
        error: () => {

        }
    })
}