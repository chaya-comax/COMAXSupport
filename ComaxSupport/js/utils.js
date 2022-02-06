"use strict"

/** utils functions */
function getTableOrTab(id, table) {
    if (typeof table == 'undefined') {
        table = false
    }
    for (let i = 0; i < BaseManager.tab.tabs.length; i++) {
        if (BaseManager.tab.tabs[i].id == id) {
            return table ? BaseManager.tab.tabs[i]._table : i
        }
    }
    return null
}

function getModal(id) {
    for (let i = 0; i < BaseManager.modal.modals.length; i++) {
        if (BaseManager.modal.modals[i].id == id) {
            return i
        }
    }
    return null
}

function getPrintElement(modal) {
    if (typeof modal.container != 'undefined') {
        let element = modal.container.find('.modal-body')
        if (element.children().hasClass('scrollable')) {
            element = element.children('.scrollable')
        }
        return element.children()
    }
    return modal
}

function elementPrint(elm, type, classes, openMode, printWindow, item) {
    if (typeof type == 'undefined') {
        type = 'print'
    }
    if (typeof classes == 'undefined') {
        classes = $(elm).attr('class')
    }
    if ($(elm).find('.view-only')) {
        $(elm).find('.view-only').addClass('hide')
    }
    let doc = $('<html />', {
        id: type,
        class: classes,
        moznomarginboxes: '',
        mozdisallowselectionprint: ''
    }).append($('<head />')).append($('<body />').html($('<div />').html($(elm).clone()).html()))
    let head = doc.find('head')
    let version = $(document).find('head').data('version')
    if ($(elm).find('.title').length) {
        doc.find('head').append($('<title />').text($(elm).find('.title').text()))
    }
    head.append($('<link />', {
        href: '/static/css/print-view.css?v=' + version,
        rel: 'stylesheet',
        type: 'text/css',
        media: 'all'
    })).append($('<link />', {
        href: '/static/css/print-view-media-print.css?v=' + version,
        rel: 'stylesheet',
        type: 'text/css',
        media: 'all'
    })).append($('<script />', {
        src: '/static/js/third-party/jquery-2.1.1.min.js?v=' + version,
        type: 'text/javascript'
    })).append($('<script />', {
        src: '/static/js/print-utils.js?v=' + version,
        type: 'text/javascript'
    }))
    if (item) {
        doc.find('#salepricebeforedot').text(item.saleprice[0])
        if (item.saleprice[1]) {
            doc.find('#salepriceafterdot').text(item.saleprice[1])
        } else {
            doc.find('#salepriceafterdot').text("00")
        }
        if (item.price_per_kg) {
            doc.find('#price_per_kg0').text(item.price_per_kg[0])
            if (item.price_per_kg[1]) {
                doc.find('#price_per_kg1').text(item.saleprice[1])
            } else {
                doc.find('#price_per_kg1').text("00")
            }
        }
    }
    doc.find('#print_date').text(BaseManager.dateFormat(BaseManager.dateParse(new Date(), undefined, true, false), global.format.date + ' H:i'))
    if (openMode == 'newTab') {
        doc.append($('<footer />'))
        let footer = doc.find('footer')
        footer.append($('<script />', {
            type: 'text/javascript',
            text: 'setTimeout(function(){window.print()}, 10)'
        }))
        if (typeof printWindow == 'undefined') {
            printWindow = window.open("", "_blank")
        }
        printWindow.document.write(doc.html())
        printWindow.focus()
    } else {
        let iframe = $('<iframe />').attr('id', 'print_iframe').get(0)
        $('body').find('#print_iframe').remove()
        document.body.appendChild(iframe)
        iframe.contentWindow.document.open()
        iframe.contentWindow.document.write($('<div />').html(doc).html())
        $(iframe.contentWindow).load(function () {
            setTimeout(function () {
                $('style[media="all"]', iframe.contentWindow.document.firstChild).html(function () {
                    return this.innerHTML.replace('1cm', '.7cm')
                })
                if (iframe.contentWindow.document.execCommand == undefined || !iframe.contentWindow.document.execCommand('print', false, null)) {
                    iframe.contentWindow.print()
                    console.log('print event');
                }
            }, 0)
        })
        iframe.contentWindow.document.close()
    }
}

function printUrl(url, type, classes, openMode, item, callback) {
    let printWindow
    if (openMode == 'newTab') {
        printWindow = window.open("", "_blank")
    } else {
        printWindow = undefined
    }
    $.get(url, response => {
        let $response = $(response)
        if (type == 'barcode') {
            classes = $response.attr('class')
            $response.removeAttr('class')
        }
        if (typeof callback != 'undefined') {
            callback()
        }
        elementPrint($response, type, classes, openMode, printWindow, item)
    })
}

function downloadUrl(url) {
    $.ajax({
        url: url,
        data: { action: "export" },
        method: 'GET',
        success: function (data) {
            window.location = data;
        }
    });
}

function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email)
}

function findDictIndex(list, key, value) {
    for (let i in list) {
        if (list[i][key] == value) {
            return i
        }
    }
    return undefined
}

function onBottomScroll(scrollableContainer, callback, fromBottom) {
    if (typeof (fromBottom) == 'undefined' || isNaN(parseInt(fromBottom))) {
        fromBottom = 500
    }
    fromBottom = Math.abs(parseInt(fromBottom))
    scrollableContainer = $(scrollableContainer)
    let contentHeight = scrollableContainer.get(0).scrollHeight
    let scrollableContainerHeight = scrollableContainer.height()
    let calledCallback = false
    scrollableContainer.off('scroll.onBottomScroll')
    scrollableContainer.on('scroll.onBottomScroll', () => {
        let scrollTop = scrollableContainer.get(0).scrollTop
        if (contentHeight < scrollableContainer.get(0).scrollHeight) {
            contentHeight = scrollableContainer.get(0).scrollHeight
            scrollableContainerHeight = scrollableContainer.height()
            if (calledCallback) {
                calledCallback = false
            }
        }
        if (contentHeight - scrollableContainerHeight - scrollTop <= fromBottom && !calledCallback) {
            calledCallback = true
            callback()
        }
    })
}

function paginate(paginator) {
    if (typeof paginator.start == 'undefined') {
        paginator.start = 0
    }
    if (typeof paginator.length == 'undefined') {
        paginator.length = 50
    }
    if (typeof paginator._loadMore == 'undefined') {
        paginator._loadMore = true
    }
    if (typeof paginator._ajax == 'undefined') {
        paginator._ajax = null
    }
    if (paginator._ajax == null && paginator._loadMore) {
        let paginationData = {
            start: paginator.start,
            length: paginator.length
        }
        paginator._ajax = $.ajax({
            url: paginator.url,
            data: $.extend({}, paginationData, paginator.data),
            success: response => {
                paginator.success(response, paginator)
                if (Array.isArray(response)) {
                    if (response.length == paginator.length) {
                        paginator.start += paginator.length
                    } else {
                        paginator._loadMore = false
                    }
                } else {
                    if (typeof paginator.loadMore == 'undefined') {
                        paginator._loadMore = false
                        console.error('Give me loadMore function!')
                    } else {
                        paginator._loadMore = paginator.loadMore(response, paginator)
                    }
                }
            },
            complete: () => {
                paginator._ajax = null
            }
        })
    }
}

function seal_document(id, sealed, type, tabObj) {
    let data = {
        id: id,
        sealed: sealed,
        type: type
    }
    $.ajax({
        type: 'POST',
        data: data,
        url: '/sales/seal-document/',
        headers: { 'X-CSRFToken': global.csrf },
        success: response => {
            BaseManager.notify(response.messages[0].message, response.messages[0].type)
            let tab = getTableOrTab(tabObj.id)
            if (tab != null) {
                BaseManager.tab.load(tab, true)
            }
        }
    })
}

function round(value, digits = 2) {
    let tens = Math.pow(10, digits)
    return Math.round(value * tens) / tens
}

function getLastCode(doctype, location, date) {
    let last_code = null
    let data = {
        doctype: doctype,
        location: location,
        date: date.toISOString()
    }
    $.ajax({
        url: '/get-last-document-code/?' + $.param(data),
        headers: { 'X-CSRFToken': global.csrf },
        async: false,
        success: response => {
            last_code = response
        }
    })
    return last_code
}

function getReceiptLastCode(customer_company_id, type) {
    let last_code = null
    let data = {
        customer_company_id: customer_company_id,
        type: type
    }
    $.ajax({
        url: '/get-receipt-last-document-code/?' + $.param(data),
        headers: { 'X-CSRFToken': global.csrf },
        async: false,
        success: response => {
            last_code = response
        }
    })
    return last_code
}
