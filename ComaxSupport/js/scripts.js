jQuery(window).load(function () {

    //document.title = sessionStorage.getItem("Company");
    function getCookie(cname) {
        let name = cname + '='
        let ca = document.cookie.split(';')
        for (let c of ca) {
            c = c.trim()
            if (c.startsWith(name)) {
                return c.substring(name.length, c.length)
            }
        }
        return ''
    }

    let clear_base = getCookie('clear_base_cook')
    if (typeof clear_base != 'undefined' && clear_base) {
        localStorage.removeItem('BaseManager')
        document.cookie = 'clear_base_cook=;expires=' + new Date()
    }



    Table.defaults.datePickerOptions.format = 'dd/mm/yy'
    Table.defaults.heightOfParent = '.tab-content'
    Table.defaults.margin = -15

    let start = typeof Storage != 'undefined' && !localStorage.BaseManager

    //if (typeof global != 'undefined') {
    //  // TabManager.default.datePickerOptions.startDate = new Date(1970, 1, 1)
    //  TabManager.default.datePickerOptions.format = global.format.date
    //  TabManager.default.datePickerOptions.weekStart = global.format.firstDayOfWeek
    //  // Table.defaults.datePickerOptions.startDate = new Date(1970, 1, 1)
    //  Table.defaults.datePickerOptions.format = global.format.date
    //  Table.defaults.datePickerOptions.weekStart = global.format.firstDayOfWeek
    //  Table.defaults.datePickerOptions.todayHighlight = true
    //  Table.defaults.datePickerOptions.datePickerToFormat = date => BaseManager.dateParse(date, undefined, false, false)
    //  // Form.default.datePickerOptions.startDate = new Date(1970, 1, 1)
    //  Form.default.datePickerOptions.format = global.format.date
    //  Form.default.datePickerOptions.noDayFormat = global.format.dateNoDay
    //  Form.default.datePickerOptions.timeFormat = global.format.time
    //  Form.default.datePickerOptions.weekStart = global.format.firstDayOfWeek
    //  Form.default.selectAutoChoose = global.user.use_barcode_scanner
    //}

    //function check_user_status () {
    //  $.ajax({
    //    type: 'GET',
    //    headers: {'X-CSRFToken': global.csrf},
    //    url: '/check_user_status/',
    //    cache: false,
    //    success: data => {
    //      if (data.success == false) {
    //        window.location.reload()
    //      }
    //      if (data.data.new_notifications) {
    //        BaseManager.notification.notificationUnseenCounter = data.data.new_notifications
    //        BaseManager.notification.notificationCounter = data.data.new_notifications
    //        BaseManager.notification.refreshCounter()
    //      }
    //    }
    //  })
    //}

    //check_user_status()
    //setInterval(check_user_status, 60000)

    //logout if idle
    //let idleTime

    //window.idle_start = () => {
    //  if (global.user.auto_logout) {
    //    clearTimeout(idleTime)
    //    idleTime = setTimeout(() => {
    //      idle_logout()
    //    }, 57 * 60000)
    //  }
    //}

    //idle_start()

    //$(this).on('mousemove keypress', () => {
    //  idle_start()
    //})


    $(document).on('click.dropdown', e => {
        let dropDownToggle = $(e.target).closest('.dropdown-toggle')
        if (dropDownToggle.length) {
            $('.dropdown-toggle').not(dropDownToggle).closest('.dropdown').removeClass('active')
            if (dropDownToggle.hasClass('disabled')) {
                return false
            }
            dropDownToggle.closest('.dropdown').toggleClass('active')
            return false
        } else {
            $('.dropdown-toggle').closest('.dropdown').removeClass('active')
        }
    })

    $(document).on('keyup', e => {
        if (e.altKey && e.keyCode == 65) {
            let currentTabId = BaseManager.tab.tabs[BaseManager.tab.current].id
            let selector = `#actions-bar #filters li[for="${currentTabId}"] .floating-buttons .add-button`
            $(selector).trigger('click')
        }
    })

    // $(document).on('keydown', e => {
    //   if (e.keyCode == 123) {
    //     return false
    //   }
    // })

    let $menu = $('#menu')
    let $userMenu = $('#user-menu')
    let $notificationsWrapper = $('#notificationsWrapper')
    let $navbBar = $('#nav_tabs')
    let $notificationIcon = $('#notification-icon')
    let $notifications = $('#notifications')

    $('#menu-search > input').on('input', () => {
        let search = $('#menu-search > input').val()
        $('.hidden-from-menu').removeClass('hidden-from-menu')
        let $menuLi = $('#menu .menu > li')
        if (search) {
            $('#menu-search > div').removeClass('hide')
            $menuLi.each((i, li) => {
                if (typeof $(li).data('opened') == 'undefined') {
                    $(li).data('opened', $(li).hasClass('active'))
                }
            })
            $menuLi.addClass('active')
            $menuLi.each((i, category) => {
                $(`.sub-menu-line .item > .title`, category).each((i, title) => {
                    if ($(title).text().toLowerCase().indexOf(search.toLowerCase()) == -1 || $(category).attr('id') == 'most_used_programs') {
                        $(title).closest('li').addClass('hidden-from-menu')
                    }
                })
                if ($(`.sub-menu-line li:not(.hidden-from-menu)`, category).length == 0) {
                    $(category).addClass('hidden-from-menu')
                }
            })
        } else {
            $('#menu-search > div').addClass('hide')
            $menuLi.removeClass('active')
            $menuLi.each((i, li) => {
                if ($(li).data('opened')) {
                    $(li).addClass('active')
                }
                $(li).removeData('opened')
            })
        }
    })

    $('#menu-search > div').on('click', () => {
        $('#menu-search > input').val('').trigger('input')
    })

    $notifications.niceScroll({
        horizrailenabled: false,
        cursoropacitymin: 0.5,
        railoffset: {
            left: 10
        }
    })

    $notificationIcon.click(() => {
        if (!$notificationsWrapper.hasClass('active')) {
            BaseManager.notification.getNotifications()
        }
    })

    $('#user').on('click', e => {
        e.originalEvent.namespace = 'popup'
        $userMenu.toggleClass('active')
    })

    $menu.on('keypress', e => {
        $('#menu-search > input').focus()
    })

    $('#menu-icon').on('click', e => {
        if (e.originalEvent) {
            e.originalEvent.namespace = 'popup'
        }
        else {
            $('.popup-toggle').addClass('active')
        }
        $menu.toggleClass('active')
        if ($menu.hasClass('active')) {
            $('.menu > #most_used_programs').addClass('active')
            $('.view-port', $menu).niceScroll({
                horizrailenabled: false,
                cursorwidth: 0,
                cursoropacitymin: 0.5,
                railoffset: { left: -5 },
                railalign: 'left'
            })
        }
        else {
            $('.menu > #most_used_programs').removeClass('active')
            $('.view-port', $menu).getNiceScroll().remove()
        }
        $('.menu > li > .sub-menu-line').css('border-top', 'none')
        let list_li = $('.menu > li')
        for (let i = 0; i < list_li.length; i++) {
            if ($(list_li[i]).hasClass('active')) {
                if (!$(list_li[i]).prev().hasClass('active')) {
                    let background = $(list_li[i]).find('.menu-item').css('background-color')
                    $(list_li[i]).find('.sub-menu-line').first().css('border-top', '2px solid ' + background)
                }
            }
        }
        $('#menu-search > input').focus()
    })

    $notificationIcon.on('click', e => {
        e.originalEvent.namespace = 'popup'
        $notificationsWrapper.toggleClass('active')
    })

    $userMenu.on('click', '[data-callback]:not(.disabled)', function (e) {
        let callback = $(this).data('callback')
        if (callback) {
            if (!$(this).hasClass('not-popup')) {
                e.originalEvent.closePopup = true
            }
            window[$(this).data('callback')]()
        }
    })

    $menu.on('click', '.menu > li > .menu-item', function () {
        $('li').not($(this).closest('li')).removeClass('active');
        $(this).closest('li').toggleClass('active');
        $('.menu > li > .sub-menu-line').css('border-top', 'none')
        let list_li = $('.menu > li')
        for (let i = 0; i < list_li.length; i++) {
            if ($(list_li[i]).hasClass('active')) {
                if (!$(list_li[i]).prev().hasClass('active')) {
                    let background = $(list_li[i]).find('.menu-item').css('background-color')
                    $(list_li[i]).find('.sub-menu-line').first().css('border-top', '2px solid ' + background)
                }
            }
        }
        let li_menu = $(this).closest('li')
        if (li_menu.hasClass('active') && ((li_menu.offset().top + li_menu.height() > $(window).height()) || li_menu.offset().top < $userMenu.offset().top)) {
            $('div#menu > .view-port').animate({
                scrollTop: this.closest('li').offsetTop
            }, 'slow');
        }
    })

    $menu.on('click', '.item[data-callback]:not(.disabled)', function (e) {
        let callback = $(this).data('callback')
        let callbackArguments = $(this).data('callback-arguments')
        if (callback) {
            $('.view-port', $menu).getNiceScroll().remove()
            e.originalEvent.closePopup = true
            setTimeout(() => {
                window[callback](callbackArguments ? callbackArguments : undefined)
            }, 0)
        }
    })

    $('#content-overlay').on('classChanged', function () {
        let $companyName = $('#company-name')
        if ($(this).hasClass('active')) {
            $companyName.removeClass('hidden')
            $navbBar.addClass('hide')
        } else {
            $companyName.addClass('hidden')
            $navbBar.removeClass('hide')
        }
    })

    function confirm_close_all(tabManger) {
        BaseManager.modal.open({
            id: 'close_all_tabs_confirmation_modal',
            title: BaseManager.__('ConfirmSure', 'Are you sure?'),
            width: '350px',
            keepLoad: false,
            ok: {
                header: true,
                callback: () => {
                    tabManger.closeAllTabs()
                }
            },
            cancel: {
                header: true
            }
        })
    }

    window.BaseManager = new BaseManager({
        format: global.format,
        notifyContainer: $('#notify'),
        tab: new TabManager({
            tabs: [],
            current: 0,
            content: $('#content-area'),
            navContainer: $navbBar,
            filterContainer: $('#filters'),
            fromBottomLoad: 500,
            closeAllConfirmCallback: confirm_close_all
        }),
        modal: new ModalManager({
            modalsContainer: $('#modals')
        }),
        notification: new NotificationManager({
            notificationCounterArea: $('#notification-count'),
            notificationListArea: $notifications,
            notificationIconArea: $notificationIcon,
            getData: {
                url: '/system/notifications/',
                notificationRenderCallback: notificationData => {
                    let notification = $('<div />', {
                        'class': 'notification' + ((notificationData.status == 1) ? ' notification-seen' : ''),
                        'data-id': notificationData.id
                    })
                    let notificationActions = $('<div />', { class: 'notification-actions' })
                    let notificationContent = $('<div />', { class: 'notification-content' })
                    notification.append(notificationContent).append(notificationActions)
                    $('<span></span>', {
                        class: 'seen notification-action glyphicon glyphicon-ok'
                    }).appendTo(notificationActions)
                    $('<span></span>', {
                        class: 'delete notification-action glyphicon glyphicon-remove'
                    }).appendTo(notificationActions)
                    let notificationDate = BaseManager.dateParse(notificationData.date, undefined, true, true)
                    notificationDate = BaseManager.dateFormat(notificationDate, undefined, true)
                    let message = BaseManager.__(notificationData.message_key, {
                        variables: notificationData.message_vars
                    })
                    notificationContent.append(message.text).append($('<div />', { class: 'notification-date' }).append(notificationDate))
                    return notification
                },
                responseCallback: response => {
                    BaseManager.notification.clearNotifications()
                    for (let i = 0; i < response.data.length; i++) {
                        BaseManager.notification.addNotification(response.data[i])
                    }
                }
            },
            notificationActions: {
                actionElement: '.notification .notification-actions .notification-action',
                callback: e => {
                    let notification = $(e.target).closest('.notification')
                    let id = notification.data('id')
                    let url = null
                    let callback = null
                    if ($(e.target).hasClass('seen')) {
                        url = '/system/seen_notification/'
                        callback = response => {
                            if (response.success) {
                                notification.addClass('notification-seen')
                                BaseManager.notification.notificationUnseenCounter -= 1
                                BaseManager.notification.refreshCounter()
                            }
                        }
                    }
                    else if ($(e.target).hasClass('delete')) {
                        url = '/system/delete_notification/'
                        callback = response => {
                            if (response.success) {
                                notification.remove()
                                BaseManager.notification.notificationCounter -= 1
                                if (!notification.hasClass('notification-seen')) {
                                    BaseManager.notification.notificationUnseenCounter -= 1
                                }
                                BaseManager.notification.refreshCounter()
                            }
                        }
                    }
                    $.ajax({
                        type: 'GET',
                        headers: { 'X-CSRFToken': global.csrf },
                        url: url,
                        data: { id: id },
                        cache: false,
                        success: callback
                    })
                }
            },
            clearAll: {
                element: $('#clearAllNotifications'),
                url: '/system/clear_all_notifications/',
                callback: response => {
                    if (response.success) {
                        BaseManager.notification.clearNotifications()
                    }
                }
            }
        })
    })

    setTimeout(() => {
        if (start) {
            $('#menu-icon').trigger('click')
        }
    }, 0)

})
