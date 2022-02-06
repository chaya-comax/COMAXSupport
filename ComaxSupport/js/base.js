var BaseManager, Form, Input, ModalManager, NotificationManager, Select, TabManager,
    indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

BaseManager = (function () {
    function BaseManager(settings) {
        var baseManager, prop, value;
        if (settings == null) {
            settings = {};
        }
        baseManager = this;
        this.modal = null;
        this.tab = null;
        this.notification = null;
        this.state = {};
        this.format = {
            date: 'dd/mm/yyyy'
        };
        this.notifyContainer = null;
        this.notifyTimeout = 3;
        this.notifyTimer = null;
        this.i18nInit = {
            fallbackLng: false,
            useCookie: true,
            cookieName: 'lang',
            useDataAttrOptions: true,
            load: 'current',
            getAsync: false,
            resGetPath: 'locales/__lng__.json'
        };
        for (prop in settings) {
            value = settings[prop];
            if (prop in this) {
                this[prop] = value;
                if (typeof value === 'object' && (this[prop].parent == null)) {
                    this[prop].parent = this;
                }
            }
        }
        this.load();
        $(window).on('keypress', function (e) {
            var current, filterButton, filters;
            if (!(baseManager.modal.visible.length || $('input:focus, textarea:focus, select:focus').length || !baseManager.tab.tabs[baseManager.tab.current].filterContainer.find('.floating-buttons .filters-button:visible').length)) {
                current = baseManager.tab.tabs[baseManager.tab.current];
                filters = current.filterContainer.find('.floating-filters');
                if (filters.find('.search').length) {
                    filters.removeClass('hide');
                    filterButton = current.filterContainer.find('.floating-buttons > .filters-button');
                    filters.css('right', ($(document).width() - $(filterButton[0]).offset().left - 50) + "px");
                    filters.find('.clear-all').css('margin-right', (filters[0].offsetWidth - 52) + "px");
                    if (current.id === 'items') {
                        if (e.keyCode >= 48 && e.keyCode <= 57) {
                            return current.filterContainer.find('input[name="code"]').focus();
                        } else {
                            return current.filterContainer.find('input[name="name"]').focus();
                        }
                    } else {
                        return current.filterContainer.find('.search input').first().focus();
                    }
                }
            }
        });
        $(window).on('keydown', function (e) {
            if (e.keyCode === 40) {
                if ($('.floating-filters input[name="search"]:focus').length) {
                    return baseManager.tab.tabs[baseManager.tab.current].content.focus();
                }
            }
        });
        $(window).on('click', function (e) {
            var current;
            if (baseManager.tab.tabs[baseManager.tab.current] && baseManager.tab.tabs[baseManager.tab.current].filterContainer.find('.floating-buttons .filters-button:visible').length) {
                if ($(e.target).parents('.floating-buttons').length || $(e.target).parents('.floating-filters').length) {
                    return;
                }
                if ($(e.target).parents('#content-area').length) {
                    current = baseManager.tab.tabs[baseManager.tab.current];
                    $('.btn-close', current.filterContainer).trigger('click');
                }
            }
        });
    }

    BaseManager.prototype.load = function () {
        var $contentOverlay, popup, popupMenu;
        if (/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(navigator.userAgent)) {
            $('body').addClass('mobile');
        }
        popupMenu = null;
        $(document).on('click', function (e) {
            var popupMenuOpened;
            if (!e.hasOwnProperty('originalEvent')) {
                return;
            }
            popupMenuOpened = $('.popup-menu.active');
            if (e.originalEvent.hasOwnProperty('namespace') && e.originalEvent.namespace === 'popup-menu') {
                if (popupMenu === null) {
                    popupMenu = popupMenuOpened;
                } else if (popupMenuOpened.length > 1) {
                    popupMenuOpened.filter(popupMenu).each(function () {
                        $(this).removeClass('active');
                        if ($(this).hasClass('popup-active-state')) {
                            $(this).closest('.popup-menu-state-handler').removeClass('popup-menu-active');
                        }
                    });
                    popupMenu = popupMenuOpened.not(popupMenu);
                }
            } else if (popupMenuOpened.length && (!$(e.target).closest(popupMenuOpened).length || e.originalEvent.hasOwnProperty('closePopupMenu'))) {
                popupMenuOpened.each(function () {
                    $(this).removeClass('active');
                    if ($(this).hasClass('popup-active-state')) {
                        $(this).closest('.popup-menu-state-handler').removeClass('popup-menu-active');
                    }
                });
                popupMenu = null;
            }
        });
        popup = null;
        $contentOverlay = $('#content-overlay');
        $(document).on('click', function (e) {
            var popupOpened;
            if (!e.hasOwnProperty('originalEvent')) {
                return;
            }
            popupOpened = $('.popup.active');
            if (e.originalEvent.hasOwnProperty('namespace') && e.originalEvent.namespace === 'popup') {
                if (popup === null) {
                    popup = popupOpened;
                    $contentOverlay.addClass('active');
                    if (popup.data('toggle')) {
                        $(popup.data('toggle')).addClass('active');
                    }
                } else if (popupOpened.length > 1) {
                    popupOpened.filter(popup).removeClass('active');
                    popup = popupOpened.not(popup);
                    if (popup.data('toggle')) {
                        $('.popup-toggle').removeClass('active').filter(popup.data('toggle')).addClass('active');
                    }
                } else if (popup.hasClass('active')) {
                    $contentOverlay.addClass('active');
                    if (popup.data('toggle')) {
                        $(popup.data('toggle')).addClass('active');
                    }
                } else {
                    popup = null;
                    $contentOverlay.removeClass('active');
                    $('.popup-toggle').removeClass('active');
                }
            } else if (popupOpened.length && (!$(e.target).closest(popupOpened).length || e.originalEvent.hasOwnProperty('closePopup'))) {
                popupOpened.removeClass('active');
                $contentOverlay.removeClass('active');
                $('.popup-toggle').removeClass('active');
                popup = null;
            }
            $contentOverlay.trigger('classChanged');
        });
        this.i18n();
        this.loadState();
    };

    BaseManager.prototype.uid = function () {
        return Math.floor((1 + Math.random()) * 0x100000000).toString(16).substring(1);
    };

    BaseManager.prototype.pushState = function () {
        this.state = {
            tab: this.tab.getState()
        };
        if (typeof Storage !== 'undefined') {
            localStorage.setItem('BaseManager', JSON.stringify(this.state));
        }
    };

    BaseManager.prototype.loadState = function () {
        var e, state;
        if (typeof Storage !== 'undefined' && (localStorage.BaseManager != null)) {
            state = JSON.parse(localStorage.BaseManager);
            if (state.tab != null) {
                try {
                    this.tab.update(state.tab);
                } catch (error1) {
                    e = error1;
                    console.error('loadState', e);
                }
            }
        }
    };

    BaseManager.prototype.i18n = function (lang, content, callback) {
        var base, datePickerLang;
        if (lang == null) {
            lang = null;
        }
        if (content == null) {
            content = null;
        }
        if (callback == null) {
            callback = null;
        }
        base = this;
        if (($.i18n != null) && $.i18n.lng()) {
            if (lang != null) {
                datePickerLang = lang.split('-')[0];
                if ($.fn.datepicker.dates[datePickerLang] !== void 0) {
                    $.fn.datepicker.defaults.language = datePickerLang;
                    $.fn.datepicker.dates[datePickerLang].format = base.format.date;
                }
                if (lang !== $('html').attr('lang')) {
                    $('html').attr('lang', lang);
                    if (lang !== $.i18n.lng()) {
                        $.i18n.setLng(lang, function () {
                            $('.hasDatePicker').each(function () {
                                var datepicker;
                                if ($(this).data('datepicker') != null) {
                                    datepicker = $(this).data('datepicker');
                                    datepicker.language = datepicker.o.language = datePickerLang;
                                    datepicker.picker.find('tr:nth(2)').remove();
                                    $(this).datepicker('fillDow');
                                    $(this).datepicker('update');
                                }
                            });
                            base.i18n(null, content, callback);
                        });
                    } else {
                        $('.hasDatePicker').each(function () {
                            var datepicker;
                            if ($(this).data('datepicker') != null) {
                                datepicker = $(this).data('datepicker');
                                datepicker.language = datepicker.o.language = datePickerLang;
                                datepicker.picker.find('tr:nth(2)').remove();
                                $(this).datepicker('fillDow');
                                $(this).datepicker('update');
                            }
                        });
                        base.i18n(null, content, callback);
                    }
                }
            } else {
                if (content != null) {
                    content.i18n();
                } else {
                    $('html').i18n();
                }
                if (callback != null) {
                    callback();
                }
            }
        } else {
            $.i18n.init(this.i18nInit, function () {
                base.i18n($.i18n.lng(), content, callback);
            });
        }
    };

    BaseManager.prototype.__ = function (stringKey, options, stringOnly) {
        var prop, ref, translated, value, variables;
        if (stringKey == null) {
            stringKey = null;
        }
        if (options == null) {
            options = null;
        }
        if (stringOnly == null) {
            stringOnly = false;
        }
        translated = stringKey;
        variables = {};
        if ((stringKey != null) && ($.i18n != null)) {
            if (options == null) {
                options = {};
            } else if (typeof options === 'string') {
                options = {
                    defaultValue: options
                };
            } else if (options.variables != null) {
                ref = options.variables;
                for (prop in ref) {
                    value = ref[prop];
                    options[prop] = value;
                }
                variables = options.variables;
                options.variables;
            }
            if (stringOnly) {
                translated = $.t(stringKey, options);
            } else {
                translated = {
                    key: stringKey,
                    text: $.t(stringKey, options),
                    variables: variables
                };
            }
        }
        return translated;
    };

    BaseManager.prototype.notify = function (text, type) {
        var notify;
        if (type == null) {
            type = 'success';
        }
        if (this.notifyContainer != null) {
            notify = this.notifyContainer;
            notify.find('.content').removeClass().addClass('content').addClass(type).text(this.__(text, text, true));
            notify.addClass('active');
            clearTimeout(this.notifyTimer);
            this.notifyTimer = setTimeout((function () {
                notify.removeClass('active');
            }), this.notifyTimeout * 1000);
        }
    };

    BaseManager.prototype.numberFormat = function (number, float, empty, thousands, decimals) {
        var _decimals, formatted, groups, negative;
        if (float == null) {
            float = true;
        }
        if (empty == null) {
            empty = false;
        }
        if (thousands == null) {
            thousands = false;
        }
        if (decimals == null) {
            decimals = 2;
        }
        if (typeof number === 'string') {
            number = parseFloat(number);
        }
        if (isNaN(number) || !isFinite(number) || number === null || number === '') {
            number = 0;
        }
        if (empty && !number) {
            return '';
        }
        negative = number < 0;
        number = Math.abs(number);
        formatted = '';
        if (float) {
            _decimals = (number % 1).toFixed(decimals);
            number = Math.floor(number);
            if (_decimals >= 1) {
                number++;
            }
            formatted = _decimals.substr(1, decimals + 1);
            if (this.format.number.indexOf(',') !== -1) {
                formatted = formatted.replace('.', ',');
            }
            number = Math.floor(number);
        } else {
            number = Math.round(number);
        }
        if (thousands) {
            groups = [];
            while ((number / 1000) > 0) {
                groups.unshift(('000' + (number % 1000)).substr(-3));
                number = Math.floor(number / 1000);
            }
            if (number || !groups.length) {
                groups.unshift(number);
            }
            if (this.format.number.indexOf(',') !== -1) {
                formatted = groups.join('.') + formatted;
            } else {
                formatted = groups.join(',') + formatted;
            }
            formatted = formatted.replace(/^0{1,2}([1-9]{1,2})/, '$1');
        } else {
            formatted = number + formatted;
        }
        if (negative) {
            formatted = '-' + formatted;
        }
        return formatted;
    };

    BaseManager.prototype.numberParse = function (number, float, format) {
        var realNumber;
        if (float == null) {
            float = true;
        }
        if (format == null) {
            format = this.format.number;
        }
        realNumber = 0 / 0;
        if (number.toString()) {
            if (this.format.number.indexOf(',') !== -1) {
                realNumber = parseFloat(number.toString().replace('.', '').replace(',', '.'));
            } else {
                realNumber = parseFloat(number.toString().replace(',', ''));
            }
        }
        return realNumber;
    };

    BaseManager.prototype.dateFormat = function (date, format, showTime) {
        if (typeof (date) == 'string')
            return date;
        var formats, regex;
        if (format == null) {
            format = this.format.date;
        }
        if (showTime == null) {
            showTime = false;
        }
        if ((date == null) || !date) {
            return '';
        }
        if (showTime) {
            format = format + ' H:i';
        }
        formats = {
            H: function (date) {
                return ("0" + (date.getUTCHours())).slice(-2);
            },
            i: function (date) {
                return ("0" + (date.getUTCMinutes())).slice(-2);
            },
            mm: function (date) {
                return ("0" + (date.getUTCMonth() + 1)).slice(-2);
            },
            dd: function (date) {
                return ("0" + (date.getDate())).slice(-2);
            },
            yyyy: function (date) {
                return date.getUTCFullYear();
            },
            yy: function (date) {
                return date.getUTCFullYear().toString().slice(-2);
            }
        };
        regex = new RegExp(Object.keys(formats).join("|"), "g");
        return format.replace(regex, function (matched) {
            return formats[matched](date);
        });
    };

    BaseManager.prototype.dateParse = function (dateString, format, time, isUTC) {
        var date, i, j, ref;
        if (format == null) {
            format = this.format.date;
        }
        if (time == null) {
            time = false;
        }
        if (isUTC == null) {
            isUTC = true;
        }
        if (!dateString) {
            return null;
        }
        if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.*)?/i)) {
            dateString = new Date(Date.parse(dateString));
        }
        if (dateString instanceof Date) {
            if (isUTC) {
                return dateString;
            } else {
                return new Date(Date.UTC(dateString.getFullYear(), dateString.getMonth(), dateString.getDate(), (time ? dateString.getHours() : 0), (time ? dateString.getMinutes() : 0), (time ? dateString.getSeconds() : 0)));
            }
        }
        format = format.replace(/y/g, 'yy');
        date = {
            d: '',
            m: '',
            y: ''
        };
        for (i = j = 0, ref = format.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            if (dateString.length) {
                if (date[format[i]] != null) {
                    date[format[i]] += dateString[0];
                }
                if ((date[format[i]] != null) || !dateString[0].match(/[0-9]/)) {
                    dateString = dateString.slice(1);
                }
            }
        }
        if (date.d) {
            date.d = parseInt(date.d);
        } else {
            date.d = 1;
        }
        if (date.m) {
            date.m = parseInt(date.m) - 1;
        } else {
            date.m = 1;
        }
        if (date.y) {
            if (date.y.length < 4) {
                date.y = (new Date().getFullYear()).toString().slice(0, 4 - date.y.length) + date.y;
            }
            date.y = parseInt(date.y);
        } else {
            date.y = new Date().getFullYear();
        }
        if (isUTC) {
            return new Date(date.y, date.m, date.d);
        } else {
            return new Date(Date.UTC(date.y, date.m, date.d));
        }
    };

    BaseManager.prototype.serverError = function (response) {
        if (typeof response === 'string' && response.indexOf('The requested URL was rejected.') !== -1) {
            return this.modal.open({
                id: 'block_server',
                inner: true,
                width: 350,
                attrs: {
                    style: 'z-index: 1111;'
                },
                title: this.__('ErrorError', 'Error'),
                content: $('<span />').text(this.__('FieldErrorServerBlock', 'An error has occurred, contact support for service.', true)).append($('<div />').text(response.split('<br><br>')[1])),
                cancel: {
                    header: true
                }
            });
        }
    };

    return BaseManager;

})();

Form = (function () {
    Form["default"] = {
        datePickerOptions: {
            format: 'dd/mm/yyyy',
            noDayFormat: 'mm/yyyy',
            timeFormat: 'HH:mm:ss',
            showOnFocus: false,
            autoclose: true,
            keyboardNavigation: false,
            forceParse: false,
            todayHighlight: true,
            clearBtn: true
        },
        loadLength: 50,
        bindsSimpleSelectors: true,
        autoSave: false,
        autoSaveTimer: 10000,
        readOnly: false,
        selectAutoChoose: true
    };

    function Form(options) {
        var prop, ref, value;
        if (options == null) {
            options = null;
        }
        this.parent = null;
        this.modal = null;
        this.content = null;
        this.container = null;
        this.callbacks = {};
        this.data = {};
        this.sendData = {};
        this.load = null;
        this.edit = {};
        this.valid = {};
        this._ajax = null;
        this.toAutoSave = true;
        this.loaddata = {};
        ref = this.constructor["default"];
        for (prop in ref) {
            value = ref[prop];
            this[prop] = JSON.parse(JSON.stringify(value));
        }
        if (options != null) {
            this.init(options);
        }
    }

    Form.prototype.loadEdit = function () {
        var form;
        form = this;
        if (this._ajax == null) {
            this._ajax = $.ajax({
                url: this.edit.load,
                data: JSON.stringify({ 'infoData': this.edit.data }),
                type: 'post',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    try {
                        response = JSON.parse(response);
                    } catch (e) {
                        response = response.d;
                    }
                    var elm, formattedData, i, j, len, name, obj, prop, ref, val, value;
                    BaseManager.serverError(response);
                    form._ajax = null;
                    formattedData = {};
                    if (response.data != null) {
                        ref = JSON.parse(response.data)[0];
                        for (name in ref) {
                            elm = ref[name];
                            if (Array.isArray(elm)) {
                                for (i = j = 0, len = elm.length; j < len; i = ++j) {
                                    obj = elm[i];
                                    for (prop in obj) {
                                        val = obj[prop];
                                        if (!Array.isArray(formattedData[name + "[" + prop + "]"])) {
                                            formattedData[name + "[" + prop + "]"] = new Array(elm.length);
                                        }
                                        formattedData[name + "[" + prop + "]"][i] = val;
                                    }
                                }
                            } else {
                                formattedData[name] = elm;
                            }
                        }
                        if ((form.modal != null) && (form.modal.form != null) && (form.modal.form.sendData != null)) {
                            form.modal.form.sendData = formattedData;
                        } else {
                            form.sendData = formattedData;
                        }
                    }
                    if ((form.callbacks != null) && (form.callbacks.onLoad != null)) {
                        form.callbacks.onLoad(form);
                    }
                    if (form.edit.multiple !== void 0 && form.edit.multiple) {
                        for (name in formattedData) {
                            value = formattedData[name];
                            if (Array.isArray(value)) {
                                for (i in value) {
                                    obj = value[i];
                                    if ((obj == null) || typeof obj === 'string') {
                                        if (!Array.isArray(form.sendData["multiple[" + name + "]"])) {
                                            form.sendData["multiple[" + name + "]"] = new Array(value.length);
                                        }
                                        form.sendData["multiple[" + name + "]"][i] = obj != null ? 'on' : null;
                                    } else {
                                        for (prop in obj) {
                                            val = obj[prop];
                                            if (!Array.isArray(form.sendData["multiple[" + name + "][" + prop + "]"])) {
                                                form.sendData["multiple[" + name + "][" + prop + "]"] = new Array(value.length);
                                            }
                                            form.sendData["multiple[" + name + "][" + prop + "]"][i] = val != null ? 'on' : null;
                                        }
                                    }
                                }
                            } else if (value != null) {
                                form.sendData["multiple[" + name + "]"] = 'on';
                            }
                        }
                        form.sendData.multiple = form.edit.data;
                    }
                    form.modal.loading = false;
                    form.edit.data = null;
                    if ((form.modal != null) && (form.parent != null) && (form.parent.parent != null) && (form.parent.parent.modal != null)) {
                        if (response.success) {
                            form.parent.open(form.modal, true);
                        } else {
                            form.parent.parent.modal.close(form.modal.id, false, true);
                            if ((form.tabId != null) && (form.elementId != null)) {
                                form.parent.parent.tab.updateElement(form.tabId, form.elementId, response.data);
                            }
                        }
                        if (response.messages.length && (form.parent.parent != null)) {
                            form.parent.parent.notify(response.messages[0].message, response.messages[0].type);
                        }
                    }
                }
            });
        }
    };

    Form.prototype.parseValue = function (val) {
        var value;
        if (typeof val === 'string') {
            if (val.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.*)?/i)) {
                value = new Date(Date.parse(val));
            } else {
                value = val;
            }
        } else {
            value = val;
        }
        return value;
    };

    Form.prototype.init = function (options) {
        var i, j, key, len, prop, ref, ref1, ref2, ref3, value;
        for (i in options) {
            if (i !== 'parent' && i !== 'modal') {
                if (i !== 'sendData') {
                    this[i] = options[i];
                } else {
                    this[i] = JSON.parse(JSON.stringify(options[i]));
                }
            }
        }
        if (this.content != null) {
            this.syncData(this.content, this.data, false);
            ref = this.data;
            for (prop in ref) {
                value = ref[prop];
                if (Array.isArray(value)) {
                    this.data[prop] = [];
                }
            }
            ref1 = this.data;
            for (prop in ref1) {
                value = ref1[prop];
                if (!(prop in this.sendData)) {
                    this.sendData[prop] = JSON.parse(JSON.stringify(value));
                }
            }
            if (this.modal != null) {
                this.modal.loading = false;
                this.modal.form.data = this.data;
                ref2 = Object.keys(this.data);
                for (j = 0, len = ref2.length; j < len; j++) {
                    key = ref2[j];
                    this.loaddata[key] = this.data[key];
                }
            }
            if (this.edit.data != null) {
                if (this._ajax == null) {
                    this.loadEdit();
                }
                if (this.modal != null) {
                    this.modal.loading = true;
                    if (this.edit.modal != null) {
                        ref3 = this.edit.modal;
                        for (prop in ref3) {
                            value = ref3[prop];
                            this.modal[prop] = value;
                        }
                    }
                }
            } else {
                if (this.content instanceof $) {
                    this.content = this.content.get(0).outerHTML;
                }
                this.content = $(this.content);
                if (!this.content.is('form')) {
                    this.content = $('<form />').html(this.content);
                }
                this.content.attr('autocomplete', 'false');
            }
        } else if (this.modal != null) {
            this.modal.loading = true;
        }
    };

    Form.prototype.getCsrfToken = function () {
        var c, ca, i, nameEQ;
        nameEQ = "csrftoken=";
        ca = document.cookie.split(";");
        i = 0;
        while (i < ca.length) {
            c = ca[i];
            while (c.charAt(0) === " ") {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length).replace(/"/g, '');
            }
            i++;
        }
        return ca;
    };

    Form.prototype.nextJump = function (elements, element, back) {
        var checkElm, focused, form, next;
        if (element == null) {
            element = null;
        }
        if (back == null) {
            back = false;
        }
        form = this;
        elements = elements.not('.no-focus').not('[readonly]');
        checkElm = function (node) {
            var $node;
            $node = $(node);
            return !$node.is(':disabled') && $node.attr('type') !== 'hidden' && (($node.hasClass('input') && ($node.is(':visible') || ($node.hasClass('summernote') && $node.next().is(':visible'))) || $node.hasClass('select') && $node.next().is(':visible')) || ($node.closest('.spoiler-content').length && !$node.closest('.spoiler-content').is(':visible') && $(".spoiler-header[data-spoiler='" + ($node.closest('.spoiler-content').attr('id')) + "']", form.container).is(':visible')));
        };
        if (element == null) {
            next = elements.filter(function (index, elm) {
                return checkElm(elm);
            });
            if (back) {
                return next.last();
            } else {
                return next.first();
            }
        }
        if (back) {
            focused = true;
            next = elements.filter(function (index, elm) {
                if (focused && elm !== element.get(0) && checkElm(elm)) {
                    return true;
                }
                if (elm === element.get(0)) {
                    focused = false;
                }
                return false;
            });
            next = next.last();
        } else {
            focused = false;
            next = elements.filter(function (index, elm) {
                if (elm !== element.get(0) && !checkElm(elm)) {
                    return false;
                }
                if (!focused && elm === element.get(0)) {
                    focused = true;
                } else if (focused) {
                    return true;
                }
                return false;
            });
            next = next.first();
        }
        return next;
    };

    Form.prototype.bind = function (container, clone) {
        var form, sign;
        if (container == null) {
            container = this.container;
        }
        if (clone == null) {
            clone = false;
        }
        form = this;
        sign = '.';
        if ((typeof global !== "undefined" && global !== null) && (global.format != null) && (global.format.number != null) && global.format.number.indexOf(',') !== -1) {
            sign = ',';
        }
        container.find('.select').each(function () {
            if (($(this).closest('.ignore-inputs').length)) {
                return;
            }
            if (!$(this).hasClass('hasSelect')) {
                $(this).data('select', new Select(this, form));
            }
        });
        container.find('.input').each(function () {
            if (($(this).closest('.ignore-inputs').length)) {
                return;
            }
            if (!$(this).hasClass('hasInput')) {
                $(this).data('input', new Input(this, form));
            }
        });
        container.find('.select, .input').on('change.form', function () {
            var element;
            element = $(this);
            form.clearError(element);
            form.parent.setEdited(form.modal.id, true);
        });
        container.find('.select + .select-container > .select-input, .input').on('focus.form', function () {
            var element, input;
            input = $(this);
            element = input;
            if (input.hasClass('select-container')) {
                element = input.parent().prev('.select');
            }
            if (!element.hasClass('no-select') && !input.is('[readonly]') && !input.is('[disabled]')) {
                if (element.hasClass('summernote')) {
                    element.next('.note-editor').find('.note-editable').focus();
                    return;
                } else if (element.hasClass('select')) {
                    if (!element.hasClass('select-suggest')) {
                        return;
                    }
                }
                input.select();
            }
        });
        container.find('.select + .select-container > .select-input').on('mousedown.form', function () {
            if (!$(this).hasClass('focus')) {
                form._mouseFocus = true;
            }
        });
        container.find('.select + .select-container > .select-input').on('mouseup.form', function () {
            var element, input, ref;
            input = $(this);
            element = input;
            if (input.hasClass('select-input')) {
                element = input.parent().prev('.select');
            }
            if ((form._mouseFocus != null) && form._mouseFocus && !element.hasClass('no-select') && !input.is('[readonly]') && !input.is('[disabled]') && ((ref = input.attr('type')) !== 'checkbox' && ref !== 'radio')) {
                form._mouseFocus = false;
                setTimeout(function () {
                    if (input.get(0).selectionStart !== input.get(0).selectionEnd) {
                        input.select();
                    }
                }, 0);
            }
        });
        container.find('.select + .select-container > .select-input, .input').on('keydown.form', function (e) {
            var element, elements, next, ref;
            if ((ref = e.keyCode) === 13 || ref === 9) {
                element = $(this);
                if (element.hasClass('select-input')) {
                    element = element.parent().prev();
                }
                if (element.hasClass('skip-jump')) {
                    element.removeClass('skip-jump');
                    return;
                }
                if (e.keyCode === 13 && element.hasClass('textarea')) {
                    return;
                }
                e.preventDefault();
                if (element.hasClass('jump-to') && (element.data('jump-to') != null)) {
                    next = element.data('jump-to');
                } else {
                    elements = form.container.find('.select, .input');
                    if ((form.modal != null) && (form.modal.container != null) && form.modal.container.find('.modal-header .header-input').length) {
                        elements = elements.add(form.modal.container.find('.modal-header .header-input').find('.select, .input'));
                    }
                    next = form.nextJump(elements, element, e.shiftKey);
                }
                if (next.length) {
                    if (element.hasClass('default') && element.data('default') && (element.val() === '' || (element.val() == null))) {
                        element.val(element.data('default'));
                        element.trigger('change');
                    }
                    if ((!next.is(':visible') || (next.hasClass('summernote') || next.hasClass('select')) && !next.next().is(':visible')) && next.closest('.spoiler-content').length && !next.closest('.spoiler-content').is(':visible')) {
                        $(".spoiler-header[data-spoiler='" + (next.closest('.spoiler-content').attr('id')) + "']", form.container).trigger('click');
                    }
                    next.focus();
                } else {
                    element.blur();
                    if (form.modal != null) {
                        if (form.modal.container.find('.btn-ok-plus:not(.hide)').length) {
                            form.modal.container.find('.btn-ok-plus').focus();
                        } else if (form.modal.container.find('.btn-ok:not(.hide)').length) {
                            form.modal.container.find('.btn-ok').focus();
                        } else {
                            form.modal.container.find('.btn-cancel').focus();
                        }
                    } else {
                        form.submit();
                    }
                }
            }
        });
        container.find('.select + .select-container > .select-input, .input').on('keyup.form', function (e) {
            var char, element;
            element = $(this);
            char = String.fromCharCode(e.which);
            sign = '.';
            if ((typeof global !== "undefined" && global !== null) && (global.format != null) && (global.format.number != null) && global.format.number.indexOf(',') !== -1) {
                sign = ',';
            }
            if (element.hasClass('select-input')) {
                element = element.parent().prev();
            }
            return;
            if (element.hasClass('length') && element.data('length') && element.hasClass('auto-jump') && $(this).val().length === element.data('length') + (element.hasClass('number') && !element.hasClass('integer') && ($(this).val().indexOf(sign) !== -1 || char === sign ? 3 : 0))) {
                $(this).trigger($.Event('keydown', {
                    keyCode: 13,
                    which: 13
                }));
                return false;
            }
        });
        container.find('.select + .select-container > .select-input, .input').on('keypress.form', function (e) {
            var char, element;
            if (!e.which || e.ctrlKey || e.metaKey || e.altKey || e.keyCode === 8) {
                return;
            }
            element = $(this);
            char = String.fromCharCode(e.which);
            if (element.hasClass('select-input')) {
                element = element.parent().prev();
            }
            if (element.hasClass('length') && element.data('length') && (element.val().length >= element.data('length') + (element.hasClass('number') && !element.hasClass('integer') && (element.val().indexOf(sign) !== -1 || char === sign ? 3 : 0)) && element.get(0).selectionStart === element.get(0).selectionEnd)) {
                return false;
            }
        });
        container.find('.select + .select-container > .select-input, .input').on('input.form', function (e) {
            var char, element, floatLength, group, input, inputVal;
            input = $(this);
            inputVal = input.val();
            char = String.fromCharCode(e.which);
            if (input.hasClass('select-input')) {
                element = input.parent().prev();
            } else {
                element = input;
            }
            floatLength = element.hasClass('number') && !element.hasClass('integer') && inputVal.indexOf(sign) !== -1 || char === sign ? 3 : 0;
            if (element.data('length') && inputVal.length > element.data('length') + floatLength) {
                input.val(inputVal.slice(0, element.data('length') + floatLength));
                input.trigger('change');
            }
            if (element.closest('.clone.clone-add').length) {
                element.closest('.clone.clone-add').removeClass('clone-add');
                if (element.closest('[data-clone-group]').length) {
                    group = "[data-clone-group='" + (element.closest('[data-clone-group]').data('clone-group')) + "']";
                } else {
                    group = '';
                }
                clone = form.clone(group + " .cloneable").addClass('clone-add');
                element.closest('.clone').after(clone);
            }
        });
        container.on('click', '.spoiler-header', function () {
            var spoilerContainer, spoilerScroll, toggleCallback;
            spoilerScroll = $(this).data('scroll-bottom');
            spoilerContainer = $('#' + $(this).data('spoiler'), container);
            toggleCallback = void 0;
            if (form.parent !== void 0 && form.modal !== void 0) {
                toggleCallback = {
                    complete: function () {
                        if (form.parent !== void 0) {
                            form.parent.resizeModal(form.modal.id, true, spoilerScroll);
                        }
                    }
                };
            }
            if (spoilerContainer.is(':visible')) {
                $(this).removeClass('active');
                spoilerContainer.slideUp(toggleCallback);
            } else {
                $(this).addClass('active');
                spoilerContainer.slideDown(toggleCallback);
            }
        });
        if (this.readOnly) {
            container.find('input').attr('disabled', 'disabled');
            container.find('select').each(function (index, elm) {
                return $(elm).data('select').disabled(true);
            });
            container.find('.clone a.remove').attr('disabled', 'disabled');
            if (this.modal != null) {
                this.modal.ok.header = false;
                this.modal.ok.footer = false;
            }
        } else {
            if (this.autoSave && (this.autoSaver == null)) {
                form = this;
                this.autoSaver = setInterval(function () {
                    if (form.toAutoSave) {
                        return form.submit(form.autoSave);
                    }
                }, this.autoSaveTimer);
            }
            if (container.is('form')) {
                container.submit(function () {
                    form.submit();
                    return false;
                });
            }
            if (!clone && (form.callbacks != null) && (form.callbacks.selectors != null)) {
                this.userBinds(container);
            }
        }
    };

    Form.prototype.userBinds = function (container) {
        var callbacks, event, fn, form, func, ref, ref1, selector;
        if (container == null) {
            container = form.container;
        }
        form = this;
        ref = this.callbacks.selectors;
        for (selector in ref) {
            callbacks = ref[selector];
            if (this.bindsSimpleSelectors && ((ref1 = selector[0]) !== '*' && ref1 !== ':' && ref1 !== '[' && ref1 !== '.' && ref1 !== '#')) {
                selector = "[name='" + selector + "']";
            }
            fn = function (event, func) {
                var callback;
                callback = func;
                $(container).on(event + ".form.user", selector, function (e) {
                    var cb, cursor, element;
                    cb = callback(form, e);
                    element = $(e.target);
                    if (event === 'change' && element.data('parent-clones')) {
                        form.validate(element);
                    }
                    if ($(this).hasClass('hasInput') && typeof cb === 'string') {
                        $(this).data('input').onInputChanged = true;
                        cursor = this.selectionStart - (this.value.length - cb.length);
                        this.value = cb;
                        this.setSelectionRange(cursor, cursor);
                    } else {
                        return cb;
                    }
                });
            };
            for (event in callbacks) {
                func = callbacks[event];
                fn(event, func);
            }
        }
    };

    Form.prototype.after = function () {
        var container;
        if (this.container != null) {
            container = this.container;
            if (this.container.find('.in-header-input').length && (this.modal != null) && (this.modal.container != null)) {
                this.modal.container.find('.modal-header .modal-bar').append($('<div />').addClass('header-input').html(this.container.find('.in-header-input')));
                container = container.add(this.modal.container.find('.modal-header .header-input'));
            }
            if (container.find('.auto-focus').length) {
                setTimeout(function () {
                    return container.find('.auto-focus').first().focus();
                }, 0);
            } else {
                setTimeout(function () {
                    return container.find('.select, .input').not('.no-focus').first().focus();
                }, 0);
            }
            if (this.callbacks.after != null) {
                this.callbacks.after(this);
            }
        }
    };

    Form.prototype.syncData = function (container, sendData, write, read, skipMultiple) {
        var clone, cloneAdd, cloneable, clones, decimals, element, elementClass, elements, form, formContainer, getValue, i, j, k, len, name, option, ref, selector, val, value;
        if (container == null) {
            container = this.container;
        }
        if (sendData == null) {
            sendData = this.sendData;
        }
        if (write == null) {
            write = true;
        }
        if (read == null) {
            read = true;
        }
        if (skipMultiple == null) {
            skipMultiple = false;
        }
        form = this;
        formContainer = this.container;
        if (read) {
            getValue = function (input) {
                if (input.hasClass('file') && input.hasClass('image')) {
                    return input.data('src');
                } else if (input.hasClass('select')) {
                    return input.children('[selected]').val();
                } else {
                    return input.val();
                }
            };
            selector = '.select, .input';
            if (skipMultiple) {
                selector = '.select, .input:not([name*="[]"]), .cloneable .input';
            }
            container.find(selector).each(function () {
                var input, name;
                input = $(this);
                if (input.attr('name')) {
                    name = input.attr('name').replace(/\[\]/, '');
                    if (input.attr('name') !== name) {
                        form.set(input.attr('name'), getValue(input), input, false, sendData, formContainer);
                    } else {
                        form.set(input.attr('name'), getValue(input), input, false, sendData, container);
                    }
                }
            });
        }
        if (write) {
            for (name in sendData) {
                value = sendData[name];
                if (Array.isArray(value)) {
                    name = name + "[]";
                    if (container.find("[name='" + name + "']").length) {
                        cloneable = container.find("[name='" + name + "']");
                    } else if (container.find("[data-replace='" + name + "']").length) {
                        cloneable = container.find("[data-replace='" + name + "']");
                    } else {
                        continue;
                    }
                    cloneable = cloneable.closest('.cloneable');
                    clones = Array.prototype.reverse.call(cloneable.prevAll('.clone').not('.clone-add'));
                    cloneAdd = Array.prototype.reverse.call(cloneable.prevAll('.clone-add'));
                    if (!cloneAdd.length) {
                        cloneAdd = cloneable;
                    }
                    if (clones.length < value.length) {
                        for (i = j = 0, ref = value.length - clones.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
                            if (this.content.find("[name='" + name + "']").closest('.cloneable').closest("[data-clone-group]").length) {
                                selector = this.content.find("[name='" + name + "']").closest('.cloneable').closest("[data-clone-group]").data('clone-group');
                                selector = "[data-clone-group='" + selector + "'] .cloneable";
                            } else {
                                selector = '.cloneable';
                            }
                            clone = this.clone(selector, {}, {
                                $: clones.length + 1
                            }, true, skipMultiple);
                            cloneAdd.before(clone);
                            clones = Array.prototype.reverse.call(cloneable.prevAll('.clone').not('.clone-add'));
                        }
                    }
                    elements = clones;
                } else {
                    elements = container;
                    value = [value];
                }
                for (i = k = 0, len = value.length; k < len; i = ++k) {
                    val = value[i];
                    element = elements.eq(i).find("[name='" + name + "']");
                    if (element.length) {
                        if (element.hasClass('select')) {
                            if (element.hasClass('select-load') && !element.find("option[value='" + val + "']").length && element.data('text') && val !== '') {
                                option = $('<option />');
                                option.val(val);
                                if (sendData[element.data('text')] != null) {
                                    if (Array.isArray(sendData[element.data('text')])) {
                                        option.text(sendData[element.data('text')][i]);
                                    } else {
                                        option.text(sendData[element.data('text')]);
                                    }
                                } else {
                                    option.text(val);
                                }
                                element.html(option);
                            }
                            element.find('option').removeAttr('selected');
                            element.val(val);
                            element.find('option:selected').attr('selected', 'selected');
                            if (element.data('select')) {
                                element.data('select').set(val, element.find('option').filter('[selected]').text(), element.find('option').filter('[selected]').data('data'), false);
                            }
                        } else if (element.hasClass('date-picker') && (form.parent != null) && (form.parent.parent != null)) {
                            if (element.hasClass('no-day')) {
                                element.val(form.parent.parent.dateFormat(form.parseValue(val), form.datePickerOptions.noDayFormat));
                            } else {
                                element.val(form.parent.parent.dateFormat(form.parseValue(val), form.datePickerOptions.format));
                            }
                        } else if (element.hasClass('color-picker')) {
                            element.val(val).trigger('change');
                        } else if (element.hasClass('file')) {
                            if (element.hasClass('image') && val) {
                                element.data('src', val);
                                element.closest('.drop-zone').children('.preview').attr('src', val);
                            }
                        } else if (element.hasClass('checkbox')) {
                            if (!!val && val !='off') {
                                element.prop('checked', true);
                            } else {
                                element.prop('checked', false);
                            }
                        } else if (element.hasClass('radio')) {
                            if (val && element.val() === val) {
                                element.prop('checked', true);
                            } else {
                                element.prop('checked', false);
                            }
                        } else if (element.hasClass('number')) {
                            if ((form.parent != null) && (form.parent.parent != null)) {
                                decimals = void 0;
                                if (element.hasClass('float') && (element.data('decimals') != null)) {
                                    decimals = parseInt(element.data('decimals'));
                                }
                                element.val(form.parent.parent.numberFormat(val, !element.hasClass('integer'), element.hasClass('empty') || element.hasClass('no-zero'), void 0, decimals));
                            } else {
                                element.val(val);
                            }
                            element.toggleClass('negative', val < 0);
                        } else if (element.is('img')) {
                            element.attr('src', val);
                        } else {
                            element.val(val);
                        }
                    } else {
                        element = elements.eq(i).find("[data-replace='" + name + "']");
                        if (element.length) {
                            elementClass = '';
                            if (element.hasClass('float') && (form.parent != null) && (form.parent.parent != null)) {
                                decimals = void 0;
                                if (element.data('decimals') != null) {
                                    decimals = parseInt(element.data('decimals'));
                                }
                                if (val < 0) {
                                    elementClass = 'negative';
                                }
                                val = form.parent.parent.numberFormat(val, true, true, void 0, decimals);
                            }
                            element.text(val).removeAttr('data-replace').addClass(elementClass);
                        }
                    }
                }
            }
        }
    };

    Form.prototype.set = function (name, value, element, remove, sendData, container, userChange) {
        var checked, elements, i, index, j, k, length, multiple, parseDate, radioElements, ref, ref1, ref2, ref3, text, textName;
        if (element == null) {
            element = null;
        }
        if (remove == null) {
            remove = false;
        }
        if (sendData == null) {
            sendData = this.sendData;
        }
        if (container == null) {
            container = this.container;
        }
        if (userChange == null) {
            userChange = false;
        }
        index = null;
        length = 0;
        elements = $("[name='" + name + "']", container);
        if (name.indexOf('[]') !== -1) {
            name = name.replace(/\[\]/, '');
            index = elements.index(element);
            length = elements.length;
        }
        if (element != null) {
            if (element.hasClass('validate')) {
                this.validate(element, remove);
            }
            if (element.hasClass('checkbox')) {
                if (!value) {
                    value = 'on';
                }
                if (!element.is(':checked')) {
                    value = 'off';//remove = true;
                }
            } else if (element.hasClass('radio')) {
                if ((container != null) && (element != null)) {
                    radioElements = container.find("[name='" + name + "']");
                    if (element.is(':checked')) {
                        radioElements.not(element).prop('checked', false);
                    } else {
                        checked = radioElements.find(':checked').first();
                        if (checked.length) {
                            value = checked.val();
                        } else {
                            value = null;
                            remove = true;
                        }
                    }
                }
            } else if (element.hasClass('file')) {
                if (typeof value === 'undefined') {
                    value = null;
                }
            } else if (element.hasClass('date-picker')) {
                if ((this.parent != null) && (this.parent.parent != null)) {
                    if (element.hasClass('no-day')) {
                        parseDate = this.parent.parent.dateParse(value, this.datePickerOptions.noDayFormat, false, false);
                    } else {
                        parseDate = this.parent.parent.dateParse(value, this.datePickerOptions.format, false, false);
                    }
                } else {
                    parseDate = null;
                }
                value = parseDate;
            } else if (element.hasClass('select')) {
                text = null;
                textName = null;
                if (value === '') {
                    value = null;
                }
                if (element.val() === value && element.find('option').filter('[selected]').length) {
                    text = element.find('option').filter('[selected]').text();
                }
                if (!element.find('option').filter('[selected]').length) {
                    if (element.find('option').filter("[value='']").length) {
                        value = '';
                        text = element.find('option').filter("[value='']").text();
                    } else {
                        value = null;
                    }
                }
                if ((element.data('text') != null) && (sendData[element.data('text')] != null)) {
                    textName = element.data('text');
                }
            } else if (element.hasClass('number')) {
                if (element.hasClass('integer')) {
                    value = parseInt(value);
                } else {
                    if (typeof value === 'string' && value.indexOf(',') !== -1) {
                        value = value.replace(',', '.');
                    }
                    value = parseFloat(value);
                }
                if (isNaN(value) || !isFinite(value)) {
                    value = null;
                }
            }
        }
        if (index != null) {
            if (!Array.isArray(sendData[name])) {
                sendData[name] = new Array(length);
            } else if (sendData[name].length < length) {
                for (i = j = ref = sendData[name].length, ref1 = length; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
                    sendData[name].push('');
                }
            } else if (sendData[name].length > length) {
                for (i = k = ref2 = length, ref3 = sendData[name].length; ref2 <= ref3 ? k < ref3 : k > ref3; i = ref2 <= ref3 ? ++k : --k) {
                    sendData[name].pop;
                }
            }
            if (index === -1) {
                return;
            }
            if (sendData[name].length > index) {
                sendData[name][index] = value;
            } else {
                sendData[name].push(value);
            }
            if (remove) {
                sendData[name].splice(index, 1);
            }
        } else {
            sendData[name] = value;
            if (textName != null) {
                sendData[textName] = text;
            }
            if (remove) {
                delete sendData[name];
            }
        }
        if (userChange && (sendData.multiple != null)) {
            if (index != null) {
                multiple = container.find("[name='multiple[" + name + "][]']").eq(index);
            } else {
                multiple = container.find("[name='multiple[" + name + "]']");
            }
            if (multiple.length) {
                multiple.prop('checked', true).trigger('change');
            }
        }
    };

    Form.prototype.validate = function (element, remove) {
        var elements, elm, i, j, len, name, selector, val, valid;
        if (remove == null) {
            remove = false;
        }
        if (element.attr('name') == null) {
            return;
        } else {
            name = element.attr('name');
        }
        if (name.indexOf('[]') !== -1) {
            if (element.closest('[data-clone-group]').length) {
                selector = "[data-clone-group='" + (element.closest('[data-clone-group]').data('clone-group')) + "'] .clone [name='" + name + "']";
            } else {
                selector = ".clone [name='" + name + "']";
            }
            elements = $(selector, this.container);
        } else {
            elements = element;
        }
        if (remove) {
            elements = elements.not(element);
        }
        if (name.indexOf('[]') !== -1) {
            this.valid[name.slice(0, -2)] = [];
        } else {
            this.valid[name] = false;
        }
        for (i = j = 0, len = elements.length; j < len; i = ++j) {
            val = elements[i];
            elm = elements.eq(i);
            valid = true;
            if (elm.attr('required')) {
                if (elm.data('parent-clones')) {
                    if (!elm.closest(elm.data('parent-clones')).find('.clone').length) {
                        valid = false;
                    }
                } else {
                    if (elm.val() === '') {
                        valid = false;
                    }
                }
            }
            if (name.indexOf('[]') !== -1) {
                this.valid[name.slice(0, -2)].push(valid);
            } else {
                this.valid[name] = valid;
            }
        }
    };

    Form.prototype.isValid = function (show) {
        var container, element, error, j, len, name, prop, ref, ref1, v, val, valid, value;
        if (show == null) {
            show = false;
        }
        valid = true;
        ref = this.valid;
        for (prop in ref) {
            value = ref[prop];
            if (value instanceof Array) {
                if (!value.length) {
                    valid = false;
                    continue;
                }
                for (j = 0, len = value.length; j < len; j++) {
                    val = value[j];
                    if (!val) {
                        valid = false;
                        continue;
                    }
                }
            } else if (!value) {
                valid = false;
                continue;
            }
        }
        if (show && !valid) {
            container = this.container;
            if ((this.modal != null) && (this.modal.container != null) && this.modal.container.find('.header-input').length) {
                container = container.add(this.modal.container);
            }
            ref1 = this.valid;
            for (name in ref1) {
                v = ref1[name];
                element = $("[name='" + name + "']", container);
                if (!v && element.attr('required')) {
                    error = 'This field is required';
                    if ((this.parent != null) && (this.parent.parent != null)) {
                        error = this.parent.parent.__('FieldErrorRequired', null, true);
                    }
                    if (element.hasClass('notify-error')) {
                        this.parent.parent.notify(element.data('notify'), 'danger');
                    }
                    this.addError(element, error);
                }
            }
        }
        return valid;
    };

    Form.prototype.submit = function (autosave, keepModalOpen) {
        var ajax, form, sendData;
        if (autosave == null) {
            autosave = false;
        }
        if (keepModalOpen == null) {
            keepModalOpen = false;
        }
        form = this;
        if ((this.callbacks != null) && (this.callbacks.submit != null)) {
            this.callbacks.submit(this);
        } else if (this._ajax == null) {
            if ((form.parent != null) && (form.modal != null) && !autosave) {
                form.parent.lock(form.modal.id, true);
            }
            sendData = $.extend(true, {}, this.sendData);
            sendData = this.sanitize(sendData);
            if ((this.callbacks != null) && (this.callbacks.onSend != null)) {
                this.callbacks.onSend(this, sendData, autosave);
            }
            ajax = {
                url: this.container.attr('action'),
                type: this.container.attr('method'),
                data: JSON.stringify({ 'saveData': sendData }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    try {
                        response = JSON.parse(response.d);
                    } catch (e) {
                        response = response.d;
                    }
                    var base, data, i, j, k, key, l, len, len1, len2, ref, ref1, ref2, skipSyncOnEdit, tab, tabObj;
                    BaseManager.serverError(response);
                    if ((form.parent != null) && (form.modal != null)) {
                        form.parent.lock(form.modal.id, false);
                        if (response.success) {
                            if (!autosave && !keepModalOpen) {
                                form.parent.close(form.modal.id);
                            }
                            if ((form.parent.parent != null) && response.data) {
                                base = form.parent.parent;
                                if (form.tabId != null) {
                                    ref = base.tab.tabs;
                                    for (i = j = 0, len = ref.length; j < len; i = ++j) {
                                        tab = ref[i];
                                        if (tab.id === form.tabId) {
                                            tabObj = base.tab.tabs[i];
                                            if (Array.isArray(response.data)) {
                                                ref1 = response.data;
                                                for (k = 0, len1 = ref1.length; k < len1; k++) {
                                                    data = ref1[k];
                                                    base.tab.updateTabs(tabObj, data, form.stopUpdate);
                                                }
                                            } else {
                                                base.tab.updateTabs(tabObj, response.data, form.stopUpdate);
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!response.success) {
                        if ((response.errors != null) && !autosave) {
                            try {
                                response.errors = JSON.parse(response.errors);
                            } catch (e) {
                                response.errors = response.errors_list;
                            }
                            form.errors(response.errors);
                        }
                        if (form.callbacks.onError != null) {
                            form.callbacks.onError(form, response, autosave);
                        }
                    } else {
                        Object.keys(form.valid).map(function (key) {
                            var elm, l, ref2, results, valid;
                            elm = form.container.find("[name='" + key + "']").first();
                            valid = true;
                            if (elm.attr('required')) {
                                valid = false;
                            }
                            if (Array.isArray(form.valid[key])) {
                                results = [];
                                for (i = l = 0, ref2 = form.valid[key].length - 1; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
                                    results.push(form.valid[key][i] = valid);
                                }
                                return results;
                            } else {
                                return form.valid[key] = valid;
                            }
                        });
                        Object.keys(form.sendData).map(function (key) {
                            var editData, l, ref2, results, value;
                            value = form.sendData[key];
                            if (Array.isArray(value)) {
                                if (form.data[key] !== form.sendData[key]) {
                                    editData = true;
                                }
                                form.sendData[key] = [];
                                results = [];
                                for (i = l = 0, ref2 = value.length - 1; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
                                    form.sendData[key].push(null);
                                    if (editData) {
                                        results.push(form.data[key].push(''));
                                    } else {
                                        results.push(void 0);
                                    }
                                }
                                return results;
                            } else {
                                return form.sendData[key] = null;
                            }
                        });
                        skipSyncOnEdit = (form.skipSyncOnEdit != null) && form.skipSyncOnEdit;
                        form.syncData(void 0, void 0, true, false);
                        form.sendData = {};
                        ref2 = Object.keys(form.loaddata);
                        for (l = 0, len2 = ref2.length; l < len2; l++) {
                            key = ref2[l];
                            form.sendData[key] = form.loaddata[key];
                        }
                        form.syncData(form.container, form.sendData, true, false, skipSyncOnEdit);
                        if (form.callbacks.onSuccess != null) {
                            form.callbacks.onSuccess(form, response, autosave);
                        }
                        if ((response.data.id != null) && (form.modal.okPlus == null)) {
                            form.sendData.id = response.data.id;
                            form.container.find('[name="id"]').val(response.data.id);
                        }
                        if ((form.modal.okPlus != null) && (response.data.code != null)) {
                            form.sendData.code = response.data.code + 1;
                            form.container.find('[name="code"]').val(form.sendData.code);
                        }
                        if (form.container.find('.auto-focus').length) {
                            setTimeout(function () {
                                return form.container.find('.auto-focus').first().focus();
                            }, 0);
                        }
                        form.toAutoSave = false;
                    }
                    if ((response.messages != null) && response.messages.length && (form.parent != null) && (form.parent.parent != null) && !autosave) {
                        form.parent.parent.notify(response.messages[0].message, response.messages[0].type);
                    }
                    form._ajax = null;
                },
                error: function () {
                    if ((form.parent != null) && (form.modal != null)) {
                        form.parent.lock(form.modal.id, false);
                    }
                    form._ajax = null;
                }
            };
            this._ajax = $.ajax(ajax);
        }
    };

    Form.prototype.sanitize = function (data) {
        var elm, i, j, len, p;
        if (typeof data === 'object') {
            if (data instanceof Array) {
                for (i = j = 0, len = data.length; j < len; i = ++j) {
                    elm = data[i];
                    data[i] = this.sanitize(elm);
                }
            } else if (data instanceof Date) {
                data = data.toISOString();
            } else if (data instanceof Object) {
                for (p in data) {
                    elm = data[p];
                    data[p] = this.sanitize(elm);
                }
            } else {
                data = '';
            }
        } else if (typeof data === 'number') {
            if (!isFinite(data) || isNaN(data)) {
                data = '';
            } else if (data % 1 === 0) {
                data = parseInt(data);
            } else {
                data = parseFloat(data);
            }
        }
        return data;
    };

    Form.prototype.errors = function (errors) {
        var clones, container, e, err, error, field, form, i, j, k, len, len1;
        if (errors == null) {
            errors = [];
        }
        form = this;
        container = this.container;
        if ((this.modal != null) && (this.modal.container != null) && this.modal.container.find('.header-input').length) {
            container = container.add(this.modal.container.find('.header-input'));
        }
        container.find('[name]').each(function () {
            form.clearError($(this));
        });
        for (j = 0, len = errors.length; j < len; j++) {
            error = errors[j];
            for (field in error) {
                err = error[field];
                if (Array.isArray(err)) {
                    clones = container.find("[name='" + field + "[]']").closest('.clone').parent().children('.clone');
                    for (i = k = 0, len1 = err.length; k < len1; i = ++k) {
                        e = err[i];
                        if (e != null) {
                            this.addError(clones.eq(i).find("[name='" + field + "[]']"), e);
                        }
                    }
                } else {
                    this.addError(container.find("[name='" + field + "']"), err);
                }
            }
        }
        container.find('.has-error').first().focus();
    };

    Form.prototype.addError = function (element, error) {
        var error_first, spoiler, spoilerId;
        if ((this.parent != null) && (this.parent.parent != null)) {
            error = this.parent.parent.__(error, null, true);
        }
        this.clearError(element);
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
        error_first = this.container.find('.has-error').first();
        if (error_first.hasClass('select')) {
            error_first.find('.select-input').focus();
        } else {
            error_first.focus();
        }
    };

    Form.prototype.clearError = function (element) {
        if (element.hasClass('select')) {
            element.next('.select-container').removeClass('has-error').find('.select-arrow').next('.error').remove();
        }
        if (element.hasClass('summernote')) {
            element.next('.note-editor').removeClass('has-error').next('.error').remove();
        } else {
            element.removeClass('has-error').next('.error').remove();
        }
    };

    Form.prototype.render = function () {
        var skipSyncOnEdit;
        if (this.content != null) {
            this.container = this.content.clone();
            skipSyncOnEdit = (this.skipSyncOnEdit != null) && this.skipSyncOnEdit;
            this.syncData(this.container, this.sendData, true, false, skipSyncOnEdit);
            this.syncData(this.container, this.sendData, false, true, skipSyncOnEdit);
            this.bind();
        } else if (this.modal != null) {
            this.modal.loading = true;
        }
        return this.container;
    };

    Form.prototype.clone = function (selector, data, replace, silence, skipMultiple) {
        var change, clone, search;
        if (data == null) {
            data = {};
        }
        if (replace == null) {
            replace = {};
        }
        if (silence == null) {
            silence = false;
        }
        if (skipMultiple == null) {
            skipMultiple = false;
        }
        clone = this.content.find(selector).clone();
        for (search in replace) {
            change = replace[search];
            clone.find("[data-replace='" + search + "']").text(change);
        }
        clone.removeClass('cloneable').addClass('clone');
        if (!skipMultiple) {
            this.syncData(clone, data, true, false);
        }
        this.bind(clone, true);
        if (!silence) {
            this.container.find(selector).before(clone);
            this.syncData(clone, this.sendData, false);
            if (!clone.hasClass('no-resize-modal') && (this.parent != null) && (this.modal != null)) {
                this.parent.resizeModal(this.modal.id, true, true);
            }
        }
        this.toAutoSave = true;
        return clone;
    };

    Form.prototype.removeClone = function (selector, element) {
        var clones, form;
        form = this;
        clones = Array.prototype.reverse.call(this.container.find(selector).prevAll('.clone'));
        clones.filter(element).find('.input, .select').each(function () {
            form.set($(this).attr('name'), $(this).val(), $(this), true);
        });
        clones.filter(element).remove();
        if ((this.parent != null) && (this.modal != null)) {
            this.parent.resizeModal(this.modal.id, true, null);
        }
    };

    return Form;

})();

Input = (function () {
    function Input(element, parent, options) {
        if (parent == null) {
            parent = null;
        }
        if (options == null) {
            options = null;
        }
        this.element = $(element);
        this.parent = parent;
        this.fileMaxSize = 5;
        this.onInputChanged = false;
        if (this.element.hasClass('hasInput')) {
            return this.element.data('input');
        }
        this.element.addClass('hasInput');
        this.element.attr('autocomplete', 'off');
        this.element.on('focus.input', function () {
            $(this).addClass('focus');
        });
        this.element.on('blur.input', function () {
            $(this).removeClass('focus');
        });
        if ((options == null) && (this.element.data('input-options') != null)) {
            options = this.element.data('input-options');
        }
        if (this.element.hasClass('date-picker')) {
            this.datePicker(options);
        } else if (this.element.hasClass('color-picker')) {
            this.colorPicker();
        } else if (this.element.hasClass('number')) {
            this.number();
        } else if (this.element.hasClass('file')) {
            this.file();
        } else if (this.element.hasClass('checkbox') || this.element.hasClass('radio')) {
            this.radio();
        } else if (this.element.hasClass('pattern')) {
            this.pattern();
        } else if (this.element.hasClass('textarea')) {
            this.textarea();
        } else {
            this.text();
        }
    }

    Input.prototype.file = function () {
        var TRANSPARENT_1PX, input, remove, textLabel;
        input = this;
        if (this.element.hasClass('image')) {
            TRANSPARENT_1PX = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
            this.dropZone = $('<div />').addClass('drop-zone');
            this.preview = $('<img />', {
                "class": 'preview',
                src: TRANSPARENT_1PX
            });
            remove = $('<div />').addClass('remove');
            if ((input.parent != null) && (input.parent.parent != null) && (input.parent.parent.parent != null)) {
                remove.text(input.parent.parent.parent.__('GridActionDelete', 'Delete', true)).data('i18n', 'GridActionDelete');
            } else {
                remove.text('Delete');
            }
            this.preview.appendTo(this.dropZone);
            this.preview.after(remove);
            this.element.before(this.dropZone);
            this.element.appendTo(this.dropZone);
            if (this.element.data('src')) {
                this.preview.addClass('filled').attr('src', this.element.data('src'));
            }
            this.dropZone.on('dragover.input', function () {
                $(this).addClass('drop');
            });
            this.dropZone.on('dragleave.input', function () {
                $(this).removeClass('drop');
            });
            this.dropZone.on('drop.input', function (e) {
                $(this).removeClass('drop');
                input.setFiles(e.originalEvent.dataTransfer.files);
                return false;
            });
            this.preview.on('click', function (e) {
                if ($(e.target).attr('src') === TRANSPARENT_1PX) {
                    return $(input.element).trigger('click');
                }
            });
            $(window).off('drop.input dragover.input');
            $(window).on('drop.input dragover.input', function (e) {
                e = e || event;
                e.preventDefault();
                e.stop;
                return false;
            });
            remove.on('click.input', function () {
                var clone;
                input.preview.removeClass('filled').attr('src', TRANSPARENT_1PX);
                clone = input.element.clone(true);
                input.element.replaceWith(clone);
                input.element = clone;
                if (input.parent != null) {
                    input.parent.set(input.element.attr('name'), null, $(this), void 0, void 0, void 0, true);
                }
                return false;
            });
        } else {
            this.button = $('<div/>').addClass('input-file');
            this.element.before(this.button);
            if ((input.parent != null) && (input.parent.parent != null) && (input.parent.parent.parent != null)) {
                textLabel = input.parent.parent.parent.__('LabelSelectFile', 'בחירת קובץ...', true);
            } else {
                textLabel = 'בחירת קובץ...';
            }
            this.button.append($('<label>').append($('<span/>').css({
                'padding-right': '10px'
            }).text(textLabel)).append(this.element));
        }
        this.element.on('change.input', function (e) {
            input.setFiles(e.target.files, $(e.target).data('max-size'));
        });
    };

    Input.prototype.setFiles = function (files, maxSize) {
        var data, file, fileReader, input, notify, ref;
        if (files == null) {
            files = [];
        }
        if (maxSize == null) {
            maxSize = this.fileMaxSize;
        }
        input = this;
        data = null;
        if (files.length) {
            file = files[0];
            if ((input.parent != null) && (input.parent.parent != null) && (input.parent.parent.parent != null)) {
                notify = input.parent.parent.parent.notify;
            } else {
                notify = alert;
            }
            if (input.element.hasClass('validate')) {
                if (input.element.hasClass('image') && !file.type.match(/^image\/(jpg|jpeg|png|gif)$/)) {
                    input.parent.parent.parent.notify('NotifyImageFileOnly', 'danger');
                    return;
                }
                if (input.element.hasClass('csv')) {
                    if (file.type && !file.type.match(/^(application|text)\/(csv|vnd\.ms-excel|vnd\.openxmlformats\-officedocument.spreadsheetml\.sheet)$/)) {
                        input.parent.parent.parent.notify('NotifyCSVFileOnly', 'danger');
                        return;
                    } else if (file.name && ((ref = !file.name.split('.')[file.name.split('.').length - 1]) === 'csv' || ref === 'xls' || ref === 'xslx')) {
                        input.parent.parent.parent.notify('NotifyCSVFileOnly', 'danger');
                        return;
                    }
                }
            }
            fileReader = new FileReader();
            fileReader.onload = function (e) {
                data = e.target.result;
                if (input.element.hasClass('image')) {
                    input.preview.addClass('filled').attr('src', data);
                    input.element.data('src', data);
                } else {
                    input.element.closest('label').find('span').text(file.name);
                }
                if (input.parent != null) {
                    input.parent.set(input.element.attr('name'), data, $(input.element), void 0, void 0, void 0, true);
                }
            };
            fileReader.readAsDataURL(file);
        }
    };

    Input.prototype.checkbox = function () {
        var input;
        input = this;
        this.element.on('change.input', function () {
            if (input.parent != null) {
                input.parent.set($(this).attr('name'), ($(this).val() ? $(this).val() : 'on'), $(this), void 0, void 0, void 0, true);
            }
        });
    };

    Input.prototype.radio = function () {
        var input;
        input = this;
        this.element.on('change.input', function () {
            if (input.parent != null) {
                input.parent.set($(this).attr('name'), ($(this).val() ? $(this).val() : 'on'), $(this), void 0, void 0, void 0, true);
            }
        });
    };

    Input.prototype.pattern = function () {
        var allow, input, pattern;
        input = this;
        pattern = this.element.data('pattern');
        allow = this.element.data('allow');
        if (pattern === 'phone') {
            allow = /[\(\)\+\s0-9-]/i;
        } else {
            if (pattern != null) {
                pattern = new RegExp(pattern, 'gi');
            } else {
                pattern = /.*/;
            }
            if (allow != null) {
                allow = new RegExp(allow, 'gi');
            } else {
                allow = /./;
            }
        }
        this.element.on('change.input', function () {
            var char, filtered, j, len, value;
            value = $(this).val();
            filtered = '';
            for (j = 0, len = value.length; j < len; j++) {
                char = value[j];
                filtered += (filtered + char).match(pattern) ? char : '';
            }
            if (input.parent != null) {
                input.parent.set($(this).attr('name'), value, $(this), void 0, void 0, void 0, true);
            }
        });
        this.element.on('keypress.input', function (e) {
            var char;
            if (!e.which || e.ctrlKey || e.metaKey || e.altKey || e.keyCode === 8) {
                return;
            }
            char = String.fromCharCode(e.which);
            if (!char.match(allow)) {
                return false;
            }
        });
    };

    Input.prototype.text = function () {
        var input;
        input = this;
        this.element.on('change.input', function () {
            if (input.parent != null) {
                input.parent.set($(this).attr('name'), $(this).val(), $(this), void 0, void 0, void 0, true);
            }
        });
    };

    Input.prototype.textarea = function () {
        var input, maxSize, sendFile;
        input = this;
        if (this.element.hasClass('summernote')) {
            maxSize = parseFloat((this.element.data('max-size') != null ? this.element.data('max-size') : 2)) * 1024 * 1024;
            this.element.summernote({
                height: this.element.height(),
                disableResizeEditor: !this.element.hasClass('resize'),
                maximumImageFileSize: maxSize,
                onChange: function (content) {
                    input.element.val(content);
                    input.element.trigger('change');
                },
                onImageUpload: function (files, editor, welEditable) {
                    var error, file;
                    file = files[0];
                    error;
                    if (file.size > maxSize) {
                        error = 'Maximum file size exceeded';
                    } else if (!file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
                        error = 'Not an image';
                    } else {
                        sendFile(file, editor, welEditable);
                    }
                    if (error) {
                        if ((input.parent != null) && (input.parent.parent != null) && (input.parent.parent.parent != null)) {
                            return input.parent.parent.parent.notify(error, 'danger');
                        }
                    }
                }
            });
            sendFile = function (file, editor, welEditable) {
                var data;
                data = new FormData();
                data.append("file", file);
                if ((input.parent != null) && (input.parent.modal != null) && (input.parent.modal.id != null)) {
                    data.append('sender', input.parent.modal.id);
                }
                return $.ajax({
                    data: data,
                    type: "POST",
                    url: "/online/summernote/image-upload/",
                    headers: {
                        'X-CSRFToken': global.csrf
                    },
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function (url) {
                        return editor.insertImage(welEditable, url);
                    }
                });
            };
        }
        this.element.on('change.input', function () {
            if (input.parent != null) {
                input.parent.set($(this).attr('name'), $(this).val(), $(this), void 0, void 0, void 0, true);
            }
        });
    };

    Input.prototype.number = function () {
        var decimals, element, input, sign;
        input = this;
        element = this.element;
        sign = '.';
        decimals = 2;
        if (element.hasClass('float') && (element.data('decimals') != null)) {
            decimals = parseInt(element.data('decimals'));
        }
        if ((typeof global !== "undefined" && global !== null) && (global.format != null) && (global.format.number != null) && global.format.number.indexOf(',') !== -1) {
            sign = ',';
        }
        this.element.on('blur.input', function () {
            if (input.onInputChanged) {
                return element.trigger('change');
            }
        });
        this.element.on('change.input', function () {
            var length, number, pad, value;
            input.onInputChanged = false;
            value = element.val();
            if (sign === ',') {
                value = value.replace(',', '.');
            }
            number = parseFloat(value);
            if (!isNaN(number)) {
                if (element.hasClass('range')) {
                    if ((element.data('min') != null) && parseFloat(element.data('min')) > number) {
                        number = parseFloat(element.data('min'));
                    }
                    if ((element.data('max') != null) && parseFloat(element.data('max')) < number) {
                        number = parseFloat(element.data('max'));
                    }
                }
                if (element.hasClass('integer')) {
                    if (element.hasClass('fillZeros') && (element.data('length') != null)) {
                        length = element.data('length');
                        pad = Array(length + 1).join(0);
                        number = (pad + number).slice(-length);
                        element.val(number);
                    } else {
                        element.val(parseInt(number));
                    }
                } else {
                    element.val(BaseManager.numberFormat(number, void 0, void 0, void 0, decimals));
                }
            } else {
                element.val('');
                number = null;
            }
            if (input.parent != null) {
                input.parent.set(element.attr('name'), number, $(this), void 0, void 0, void 0, true);
            }
        });
        this.element.on('keypress.input', function (e) {
            var char, selEnd, selStart, value;
            if (!e.which || e.ctrlKey || e.metaKey || e.altKey || e.keyCode === 8) {
                return;
            }
            char = String.fromCharCode(e.which);
            value = element.val().split('');
            selStart = element.get(0).selectionStart;
            selEnd = element.get(0).selectionEnd;
            value.splice(selStart, selEnd, char);
            value = value.join('');
            if (!value) {
                return;
            }
            if (value.indexOf('-') !== -1) {
                if (element.hasClass('no-negative')) {
                    return false;
                } else if (value.indexOf('-') !== 0) {
                    return false;
                }
            }
            if (element.hasClass('integer') && value.indexOf(sign) !== -1) {
                return false;
            }
            if (element.hasClass('no-zero') && (element.hasClass('integer') && value.match(/^0/) || !element.hasClass('integer') && value.match(new RegExp("^0?\\" + sign + "?0{" + decimals)))) {
                return false;
            }
        });
        this.element.on('input.input', function () {
            var cursor, negative, number, value;
            cursor = element.get(0).selectionStart;
            value = element.val().split(sign);
            negative = false;
            if (value[0].indexOf('-') !== -1 && !element.hasClass('no-negative')) {
                negative = true;
            }
            number = value[0].replace(/\D/g, '');
            if (value.length > 1) {
                number += sign + value[1].replace(/\D/g, '').substr(0, decimals);
                input.onInputChanged = true;
            }
            if (negative) {
                number = "-" + number;
            }
            element.val(number);
            element.get(0).setSelectionRange(cursor, cursor);
        });
    };

    Input.prototype.datePicker = function (options) {
        var button, datePickerOptions, input, now;
        input = this;
        datePickerOptions = {};
        if ((input.parent != null) && input.parent.datePickerOptions) {
            $.extend(true, datePickerOptions, input.parent.datePickerOptions);
        }
        if (options != null) {
            $.extend(true, datePickerOptions, options);
        }
        if (this.element.hasClass('no-day') && (datePickerOptions.noDayFormat != null)) {
            datePickerOptions.minViewMode = 1;
            datePickerOptions.format = datePickerOptions.noDayFormat;
        }
        this.element.datepicker(datePickerOptions);
        this.element.addClass('hasDatePicker length').data('length', datePickerOptions.format.length);
        button = $('<button />', {
            type: 'button',
            "class": 'datepicker-trigger',
            tabIndex: -1
        });
        button.click(function () {
            if (input.element.prop('readonly') || input.element.prop('disabled')) {
                return;
            }
            input.element.datepicker('show');
        });
        this.element.after(button);
        if (this.element.hasClass('date-now') && !this.element.val()) {
            now = new Date();
            this.element.datepicker('setDate', now);
            if (this.parent != null) {
                this.parent.set(this.element.attr('name'), now, this.element, void 0, void 0, void 0, true);
            }
        }
        this.element.on('change.input', function () {
            if ((input.parent != null) && ($(this).val().length === 0 || $(this).val().match(/^[0-9]{1,2}\/?[0-9]{1,2}\/[0-9]{1,4}$/))) {
                input.parent.set($(this).attr('name'), $(this).val(), $(this), void 0, void 0, void 0, true);
            }
        });
        this.element.on('keyup.input', function (e) {
            var datePickerInstance;
            if (e.keyCode === 27) {
                datePickerInstance = input.element.data('datepicker');
                if ((datePickerInstance != null) && datePickerInstance.hidded !== void 0 && datePickerInstance.hidded) {
                    datePickerInstance.hidded = false;
                    return false;
                }
            }
        });
        this.element.on('keydown.input', function (e) {
            var datePickerInstance, ref;
            if ((ref = e.keyCode) === 40 || ref === 27) {
                datePickerInstance = input.element.data('datepicker');
                if ((datePickerInstance != null) && datePickerInstance.picker.is(':visible')) {
                    return datePickerInstance.hide();
                } else {
                    return datePickerInstance.hidded = true;
                }
            }
        });
        this.element.on('blur', function (e) {
            var c, change, changeValue, date, dateFormat, i, j, k, l, len, len1, n, ref, ref1, restOfYear, val;
            now = new Date();
            date = {
                d: '',
                m: '',
                y: ''
            };
            dateFormat = datePickerOptions.format.replace(/[^\w]/g, '');
            val = $(this).val();
            if (val.match(/^(\+|-)\d+$/g)) {
                now.setDate(now.getDate() + parseInt(val));
            } else if (val.match(/^\d+$/)) {
                for (i = j = 0, len = dateFormat.length; j < len; i = ++j) {
                    c = dateFormat[i];
                    if (i < val.length) {
                        date[c] += val[i];
                    }
                }
                if (date.y.length !== 4) {
                    restOfYear = '';
                    for (i = k = 0, ref = 4 - date.y.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
                        restOfYear += now.getFullYear().toString()[i];
                    }
                    date.y = restOfYear + date.y;
                }
            } else if (val.match(/^(\d{1,2})(\/?\d{1,2}\/)?(\d{1,4})?$/)) {
                val = val.split('/');
                dateFormat = datePickerOptions.format.split('/');
                for (i = l = 0, len1 = dateFormat.length; l < len1; i = ++l) {
                    c = dateFormat[i];
                    if (i < val.length && c[0]) {
                        date[c[0]] += val[i];
                    }
                }
                if (date.y.length !== 4) {
                    restOfYear = '';
                    for (i = n = 0, ref1 = 4 - date.y.length; 0 <= ref1 ? n < ref1 : n > ref1; i = 0 <= ref1 ? ++n : --n) {
                        restOfYear += now.getFullYear().toString()[i];
                    }
                    date.y = restOfYear + date.y;
                }
            } else if (val.match(/^((\+|-)(\d+)(d|m|y)){1,3}$/ig)) {
                while (change = val.match(/((\+|-)(\d+)(d|m|y))/i)) {
                    change = change[0];
                    val = val.replace(change, '');
                    changeValue = parseInt(change.slice(0, -1));
                    if (change.toLowerCase().slice(-1) === 'd') {
                        now.setDate(now.getDate() + changeValue);
                    }
                    if (change.toLowerCase().slice(-1) === 'm') {
                        now.setMonth(now.getMonth() + changeValue);
                    }
                    if (change.toLowerCase().slice(-1) === 'y') {
                        now.setFullYear(now.getFullYear() + changeValue);
                    }
                }
            } else {
                return;
            }
            if (!date.d && $(this).hasClass('no-day')) {
                date.d = 1;
            }
            if (date.m) {
                now.setMonth(parseInt(date.m) - 1);
            }
            if (date.d) {
                now.setDate(parseInt(date.d));
            }
            if (date.y) {
                now.setFullYear(parseInt(date.y));
            }
            $(this).datepicker('setDate', now);
            if (input.parent != null) {
                input.parent.set($(this).attr('name'), now, $(this), void 0, void 0, void 0, true);
            }
        });
    };

    Input.prototype.colorPicker = function () {
        var button, colorPickerOptions, input, resetButton;
        input = this;
        this.element.addClass('hide');
        button = $('<button />', {
            type: 'button',
            "class": 'btn btn-default colorpicker-trigger',
            tabIndex: -1
        });
        button.click(function () {
            if (input.element.prop('readonly') || input.element.prop('disabled')) {

            }
        });
        colorPickerOptions = {
            color: '#0000ff',
            onBeforeShow: function () {
                if (input.element.val()) {
                    return button.ColorPickerSetColor('#' + input.element.val());
                }
            },
            onChange: function (hsb, hex, rgb) {
                return input.element.val(hex).trigger('change');
            }
        };
        button.ColorPicker(colorPickerOptions);
        resetButton = $('<button />', {
            type: 'button',
            "class": 'btn btn-link',
            'data-i18n': 'ClearAll',
            style: 'margin-right: 25px'
        });
        resetButton.click(function () {
            input.element.val('').trigger('change');
        });
        this.element.after(resetButton).after(button);
        this.element.on('change.input', function () {
            if ((input.parent != null) && ($(this).val().length === 0 || $(this).val().match(/[0-9A-Fa-f]$/))) {
                input.parent.set($(this).attr('name'), $(this).val(), $(this), void 0, void 0, void 0, true);
                if ($(this).val().length) {
                    button.css('backgroundColor', '#' + $(this).val());
                } else {
                    button.css('backgroundColor', '');
                }
            }
        });
    };

    return Input;

})();

ModalManager = (function () {
    ModalManager["default"] = {
        options: {
            inner: false,
            formContent: false,
            confirmOk: null,
            locked: false,
            loading: false,
            edited: false,
            content: null,
            form: null,
            width: "auto",
            height: "auto",
            keepLoad: true
        },
        closeEsc: true,
        onLoad: null,
        smallDialogHeight: 300,
        templates: {
            modal: swig.compile("<div class=\"overlay\"></div><div class=\"modal-dialog\"><div class=\"modal-content\"></div></div>"),
            header: swig.compile("<div class=\"modal-header\"> {% if modal.title or modal.actions or modal.ok.header or modal.okPlus.header or modal.cancel.header %} <div class=\"modal-bar clearfix\"> {% if modal.title %} <div class=\"title\" {% if modal.title.key %} data-i18n=\"{{modal.title.key}}\" data-i18n-options='{{modal.data|json}}'>{{modal.title.text}}{% else %}>{{modal.title}}{% endif %}</div> {% endif %} {% if modal.actions or modal.ok.header or modal.cancel.header %} <div class=\"actions\"> {% if modal.actions %} <div class=\"option-wrapper dropdown\"> <span class=\"dropdown-toggle glyphicon glyphicon-option-vertical btn\" data-toggle=\"dropdown\"></span> <ul class=\"dropdown-menu\"\"> {% for action in modal.actions %} <li> <a href=\"#\" data-id=\"{{ action.id }}\" {% if action.label.key %} data-i18n=\"{{ action.label.key }}\"> {{ action.label.text }} {% else %}>{{ action.label }} {% endif %} </a> </li> {% endfor %} </ul> </div> {% endif %} {% if modal.okPlus.header and not modal.form.elementId %} <button class=\"btn btn-default btn-ok btn-ok-plus\"> <i class=\"fa fa-spinner fa-spin\"></i> <span class=\"glyphicon glyphicon-ok\"></span> <span class=\"glyphicon glyphicon-plus\"></span> </button> {% endif %} {% if modal.ok.header %} <button class=\"btn btn-default btn-ok\"> <i class=\"fa fa-spinner fa-spin\"></i> <span class=\"glyphicon glyphicon-ok\"></span> </button> {% endif %} {% if modal.minimize.header %} <button class=\"btn btn-default btn-maximize\"> <span class=\"glyphicon glyphicon-book\"></span> </button> <button class=\"btn btn-default btn-minimize\"> <span class=\"glyphicon glyphicon-minus\"></span> </button> {% endif %} {% if modal.cancel.header %} <button class=\"btn btn-default btn-cancel\"> <span class=\"glyphicon glyphicon-remove\"></span> </button> {% endif %} </div> {% endif %} </div> {% endif %} </div>"),
            footer: swig.compile("<div class=\"modal-footer\">{% if modal.actions or modal.okPlus.footer or modal.ok.footer or modal.cancel.footer %}<div class=\"actions\">{% for action in modal.actions %}{% if action.footer %}<button class=\"btn {{action.class}}\" data-id=\"{{action.id}}\" {% if action.label.key %} data-i18n=\"{{action.label.key}}\" {% endif %}>{% if action.icon %}<span class=\"glyphicon glyphicon-{{action.icon}}\"></span>{% endif %}{% if action.label %}{% if action.label.key %}{{action.label.text}}{% else %}{{action.label}}{% endif %}{% endif %}</button>{% endif %}{% endfor %}{% if modal.okPlus.footer %}<button class=\"btn btn-default btn-ok btn-ok-plus\"><i class=\"fa fa-spinner fa-spin\"></i><span class=\"glyphicon glyphicon-ok\"></span><span class=\"glyphicon glyphicon-plus\"></span></button>{% endif %}{% if modal.ok.footer %}<button class=\"btn btn-default btn-ok\"><i class=\"fa fa-spinner fa-spin\"></i><span class=\"glyphicon glyphicon-ok\"></span></button>{% endif %}{% if modal.cancel.footer %}<button class=\"btn btn-default btn-cancel\"><span class=\"glyphicon glyphicon-remove\"></span></button>{% endif %}</div>{% endif %}</div>"),
            body: swig.compile("<div class=\"modal-body\"></div>")
        }
    };

    function ModalManager(settings) {
        var modalManager, prop, ref, value;
        if (settings == null) {
            settings = {};
        }
        this.parent = null;
        this.modals = [];
        this.modalsContainer = null;
        this.visible = [];
        this.options = {};
        ref = this.constructor["default"];
        for (prop in ref) {
            value = ref[prop];
            this[prop] = value;
        }
        for (prop in settings) {
            value = settings[prop];
            if (prop in this) {
                this[prop] = value;
            }
        }
        modalManager = this;
        if (this.closeEsc) {
            $(document).off("keyup.modal");
            $(document).on("keyup.modal", function (e) {
                if (e.keyCode === 27) {
                    if (window.navigator.userAgent.indexOf("MSIE ") === -1 && ($(e.target).hasClass("ignore-esc") || $(e.target).is(":file"))) {
                        $(e.target).trigger("blur");
                        return;
                    }
                    if (modalManager.visible.length) {
                        if ((modalManager.modals[modalManager.visible.length - 1].cancel != null) && (modalManager.modals[modalManager.visible.length - 1].cancel.callback != null)) {
                            modalManager.modals[modalManager.visible.length - 1].container.find(".btn-cancel").trigger("click");
                        } else {
                            modalManager.close(modalManager.visible[modalManager.visible.length - 1]);
                        }
                    }
                }
            });
        }
        $(window).off("resize.modal");
        $(window).on("resize.modal", function () {
            var content, j, k, len, len1, modal, modalWindow, ref1, ref2;
            ref1 = modalManager.visible;
            for (j = 0, len = ref1.length; j < len; j++) {
                modal = ref1[j];
                ref2 = modalManager.modals;
                for (k = 0, len1 = ref2.length; k < len1; k++) {
                    modalWindow = ref2[k];
                    if (modalWindow.id === modal) {
                        content = modalWindow.container.find('.modal-complete-height');
                        if (content.length) {
                            content.first().css({
                                height: '',
                                maxHeight: ''
                            });
                        }
                    }
                }
                modalManager.resizeModal(modal, false, null);
            }
        });
    }

    ModalManager.prototype.open = function (options, refresh) {
        var dP, dlg, eP, elm, formProp, formValue, j, left, len, m, modal, modal_id, modal_search, offset, prop, ref, ref1, ref2, ref3, ref4, scale, top, value;
        if (options == null) {
            options = {};
        }
        if (refresh == null) {
            refresh = false;
        }
        if (typeof options === "string") {
            options = {
                id: options
            };
        }
        if (options.id == null) {
            return null;
        }
        ref = this.modals;
        for (j = 0, len = ref.length; j < len; j++) {
            m = ref[j];
            if (m.id === options.id) {
                modal = m;
                break;
            }
        }
        if (this.modalsContainer.find("#" + options.id + ".modal-minimized").length) {
            this.modalsContainer.find("#" + options.id + ".modal-minimized").find(".btn-maximize").closest(".modal-header").trigger("click");
            return modal;
        }
        if (!refresh && (ref1 = options.id, indexOf.call(this.visible, ref1) >= 0)) {
            return modal;
        }
        if (modal == null) {
            modal = options;
            this.render(modal, false);
        } else {
            for (prop in options) {
                value = options[prop];
                if (prop in modal) {
                    if (prop.indexOf('_') !== 0) {
                        if (prop === 'form') {
                            for (formProp in value) {
                                formValue = value[formProp];
                                modal.form[formProp] = formValue;
                            }
                        } else {
                            modal[prop] = value;
                        }
                    }
                }
            }
            this.render(modal, true);
        }
        if (this.visible.length && (ref2 = modal.id, indexOf.call(this.visible, ref2) < 0) && !modal.inner) {
            return modal;
        }
        if (ref3 = options.id, indexOf.call(this.visible, ref3) < 0) {
            modal.container.fadeIn(modal.animation != null ? 0 : "normal").css({
                zIndex: "+=" + this.visible.length
            });
            this.visible.push(modal.id);
            if (modal.animation != null) {
                if (modal.animation.type == null) {
                    modal.animation.type = "card";
                }
                modal.container.addClass("modal-animation " + modal.animation.type);
                if (modal.animation.element != null) {
                    eP = modal.animation.element.offset();
                    dP = modal.container.find(".modal-dialog").offset();
                    elm = {
                        width: modal.animation.element.outerWidth(),
                        height: modal.animation.element.outerHeight(),
                        top: eP.top,
                        left: eP.left
                    };
                    dlg = {
                        width: modal.container.find(".modal-dialog").outerWidth(),
                        height: modal.container.find(".modal-dialog").outerHeight(),
                        top: dP.top,
                        left: dP.left
                    };
                    top = elm.top - dlg.top + elm.height / 2 - dlg.height / 2;
                    left = elm.left - dlg.left + elm.width / 2 - dlg.width / 2;
                    modal.container.find(".modal-dialog").css({
                        transform: "translate(" + left + "px, " + top + "px)",
                        clip: "rect(0, 0, " + elm.width + ", " + elm.height + ")"
                    });
                    modal.animation.element.addClass("modal-animation " + modal.animation.type).addClass("animation-show");
                }
                modal.container.addClass("animation-show");
            }
        }
        if (options.name != null) {
            if (options.name === "confirm_cancel") {
                modal.container.addClass("modal-danger");
            }
            modal_search = modal.id.search("_confirm");
            if (modal_search > 0) {
                modal_id = modal.id.split("_confirm");
                offset = $("#" + modal_id[0] + " .modal-dialog").offset();
                modal.container.find(".modal-dialog").css({
                    "top": offset.top + 41.5 + "px",
                    "left": offset.left + 10 + "px",
                    "right": "auto"
                });
            }
        }
        if (((ref4 = options.id, indexOf.call(this.visible, ref4) >= 0) || refresh) && !modal.loading) {
            this.after(modal);
            if (modal.onOpen != null) {
                modal.onOpen(modal);
            }
            if (modal.animation != null) {
                if (modal.animation.element != null) {
                    eP = modal.animation.element.offset();
                    dP = modal.container.find(".modal-dialog").offset();
                    elm = {
                        width: modal.animation.element.outerWidth(),
                        height: modal.animation.element.outerHeight(),
                        top: eP.top,
                        left: eP.left
                    };
                    dlg = {
                        width: modal.container.find(".modal-dialog").outerWidth(),
                        height: modal.container.find(".modal-dialog").outerHeight(),
                        top: dP.top,
                        left: dP.left
                    };
                    scale = "scale(" + (elm.width / dlg.width) + ", " + (elm.height / dlg.height) + ")";
                    modal.container.find(".modal-dialog").css({
                        "transform": scale
                    });
                    top = elm.top - dlg.top + elm.height / 2 - dlg.height / 2;
                    left = elm.left - dlg.left + elm.width / 2 - dlg.width / 2;
                    modal.container.find(".modal-dialog").css({
                        transform: "translate(" + left + "px, " + top + "px) " + scale,
                        clip: "rect(0, 0, " + elm.width + ", " + elm.height + ")"
                    });
                    setTimeout(function () {
                        modal.animation.element.addClass("animation-open").removeClass("animation-show");
                    }, 0);
                }
                setTimeout(function () {
                    modal.container.addClass("animation-open").removeClass("animation-show");
                    if (modal.animation != null) {
                        modal.container.find(".scrollable").getNiceScroll().hide();
                        modal.container.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {
                            modal.container.off("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd");
                            modal.container.find(".scrollable").getNiceScroll().resize().show();
                            if (modal.animation.onAnimationEnd != null) {
                                modal.animation.onAnimationEnd(modal);
                            }
                        });
                    }
                }, 0);
            }
        }
        return modal;
    };

    ModalManager.prototype.close = function (ids, remove, force) {
        var checkVisibility, delay, index, j, k, len, len1, modal, modalManager, modal_minimized, ref, ref1, ref2;
        if (ids == null) {
            ids = null;
        }
        if (remove == null) {
            remove = false;
        }
        if (force == null) {
            force = false;
        }
        modalManager = this;
        if ((ids != null) && !Array.isArray(ids)) {
            ids = [ids];
        }
        ref = this.modals;
        for (j = 0, len = ref.length; j < len; j++) {
            modal = ref[j];
            if ((ids == null) || (ref1 = modal.id, indexOf.call(ids, ref1) >= 0)) {
                if ((modal.locked || modal.loading) && !force) {
                    return;
                }
                ref2 = $('.modal-minimized');
                for (index = k = 0, len1 = ref2.length; k < len1; index = ++k) {
                    modal_minimized = ref2[index];
                    modal_minimized.style.bottom = (index * 49 + 8) + "px";
                }
                modal.container.find('.scrollable').getNiceScroll().remove();
                $('.colorpicker').remove();
                delay = 0;
                if (modal.animation != null) {
                    delay = 3000;
                    modal.container.addClass('animation-hide').removeClass('animation-open');
                    if (modal.animation.element != null) {
                        modal.animation.element.addClass('animation-hide').removeClass('animation-open');
                    }
                }
                modal.container.delay(delay).fadeOut(modal.animation != null ? 0 : 'normal');
                if (modal._form != null) {
                    modal._form.sendData = {};
                    if (modal._form.autoSaver != null) {
                        clearInterval(modal._form.autoSaver);
                    }
                }
                this.visible = this.visible.filter(function (id) {
                    return modal.id !== id;
                });
                checkVisibility = setInterval(function () {
                    if (!modal.container.is(':visible')) {
                        clearInterval(checkVisibility);
                        modal.container.removeClass('animation-hide');
                        if ((modal.animation != null) && (modal.animation.element != null)) {
                            modal.animation.element.removeClass("modal-animation " + modal.animation.type + " animation-hide");
                        }
                        modal.container.hide().css({
                            zIndex: ''
                        });
                        if (!modal.keepLoad || remove) {
                            modalManager.modals = modalManager.modals.filter(function (modal) {
                                var ref3;
                                if ((ids == null) || (ref3 = modal.id, indexOf.call(ids, ref3) >= 0)) {
                                    modal.container.remove();
                                    return false;
                                } else {
                                    return true;
                                }
                            });
                            return;
                        }
                    }
                }, 1);
            }
        }
    };

    ModalManager.prototype.minimizes = function (ids) {
        var checkVisibility, index, j, k, len, len1, modal, modal_minimized, ref, ref1, ref2;
        if (ids == null) {
            ids = null;
        }
        if ((ids != null) && !Array.isArray(ids)) {
            ids = [ids];
        }
        ref = this.modals;
        for (j = 0, len = ref.length; j < len; j++) {
            modal = ref[j];
            if ((ids == null) || (ref1 = modal.id, indexOf.call(ids, ref1) >= 0)) {
                if ((modal.locked || modal.loading) && !force) {
                    return;
                }
                modal.container.addClass('modal-minimized');
                ref2 = $('.modal-minimized');
                for (index = k = 0, len1 = ref2.length; k < len1; index = ++k) {
                    modal_minimized = ref2[index];
                    modal_minimized.style.bottom = (index * 49 + 8) + "px";
                }
                modal.container.find('.scrollable').getNiceScroll().remove();
                this.visible = this.visible.filter(function (id) {
                    return modal.id !== id;
                });
                checkVisibility = setInterval(function () {
                    if (!modal.container.is(':visible')) {
                        clearInterval(checkVisibility);
                        if ((modal.animation != null) && (modal.animation.element != null)) {
                            modal.animation.element.removeClass("modal-animation " + modal.animation.type + " animation-hide");
                        }
                        modal.container.hide().css({
                            zIndex: ''
                        });
                    }
                }, 1);
            }
        }
    };

    ModalManager.prototype.lock = function (id, locked) {
        var j, len, modal, ref;
        if (id == null) {
            id = null;
        }
        if (locked == null) {
            locked = true;
        }
        ref = this.modals;
        for (j = 0, len = ref.length; j < len; j++) {
            modal = ref[j];
            if (modal.id === id) {
                if (locked && !modal.locked) {
                    modal.locked = true;
                    modal.container.addClass('lock');
                    if (!modal.container.find('.modal-body').is(':empty')) {
                        modal.container.find('.modal-body').append('<div class="lock-overlay" />');
                    }
                } else {
                    modal.locked = false;
                    modal.container.removeClass('lock').find('.modal-body').find('.lock-overlay').remove();
                }
            }
        }
    };

    ModalManager.prototype.setEdited = function (id, edited) {
        var j, len, modal, ref;
        if (id == null) {
            id = null;
        }
        if (edited == null) {
            edited = true;
        }
        ref = this.modals;
        for (j = 0, len = ref.length; j < len; j++) {
            modal = ref[j];
            if (modal.id === id) {
                modal.edited = edited;
                if (modal.edited) {
                    modal.container.addClass('edited');
                } else {
                    modal.container.removeClass('edited');
                }
            }
        }
    };

    ModalManager.prototype.ok = function (modal) {
        var cb;
        if (modal.ok.callback != null) {
            cb = modal.ok.callback(modal);
            if ((cb != null) && !cb) {
                return !cb;
            }
            this.close(modal.id);
        } else if (modal._form != null) {
            modal._form.submit();
        }
    };

    ModalManager.prototype.okPlus = function (modal) {
        var cb;
        if (modal.okPlus.callback != null) {
            cb = modal.okPlus.callback(modal);
            if ((cb != null) && !cb) {
                return !cb;
            }
        }
        if (modal._form != null) {
            modal._form.submit(void 0, true);
        }
    };

    ModalManager.prototype.modalBinds = function (modal) {
        var action, j, len, modalManager, ref;
        modalManager = this;
        modal.container.find(".btn-ok").click(function () {
            var keepModalOpen;
            keepModalOpen = $(this).hasClass("btn-ok-plus");
            if ((modal._form != null) && !modal._form.isValid(true) && (modalManager.parent != null)) {
                return;
            }
            if (modal.confirmOk != null) {
                modalManager.open({
                    id: modal.id + "_confirm",
                    title: modal.confirmOk,
                    inner: true,
                    keepLoad: false,
                    ok: {
                        header: true,
                        callback: function () {
                            if (!keepModalOpen) {
                                modalManager.ok(modal);
                            } else {
                                modalManager.okPlus(modal);
                            }
                        }
                    },
                    cancel: {
                        header: true,
                        callback: function () {
                            if ((modal.ok != null) && (modal.ok.confirmCancel != null)) {
                                return modal.ok.confirmCancel(modal);
                            }
                        }
                    },
                    name: "confirm_ok"
                });
            } else {
                if (!keepModalOpen) {
                    modalManager.ok(modal);
                } else {
                    modalManager.okPlus(modal);
                }
            }
        });
        modal.container.find(".btn-cancel").click(function () {
            var cb;
            if (modal.cancel.callback != null) {
                cb = modal.cancel.callback(modal);
                if ((cb != null) && !cb) {
                    return;
                }
            }
            if ((modal._form != null) && !modal._form.isValid(false) && (modalManager.parent != null)) {
                modalManager.close(modal.id);
                return;
            }
            if (modal.confirmCancel != null) {
                modalManager.open({
                    id: modal.id + "_confirm",
                    title: modal.confirmCancel,
                    inner: true,
                    keepLoad: false,
                    ok: {
                        header: true,
                        callback: function () {
                            modalManager.close(modal.id);
                        }
                    },
                    cancel: {
                        header: true,
                        callback: function () {
                            if ((modal.ok != null) && (modal.ok.confirmCancel != null)) {
                                return modal.ok.confirmCancel(modal);
                            }
                        }
                    },
                    name: "confirm_cancel"
                });
            } else {
                modalManager.close(modal.id);
            }
        });
        modal.container.find(".btn-minimize").click(function () {
            var cb;
            if (modal.minimize.callback != null) {
                cb = modal.minimize.callback(modal);
                if ((cb != null) && !cb) {
                    return;
                }
            }
            modalManager.minimizes(modal.id);
        });
        modal.container.find(".btn-maximize").closest(".modal-header").click(function (e) {
            if ($(e.target).hasClass("btn-minimize") || $(e.target).parent(".btn-minimize").length) {
                return;
            }
            if (modal.container.hasClass('modal-minimized')) {
                modal.container.removeClass("modal-minimized");
                modal.container.find(".scrollable").getNiceScroll().resize().show();
                modal.container.delay(0).fadeIn(modal.animation != null ? 0 : "normal");
                modal.container.show().css({
                    zIndex: "1100"
                });
            }
        });
        modal.container.on("click", ".nav-tabs a", function () {
            var tabContent;
            $(this).closest(".nav-tabs").find("li").removeClass("active");
            $(this).parent().addClass("active");
            tabContent = modal.container.find("[data-id='" + ($(this).attr("href").substr(1)) + "']");
            tabContent.closest(".tab-content").find(".tab-pane").removeClass("active");
            tabContent.addClass("active");
            return false;
        });
        if (modal.actions != null) {
            ref = modal.actions;
            for (j = 0, len = ref.length; j < len; j++) {
                action = ref[j];
                if (action.callback != null) {
                    (function (action) {
                        return modal.container.find("[data-id='" + action.id + "']").click(function (e) {
                            e.preventDefault();
                            action.callback(modal);
                        });
                    })(action);
                }
            }
        }
    };

    ModalManager.prototype.after = function (modal) {
        if (modal._form != null) {
            modal._form.after();
        } else if (modal.ok != null) {
            modal.container.find(".btn-ok").focus();
        }
        this.resizeModal(modal.id);
    };

    ModalManager.prototype.render = function (modal, reset) {
        var modalManger, prop, ref, value;
        if (reset == null) {
            reset = false;
        }
        modalManger = this;
        if (!reset) {
            ref = this.options;
            for (prop in ref) {
                value = ref[prop];
                if (modal[prop] == null) {
                    modal[prop] = value;
                }
            }
            this.modals.push(modal);
            modal.container = $("<div />").attr($.extend({
                id: modal.id
            }, modal.attrs ? modal.attrs : {})).addClass("modal");
            this.modalsContainer.append(modal.container);
        }
        if ((modal.load != null) && (modal.content == null) && (modal._ajax == null)) {
            modal.loading = true;
            modal._ajax = $.ajax({
                type: "POST",
                url: modal.load,
                data: (modal.form != null) && (modal.form.edit != null) && (modal.form.edit.multiple != null) && modal.form.edit.multiple ? {
                    multiple: true
                } : null,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    response = response.d
                    BaseManager.serverError(response);
                    if (modal.onLoad != null) {
                        response = modal.onLoad(response);
                    }
                    modal.content = $(response);
                    if (modal.content.data("modal-data") != null) {
                        modal.data = modal.content.data("modal-data");
                    }
                    if ((modal.form != null) && (modal.form.content == null)) {
                        modal.form.content = modal.content.clone();
                    }
                    modal.loading = false;
                    modalManger.open(modal, true);
                    modal._ajax = null;
                },
                error: function () {
                    return modal._ajax = null;
                }
            });
        }
        if ((modal.load == null) || (modal.load != null) && (modal.content != null)) {
            if ((modal.form != null) && (modal.form.content != null)) {
                if (modal._form == null) {
                    modal._form = new Form();
                    modal._form.parent = this;
                    modal._form.modal = modal;
                    modal.formContent = true;
                }
                modal._form.init(modal.form);
                if (modal._form._ajax == null) {
                    modal.content = modal._form.render();
                } else {
                    modal.loading = true;
                }
            }
        }
        if (modal.loading) {
            if (!modal.container.hasClass("loading")) {
                modal.container.html(this.templates.modal({
                    modal: modal
                }));
                modal.container.find(".modal-dialog").html($("<div class=\"loader\" />"));
                modal.container.addClass("loading");
            }
        } else {
            modal.container.removeClass("loading");
            modal.container.html(this.templates.modal({
                modal: modal
            }));
            modal.container.find(".modal-dialog").html($("<div class=\"modal-content\" />").html(this.templates.header({
                modal: modal
            }) + this.templates.body({
                modal: modal
            }) + this.templates.footer({
                modal: modal
            })));
            modal.container.find(".modal-body").html((modal.form != null) && (modal.form.content != null) ? $(modal.content) : $(modal.content).clone());
            this.modalBinds(modal);
            if (this.parent != null) {
                this.parent.i18n(null, modal.container);
            }
            if (modal.locked) {
                this.lock(modal.id);
            }
            if (modal.edited) {
                this.setEdited(modal.id, false);
            }
            if (modal.formContent) {
                modal.container.addClass("form");
            } else {
                modal.container.removeClass("form");
            }
            if (modal.callback != null) {
                modal.callback(modal);
            }
        }
    };

    ModalManager.prototype.resizeModal = function (id, animate, scroll) {
        var bodyHeight, completeHeight, content, contentHeight, dialog, dialogHeight, footerHeight, headerHeight, height, innerHeight, j, len, modal, newSizes, ref, ref1, ref2, scrollable, scrollableHeight, scrollablePart, tabsContent, tabsContentHeight;
        if (animate == null) {
            animate = false;
        }
        ref = this.modals;
        for (j = 0, len = ref.length; j < len; j++) {
            modal = ref[j];
            if (modal.id === id) {
                if (ref1 = modal.id, indexOf.call(this.visible, ref1) < 0) {
                    modal.container.show();
                }
                dialog = modal.container.children('.modal-dialog');
                dialog.css({
                    width: modal.width,
                    height: modal.height
                });
                tabsContent = dialog.find('.tab-content');
                tabsContentHeight = 0;
                scrollableHeight = 0;
                tabsContent.find('.tab-pane').each(function () {
                    tabsContentHeight = Math.max(tabsContentHeight, $(this).height());
                });
                tabsContent.css('minHeight', tabsContentHeight);
                content = dialog.children('.modal-content');
                completeHeight = content.find('.modal-complete-height').first();
                if (completeHeight.length) {
                    if (isNaN(parseInt(completeHeight.css('maxHeight')))) {
                        headerHeight = content.children('.modal-header').outerHeight();
                        footerHeight = content.children('.modal-footer').outerHeight();
                        bodyHeight = content.children('.modal-body').outerHeight();
                        contentHeight = content.innerHeight();
                        if (bodyHeight < contentHeight - headerHeight - footerHeight) {
                            height = completeHeight.outerHeight() + (contentHeight - headerHeight - bodyHeight - footerHeight);
                        } else if (bodyHeight > contentHeight - headerHeight - footerHeight) {
                            height = completeHeight.outerHeight() - (bodyHeight - (contentHeight - headerHeight - footerHeight));
                        } else {
                            height = completeHeight.height();
                        }
                        completeHeight.css({
                            height: height,
                            maxHeight: height
                        });
                    }
                    innerHeight = 0;
                    completeHeight.children(':visible').each(function () {
                        innerHeight += $(this).outerHeight();
                    });
                    if (completeHeight.innerHeight() < innerHeight) {
                        scrollableHeight += innerHeight - completeHeight.innerHeight();
                    }
                }
                dialogHeight = dialog.height();
                dialog.css('height', 'auto');
                if (dialogHeight < dialog.height()) {
                    scrollableHeight += dialog.height() - dialogHeight;
                }
                dialog.css('height', modal.height);
                if (dialog.height() >= $(window).height()) {
                    scrollableHeight += dialog.height() - $(window).height();
                }
                scrollable = content.find('.scrollable');
                if (!scrollable.length && scrollableHeight) {
                    scrollable = content.children('.modal-body').wrapInner($('<div />').addClass('scrollable')).children();
                    content.find('.scrollable').scroll(function () {
                        return $('#selectOptionsContainer').css('display', 'none');
                    });
                }
                if (scrollableHeight) {
                    scrollablePart = parseInt(scrollableHeight / scrollable.length);
                    scrollable.each(function () {
                        var currentScroll, element, enableHorizontal;
                        element = this;
                        if (!$(this).hasClass('modal-complete-height')) {
                            $(this).css('maxHeight', $(this).height() - scrollablePart);
                        } else if (isNaN(parseInt($(this).css('maxHeight')))) {
                            height = $(this).height() - scrollablePart;
                            $(this).css({
                                height: height,
                                maxHeight: height
                            });
                        }
                        innerHeight = 0;
                        $(this).children(':visible').each(function () {
                            innerHeight += $(this).outerHeight();
                        });
                        if ($(this).innerHeight() < innerHeight) {
                            if ($(this).getNiceScroll().length) {
                                $(this).getNiceScroll().resize();
                                setTimeout(function () {
                                    $(element).trigger('mouseover');
                                }, 0);
                            } else {
                                enableHorizontal = content.find('.scrollable').hasClass('enable-horizontal');
                                $(this).niceScroll({
                                    horizrailenabled: enableHorizontal,
                                    cursoropacitymin: 0.5,
                                    zindex: dialog.css('zIndex'),
                                    railoffset: {
                                        left: -5
                                    },
                                    railalign: 'left'
                                });
                            }
                            currentScroll = $(this).scrollTop();
                            if (scroll != null) {
                                if (scroll) {
                                    $(this).scrollTop($(this).get(0).scrollHeight - $(this).height());
                                } else {
                                    $(this).scrollTop(0);
                                }
                            } else if (currentScroll != null) {
                                $(this).scrollTop(currentScroll);
                            }
                        }
                    });
                } else if (scrollable.length) {
                    scrollable.each(function () {
                        var bodyNeed, currentScroll, element, outerHeight;
                        element = this;
                        currentScroll = $(this).scrollTop();
                        if (scroll != null) {
                            if (scroll) {
                                $(this).scrollTop($(this).get(0).scrollHeight - $(this).height());
                            } else {
                                $(this).scrollTop(0);
                            }
                        } else if (currentScroll != null) {
                            $(this).scrollTop(currentScroll);
                        }
                        innerHeight = 0;
                        $(this).children(':visible').each(function () {
                            return innerHeight += $(this).outerHeight();
                        });
                        outerHeight = 0;
                        $(this).parent().children(':visible').each(function () {
                            outerHeight += $(this).outerHeight();
                        });
                        if (innerHeight <= this.clientHeight || outerHeight - this.clientHeight > innerHeight) {
                            $(this).css('maxHeight', '').getNiceScroll().remove();
                        } else {
                            bodyNeed = $(this).height() + ($(window).height() - dialog.height());
                            if (outerHeight <= bodyNeed) {
                                $(this).css('maxHeight', bodyNeed);
                            }
                            $(this).getNiceScroll().resize();
                            setTimeout(function () {
                                $(element).trigger('mouseover');
                            }, 0);
                        }
                    });
                }
                if (modal.small && dialog.height() < this.smallDialogHeight) {
                    dialog.addClass('small');
                } else {
                    dialog.removeClass('small');
                }
                if ((modal.form != null) && (modal.form.elementId || ((modal.form.sendData != null) && (modal.form.sendData.id != null)))) {
                    dialog.addClass('edit');
                } else {
                    dialog.removeClass('edit');
                }
                if (global.user.current_language_code === 'he') {
                    newSizes = {
                        marginRight: -Math.round(dialog.width() / 2),
                        marginTop: dialog.hasClass('small') ? 0 : -Math.round(dialog.height() / 2),
                        width: modal.width,
                        height: modal.height
                    };
                } else {
                    newSizes = {
                        marginLeft: -Math.round(dialog.width() / 2),
                        marginTop: dialog.hasClass('small') ? 0 : -Math.round(dialog.height() / 2),
                        width: modal.width,
                        height: modal.height
                    };
                }
                if (animate) {
                    if (newSizes.width !== 'auto' && (dialog.width() === newSizes.width || newSizes.width.toString().indexOf('%') !== -1 && dialog.parent().length && dialog.width() === (dialog.parent().width() * (parseInt(newSizes.width) / 100)))) {
                        delete newSizes.width;
                    }
                    dialog.animate(newSizes);
                } else {
                    dialog.css(newSizes);
                }
                if ((ref2 = modal.id, indexOf.call(this.visible, ref2) < 0) && !modal.minimize) {
                    modal.container.hide();
                }
            }
        }
    };

    return ModalManager;

})();

NotificationManager = (function () {
    function NotificationManager(settings) {
        var prop, value;
        this.notificationCounterArea = null;
        this.notificationListArea = null;
        this.notificationIconArea = null;
        this.clearAll = null;
        this.getData = null;
        this.notificationActions = null;
        this.notificationCounter = 0;
        this.notificationUnseenCounter = 0;
        for (prop in settings) {
            value = settings[prop];
            this[prop] = value;
        }
        NotificationManager = this;
        if (this.notificationActions != null) {
            this.notificationListArea.on('click', this.notificationActions.actionElement, this.notificationActions.callback);
        }
        if ((this.clearAll != null) && this.clearAll.hasOwnProperty('element')) {
            this.clearAll.element.on('click', function (e) {
                e.preventDefault();
                return NotificationManager.deleteAllNotifications();
            });
        }
    }

    NotificationManager.prototype.addNotification = function (notification) {
        var notificationContent;
        this.notificationCounter += 1;
        if (notification.status !== 1) {
            this.notificationUnseenCounter += 1;
        }
        notificationContent = this.getData.notificationRenderCallback(notification);
        this.notificationListArea.append(notificationContent);
        this.refreshCounter();
    };

    NotificationManager.prototype.clearNotifications = function () {
        this.notificationListArea.html('');
        this.notificationCounter = 0;
        this.notificationUnseenCounter = 0;
        return this.refreshCounter();
    };

    NotificationManager.prototype.deleteAllNotifications = function () {
        if (this.clearAll != null) {
            return $.ajax({
                type: 'GET',
                headers: {
                    'X-CSRFToken': global.csrf
                },
                url: this.clearAll.url,
                cache: false,
                success: this.clearAll.callback
            });
        }
    };

    NotificationManager.prototype.refreshCounter = function () {
        if (this.notificationUnseenCounter) {
            this.notificationCounterArea.removeClass('hide');
            this.notificationCounterArea.html(this.notificationUnseenCounter);
        } else {
            this.notificationCounterArea.addClass('hide');
            this.notificationCounterArea.html('');
        }
        if (this.notificationCounter) {
            this.notificationIconArea.removeClass('no-notifications');
            if (this.clearAll != null) {
                return this.clearAll.element.removeClass('hide');
            }
        } else {
            this.notificationIconArea.addClass('no-notifications');
            if (this.clearAll != null) {
                return this.clearAll.element.addClass('hide');
            }
        }
    };

    NotificationManager.prototype.getNotifications = function () {
        NotificationManager = this;
        if (NotificationManager.getData != null) {
            return $.ajax({
                type: 'GET',
                headers: {
                    'X-CSRFToken': global.csrf
                },
                url: NotificationManager.getData.url,
                cache: false,
                success: function (response) {
                    return NotificationManager.getData.responseCallback(response);
                }
            });
        }
    };

    return NotificationManager;

})();

Select = (function () {
    function Select(element, parent) {
        var data, optionsContainer, select, selected;
        if (parent == null) {
            parent = null;
        }
        select = this;
        this.element = $(element);
        if (this.element.hasClass('hasSelect')) {
            return this.element.data('select');
        }
        this.element.addClass('hasSelect');
        this.parent = parent;
        this.autoChoose = this.parent ? this.parent.selectAutoChoose : true;
        this.clickEnter = false;
        this.related = null;
        this.child = null;
        if ((this.parent != null) && (this.parent.container != null) && this.element.data('related')) {
            this.related = this.parent.container.find("[name='" + (this.element.data('related')) + "']");
        }
        if ((this.parent != null) && (this.parent.container != null) && this.element.data('child')) {
            this.child = this.parent.container.find("[name='" + (this.element.data('child')) + "']");
        }
        this.options = [];
        this.search = '';
        this.current = {
            id: '',
            text: '',
            data: null
        };
        this.isSearch = this.element.hasClass('select-suggest');
        this.isAutoselect = this.element.hasClass('select-autoselect');
        this.isSelect = this.element.hasClass('select-native');
        this.isLoad = this.element.hasClass('select-load');
        this.isInsert = this.element.hasClass('select-insert');
        this.isDisabled = this.element.is(':disabled');
        if (this.element.find('option').length && !this.isLoad) {
            this.element.find('option').each(function () {
                var data, option;
                data = $(this).data('data');
                if (data == null) {
                    data = {};
                }
                option = {
                    id: $(this).val(),
                    text: $.trim($(this).text()),
                    data: JSON.parse(JSON.stringify(data))
                };
                if ($(this).data('i18n')) {
                    option.i18n = $(this).data('i18n');
                }
                select.options.push(option);
            });
        }
        if (this.isLoad) {
            data = this.element.data();
            this.load = {
                length: 50,
                fromBottomLoad: 1500,
                url: data.url,
                query: {
                    search: data.search,
                    filter: data.filter,
                    result: data.result,
                    more: data.more
                }
            };
        }
        this.container = $('<div />').addClass('select-container');
        if (this.element.data('style')) {
            this.container.attr('style', this.element.data('style'));
        }
        this.element.after(this.container);
        this.input = $('<input />').attr({
            type: 'text',
            autocomplete: 'false'
        }).addClass('select-input');
        if (select.isDisabled) {
            this.disabled(true);
        }
        if (!this.isSearch) {
            this.input.attr('readonly', 'readonly');
        }
        this.container.append(this.input);
        this.arrow = $('<button />').attr({
            type: 'button',
            tabIndex: -1
        }).addClass('select-arrow');
        this.arrow.append($('<i />').addClass('fa fa-angle-down'));
        this.arrow.append($('<i />').addClass('fa fa-spinner fa-spin'));
        if (this.isSelect) {
            this.container.append(this.arrow);
        }
        if (!$('#selectOptionsContainer').length) {
            optionsContainer = $('<ul />').attr({
                id: 'selectOptionsContainer'
            }).addClass('select-options');
            optionsContainer.on('mousedown.select', '.select-option', function () {
                var selectObj;
                selectObj = optionsContainer.data('select');
                selectObj._mousedown = true;
            });
            optionsContainer.on('click.select', '.select-option', function () {
                var selectObj;
                selectObj = optionsContainer.data('select');
                selectObj._mousedown = false;
                selectObj.set($(this).attr('data-value'), $(this).text(), $(this).data('data'));
                selectObj.input.focus();
                selectObj.dropped(false);
            });
            optionsContainer.on('mouseover.select', '.select-option', function () {
                var selectObj;
                selectObj = optionsContainer.data('select');
                selectObj.optionsContainer.find('.select-option').removeClass('active');
                $(this).addClass('active');
            });
            optionsContainer.on('scroll.select', function () {
                var selectObj;
                selectObj = optionsContainer.data('select');
                if (selectObj.optionsContainer.hasClass('lazy-load')) {
                    if ($(this).get(0).scrollHeight - $(this).get(0).scrollTop < selectObj.load.fromBottomLoad) {
                        selectObj.loadNext(selectObj.optionsContainer.data('data'));
                    }
                }
            });
            $('body').append(optionsContainer);
            optionsContainer.hide();
        }
        this.optionsContainer = $('#selectOptionsContainer');
        if (this.element.hasClass('empty') && !this.element.find('option').filter("[value='']").length) {
            this.element.prepend($('<option />'));
            this.options.unshift({
                id: '',
                text: '',
                data: null
            });
            if (!this.element.find('option').filter('[selected]').length) {
                this.element.find('option').first().attr('selected', 'selected');
            }
        }
        this.arrow.on('mousedown.select', function () {
            select._mousedown = true;
        });
        this.arrow.on('click.select', function () {
            select._mousedown = false;
            if (select.isDisabled) {
                return;
            }
            select.input.focus();
            select.dropped();
        });
        this.element.on('focus.select', function () {
            select.input.focus();
        });
        this.element.on('change.select', function () {
            var selected;
            selected = $(this).find('option').filter('[selected]');
            select.set(selected.val(), selected.text(), selected.data('data'), false);
            if (select.parent != null) {
                select.parent.set($(this).attr('name'), select.current.id, $(this), void 0, void 0, void 0, true);
            }
        });
        this.element.attr({
            tabIndex: -1
        }).addClass('hidden');
        selected = this.element.find('option').filter('[selected]');
        if (selected.length) {
            this.set(selected.val(), selected.text(), selected.data('data'), false);
        } else if (this.element.hasClass('no-empty')) {
            selected = this.element.find('option').first();
            this.set(selected.val(), selected.text(), selected.data('data'), false);
        } else {
            this.set('', '', {}, false);
        }
        if (!this.isSearch) {
            this.input.on('click.select', function () {
                if (select.isDisabled) {
                    return;
                }
                select.input.focus();
                select.dropped();
            });
        }
        this.input.on('focus.select', function () {
            select.container.addClass('focus');
        });
        this.input.on('blur.select', function () {
            select.container.removeClass('focus');
            setTimeout((function () {
                var insertOption, option;
                if (select._mousedown) {
                    select.container.addClass('focus');
                }
                if (!select.container.hasClass('focus') && !select._mousedown) {
                    select.dropped(false);
                    if (!select.input.val()) {
                        select.reset(true);
                    } else if (select.isInsert) {
                        option = $('<option />').val(select.input.val()).text(select.input.val()).data('data', null);
                        insertOption = {
                            id: select.input.val(),
                            text: select.input.val(),
                            data: null
                        };
                        if (select.element.find('option').length) {
                            if (select.element.find('option').first().val() === '') {
                                select.element.find('option').first().after(option);
                                select.options.splice(1, 0, insertOption);
                            } else {
                                select.element.find('option').first().before(option);
                                select.options.splice(0, 0, insertOption);
                            }
                        } else {
                            select.element.html(option);
                            select.options = [insertOption];
                        }
                        select.set(select.input.val(), select.input.val(), null);
                    } else if (select.current.text !== select.input.val() || select.current.id !== select.element.val()) {
                        select.set(select.current.id, select.current.text, select.current.data, true);
                    }
                    select.element.trigger('blur');
                }
            }), 0);
        });
        this.input.on('keydown.select', function (e) {
            var activeOption, containerHeight, enter, height, index, options, positionTop, ref, scrollTop;
            options = select.optionsContainer.find('.select-option');
            index = options.filter('.active').index();
            if (e.keyCode === 40) {
                if (select.isSearch && (select._suggestTimeout != null)) {
                    e.stopImmediatePropagation();
                    return false;
                }
                if (!select.container.hasClass('select-dropped')) {
                    select.dropped(true);
                    if (select.options.length) {
                        options = select.optionsContainer.find('.select-option');
                        index = options.filter('.active').index();
                    } else {
                        return false;
                    }
                }
                index++;
                if (index >= options.length) {
                    return false;
                }
            } else if (e.keyCode === 38) {
                if (select.container.hasClass('select-dropped')) {
                    index--;
                }
                if (index < 0) {
                    if (!select.isSearch) {
                        return;
                    }
                    options.removeClass('active');
                    select.set('', select.search);
                    return false;
                }
            } else if (e.keyCode === 27) {
                return;
            } else if ((ref = e.keyCode) === 13 || ref === 9) {
                if (select.isSearch && select.input.val()) {
                    if (!options.length) {
                        select.clickEnter = true;
                        e.stopImmediatePropagation();
                        select.search = select.input.val();
                        select.loadOptions(true, true);
                        select._suggestTimeout = null;
                        return;
                    }
                } else if (!select.container.hasClass('select-dropped') || select.optionsContainer.is(':empty')) {
                    return;
                }
                enter = true;
            } else if (e.keyCode === 8) {
                if (select.input.is('[readonly]')) {
                    return false;
                }
                return;
            } else {
                return;
            }
            options.removeClass('active');
            if (options.length) {
                activeOption = options.eq(index);
                if (enter != null) {
                    if (activeOption != null) {
                        if (select.isSearch) {
                            select.search = activeOption.text();
                        }
                        select.set(activeOption.attr('data-value'), activeOption.text(), activeOption.data('data'), true, true);
                    } else {
                        if (select.isSearch) {
                            select.search = select.input.val();
                            select.set(select.input.val(), select.input.val(), select.input.data('data'), true, true);
                        }
                    }
                    select.dropped(false);
                } else {
                    activeOption.addClass('active');
                    select.set(activeOption.attr('data-value'), activeOption.text(), activeOption.data('data'), false);
                    scrollTop = select.optionsContainer.scrollTop();
                    containerHeight = select.optionsContainer.innerHeight();
                    positionTop = activeOption.position().top;
                    height = activeOption.outerHeight();
                    if (positionTop < 0) {
                        select.optionsContainer.scrollTop(scrollTop + positionTop);
                    } else if (positionTop + height > containerHeight) {
                        select.optionsContainer.scrollTop(scrollTop - (containerHeight - positionTop) + height);
                    }
                }
                return;
            }
            return false;
        });
        this.input.on('keyup.select', function (e) {
            var ref;
            if ((ref = e.keyCode) !== 40 && ref !== 38 && ref !== 27 && ref !== 13 && ref !== 37 && ref !== 39 && ref !== 9 && ref !== 16) {
                if (select.isSearch && select.search !== select.input.val()) {
                    select.search = select.input.val();
                    select.suggest();
                }
            } else if (e.keyCode === 27) {
                if (select.container.hasClass('select-dropped')) {
                    if (select.current.id !== select.element.val()) {
                        select.set(select.current.id, select.current.text, select.current.data);
                    }
                    select.dropped(false);
                    return false;
                } else if (select.container.hasClass('loading')) {
                    select.dropped(false);
                    return false;
                }
            }
        });
    }

    Select.prototype.disabled = function (state) {
        if (state == null) {
            state = true;
        }
        this.isDisabled = state;
        if (state) {
            this.element.attr('disabled', 'disabled');
            this.input.attr('disabled', 'disabled');
        } else {
            this.element.removeAttr('disabled');
            this.input.removeAttr('disabled');
        }
    };

    Select.prototype.set = function (value, text, data, trigger, forceTrigger) {
        var elm, j, len, ref;
        if (data == null) {
            data = {};
        }
        if (trigger == null) {
            trigger = true;
        }
        if (forceTrigger == null) {
            forceTrigger = false;
        }
        if (!this.element.hasClass('no-empty') || this.element.hasClass('no-empty') && value) {
            if (this.current.id !== value || this.current.text !== $.trim(text) || JSON.stringify(this.current.data) !== JSON.stringify(data)) {
                this.current = {
                    id: value,
                    text: $.trim(text),
                    data: data
                };
            } else if (!forceTrigger) {
                trigger = false;
            }
        }
        text = this.current.text;
        if ((this.element.find('option').filter("[value='" + this.current.id + "']").data('i18n') != null) && (this.parent != null) && (this.parent != null) && (this.parent.parent.parent != null)) {
            text = this.parent.parent.parent.__(this.element.find('option').filter("[value='" + this.current.id + "']").data('i18n'), null, true);
        }
        if (this.input.val() !== text) {
            this.input.val(text);
        }
        if (this.element.val() !== this.current.id || !this.element.find('option').filter("[value='" + this.current.id + "']").attr('selected')) {
            if (this.current.id) {
                this.element.parent().addClass('selected');
            } else {
                this.element.parent().removeClass('selected');
            }
            if (this.isLoad) {
                if (trigger && this.container.hasClass('select-dropped')) {
                    this.dropped(false);
                }
                this.options = [];
                this.element.html($('<option />').val(value).text(text).data('data', data).attr('selected', 'selected'));
            } else {
                this.element.val(this.current.id);
                this.element.find('option').removeAttr('selected');
                ref = this.element.find('option[selected]');
                for (j = 0, len = ref.length; j < len; j++) {
                    elm = ref[j];
                    $(elm).replaceWith($('<option />').val(elm.value).text(elm.text));
                }
                this.element.find('option').filter("[value='" + this.current.id + "']").attr('selected', 'selected');
            }
        }
        if ((this.child != null) && this.child.data('select')) {
            this.child.data('select').disabled(this.current.id === '');
            this.child.data('select').reset(trigger);
        }
        if (this.related != null) {
            this.disabled((this.related.data('select') != null ? this.related.data('select').current.id : this.related.val()) === '');
        }
        if (trigger) {
            this.element.trigger('change');
        }
    };

    Select.prototype.reset = function (trigger) {
        if (trigger == null) {
            trigger = false;
        }
        if (this.container.hasClass('select-dropped')) {
            this.dropped(false);
        }
        if (this.isLoad) {
            this.options = [];
        }
        if (this.isSearch) {
            this.search = '';
        }
        this.set('', '', {}, trigger);
    };

    Select.prototype.dropped = function (open, options, resetScroll, suggest, append) {
        var containerSize, fromOption, j, len, length, opt, option, pos, position, ref, selectFirst, selectObj, text;
        if (open == null) {
            open = null;
        }
        if (options == null) {
            options = null;
        }
        if (resetScroll == null) {
            resetScroll = true;
        }
        if (suggest == null) {
            suggest = false;
        }
        if (append == null) {
            append = false;
        }
        selectObj = this.optionsContainer.data('select');
        if ((selectObj == null) || (selectObj != null) && selectObj.element.get(0) !== this.element.get(0)) {
            this.optionsContainer.data('select', this);
            selectObj = this;
            resetScroll = true;
            this.search = this.clickEnter ? this.search : '';
            if (this.isLoad) {
                this.options = [];
            }
        }
        if ((open == null) && this.container.hasClass('select-dropped') || (open != null) && !open) {
            this.optionsContainer.hide();
            this.optionsContainer.html('');
            this.optionsContainer.removeClass('lazy-load');
            this.container.removeClass('select-dropped');
            this.container.removeClass('loading');
            if (this.optionsContainer.getNiceScroll().length) {
                this.optionsContainer.getNiceScroll().remove();
            }
            if (this._ajax != null) {
                this._ajax.abort();
            }
            return;
        }
        if (options == null) {
            if (this.isLoad) {
                this.element.html('');
                this.loadOptions(false, suggest);
                return;
            } else {
                options = this.options;
            }
        }
        if (suggest) {
            selectFirst = true;
            resetScroll = true;
        }
        if (this.isLoad && append) {
            fromOption = this.optionsContainer.find('.select-option').length;
        } else {
            fromOption = 0;
            this.optionsContainer.html('');
            if (this.isLoad && this.element.hasClass('empty') && options.length && options[0].id !== '' && !this.search) {
                options.unshift({
                    id: '',
                    text: '',
                    data: null
                });
            }
        }
        ref = options.slice(fromOption);
        for (j = 0, len = ref.length; j < len; j++) {
            option = ref[j];
            text = $('<span />').text(option.text).html();
            if ((option.i18n != null) && (this.parent != null) && (this.parent != null) && (this.parent.parent.parent != null)) {
                text = this.parent.parent.parent.__(option.i18n, null, true);
            }
            if (this.isSearch && this.search && option.text.toLowerCase().indexOf(this.search.toLowerCase()) !== -1) {
                pos = option.text.toLowerCase().indexOf(this.search.toLowerCase());
                length = this.search.length;
                text = [text.slice(0, pos), '<span class="term">', text.slice(pos, pos + length), '</span>', text.slice(pos + length)].join('');
            }
            opt = $('<li />');
            opt.addClass('select-option').attr({
                'data-value': option.id,
                title: option.data && option.data.hasOwnProperty('title') ? option.data.title : option.text
            }).data('data', option.data).html(text);
            if (option.data !== void 0 && option.data) {
                if (option.data.sum) {
                    if (Math.min(parseInt(option.data.sum)) < 0) {
                        opt.addClass('negative').attr({
                            'data-value': option.id,
                            title: option.text
                        }).data('data', option.data).html(text);
                    }
                }
            }
            this.optionsContainer.append(opt);
            if (this.isLoad) {
                this.element.append($('<option />').attr({
                    'data-value': option.id,
                    title: option.text
                }).data('data', option.data).html(text));
            }
        }
        if (!options.length) {
            this.optionsContainer.addClass('empty');
        } else {
            this.optionsContainer.removeClass('empty');
        }
        if (this.clickEnter) {
            this.clickEnter = false;
            if (!this.optionsContainer.children('.select-option').length) {
                this.container.addClass('select-dropped');
                if (this.onDropped != null) {
                    this.onDropped(this);
                }
                this.input.select();
                return;
            }
            this.optionsContainer.children('.select-option').eq(this.element.hasClass('empty') ? 1 : 0).addClass('active');
            setTimeout(function () {
                selectObj.input.trigger($.Event('keydown', {
                    keyCode: 13,
                    which: 13
                }));
            }, 0);
        } else if (selectFirst != null) {
            this.optionsContainer.children('.select-option').eq(0).addClass('active');
            if (selectObj.isAutoselect && options.length === 1 && this.autoChoose) {
                setTimeout(function () {
                    selectObj.input.trigger($.Event('keydown', {
                        keyCode: 13,
                        which: 13
                    }));
                }, 0);
            }
        } else {
            this.optionsContainer.find('.select-option').filter("[data-value='" + this.current.id + "']").addClass('active');
        }
        if (!this.container.is(':visible')) {
            return;
        }
        this.container.addClass('select-dropped');
        if (this.onDropped != null) {
            this.onDropped(this);
        }
        this.optionsContainer.show();
        position = this.container.offset();
        containerSize = {
            width: this.container.outerWidth(),
            height: this.container.outerHeight()
        };
        if ((this.element.data('container-width') != null) && containerSize.width < this.element.data('container-width')) {
            containerSize.width = this.element.data('container-width');
        }
        this.optionsContainer.css('max-height', '');
        if (position.top + containerSize.height + this.optionsContainer.height() > $(window).height() && $(window).height() - position.top < position.top) {
            this.optionsContainer.css({
                top: 'inherit',
                bottom: $(window).height() - position.top,
                left: position.left,
                width: containerSize.width,
                maxHeight: Math.min(parseInt(this.optionsContainer.css('max-height')), position.top)
            }).addClass('top');
        } else {
            this.optionsContainer.css({
                top: position.top + containerSize.height,
                bottom: 'inherit',
                left: position.left,
                width: containerSize.width,
                maxHeight: Math.min(parseInt(this.optionsContainer.css('max-height')), $(window).height() - position.top - containerSize.height)
            }).removeClass('top');
        }
        if (this.optionsContainer.getNiceScroll().length) {
            this.optionsContainer.getNiceScroll().resize();
        } else {
            this.optionsContainer.niceScroll({
                horizrailenabled: false,
                cursoropacitymin: 0.5,
                zindex: 99999
            });
        }
        $("[title]", this.optionsContainer).each(function (i, element) {
            if (!(element.offsetWidth < element.scrollWidth)) {
                return $(element).removeAttr("title");
            }
        });
        if (resetScroll) {
            this.optionsContainer.scrollTop(0);
        }
    };

    Select.prototype.suggest = function () {
        var options, select;
        select = this;
        if (this.isLoad) {
            if (this._suggestTimeout != null) {
                clearTimeout(this._suggestTimeout);
            }
            this._suggestTimeout = setTimeout(function () {
                select.loadOptions(true, true);
                select._suggestTimeout = null;
            }, 300);
        } else {
            options = this.options.filter(function (element) {
                if (!select.search) {
                    return true;
                }
                return element.text.toLowerCase().indexOf(select.search.toLowerCase()) !== -1;
            });
            this.dropped(true, options, true, true);
        }
    };

    Select.prototype.loadOptions = function (filter, suggest) {
        var data, name, ref, select, value;
        if (filter == null) {
            filter = false;
        }
        if (suggest == null) {
            suggest = false;
        }
        select = this;
        data = {};
        this.load.result = this.load.query.result != null ? this.load.query.result : {
            id: 'id',
            text: 'text'
        };
        if (((this.load.query.filter != null) || select.element.data('related')) && (this.parent != null) && (this.parent.container != null) && $("[name='" + (select.element.data('related')) + "']", this.parent.container).length) {
            data[this.load.query.filter != null ? this.load.query.filter : 'filter'] = this.related.data('select') != null ? this.related.data('select').current.id : this.related.val();
        }
        if (filter) {
            data[this.load.query.search != null ? this.load.query.search : 'term'] = select.search;
        }
        if (select.element.data('more') != null) {
            this.load.query.more = select.element.data('more');
            ref = this.load.query.more;
            for (name in ref) {
                value = ref[name];
                data[name] = value;
            }
        }
        if (this.options.length && !filter) {
            this.dropped(true, this.options);
        } else {
            this.loadNext(data, true, suggest);
        }
        if (!this.optionsContainer.hasClass('lazy-load')) {
            this.optionsContainer.addClass('lazy-load');
            this.optionsContainer.data('data', data);
        }
    };

    Select.prototype.loadNext = function (data, force, suggest) {
        var select;
        if (force == null) {
            force = false;
        }
        if (suggest == null) {
            suggest = false;
        }
        select = this;
        if (force) {
            this.options = [];
            this.container.removeClass('loading');
            this._more = true;
            if (this._ajax != null) {
                this._ajax.abort();
            }
        }
        if ((this._ajax != null) || (this._more != null) && !this._more) {
            return;
        }
        data.start = this.options.length;
        data.length = this.load.length;
        select.container.addClass('loading');
        this._ajax = $.ajax({
            url: this.load.url + '/list',
            data: JSON.stringify({ 'infoData': data }),
            type: 'post',
            contentType: "application/json; charset=utf-8",
            success: function (list) {
                list = JSON.parse(list.d)
                var j, len, option;
                for (j = 0, len = list.length; j < len; j++) {
                    option = list[j];
                    if (typeof option !== 'object') {
                        option = {
                            id: option,
                            text: option,
                            data: null
                        };
                    } else {
                        option = {
                            id: option[select.load.result.id] != null ? option[select.load.result.id] : option.id,
                            text: option[select.load.result.text] != null ? option[select.load.result.text] : option.text,
                            data: option[select.load.result.data] != null ? option[select.load.result.data] : option.data
                        };
                    }
                    select.options.push(option);
                }
                select.dropped(true, select.options, force, suggest, !force);
                select._more = list.length === select.load.length;
            },
            error: function (jqXHR, exception) {
                var msg = '';
                if (jqXHR.status === 0) {
                    msg = 'Not connect.\n Verify Network.';
                } else if (jqXHR.status == 404) {
                    msg = 'Requested page not found. [404]';
                } else if (jqXHR.status == 500) {
                    msg = 'Internal Server Error [500].';
                } else if (exception === 'parsererror') {
                    msg = 'Requested JSON parse failed.';
                } else if (exception === 'timeout') {
                    msg = 'Time out error.';
                } else if (exception === 'abort') {
                    msg = 'Ajax request aborted.';
                } else {
                    msg = 'Uncaught Error.\n' + jqXHR.responseText;
                }
                console.log(msg);
            },
            complete: function () {
                select._ajax = null;
                select.container.removeClass('loading');
            }
        });
    };

    return Select;

})();

TabManager = (function () {
    TabManager["default"] = {
        datePickerOptions: {
            format: 'dd/mm/yyyy',
            todayHighlight: true,
            showOnFocus: false,
            autoclose: true,
            keyboardNavigation: false,
            forceParse: false,
            clearBtn: true
        }
    };

    function TabManager(settings) {
        var prop, ref, tabManager, value;
        if (settings == null) {
            settings = {};
        }
        this.parent = null;
        this.tabs = [];
        this.history = [];
        this.visible = [];
        this.visibleCount = 3;
        this.current = null;
        this.content = null;
        this.navContainer = null;
        this.filterContainer = null;
        this.callback = null;
        this.permissions = null;
        this.loadLength = 50;
        this.fromBottomLoad = 0;
        this.closeAllConfirmCallback = null;
        this.RefTab = 600000;
        this.ClickDateLast = new Date();
        swig.setFilter('hasValue', function (input) {
            return typeof input.value !== 'undefined';
        });
        swig.setFilter('length', function (input) {
            return Object.keys(input).length;
        });
        this.templates = {
            filters: swig.compile('<div class=\'floating-filters hide\'>\n  <div class="div-header-filters" style="position: relative;">\n    <button type="button" class="btn btn-default clear-all" style="position: absolute; left: 0;">\n      <span class="glyphicon glyphicon-erase"></span>\n    </button>\n    <button type="button" class="btn-close">&#10006;</button>\n  </div>\n  {% for filter, value in filters %}\n    {% if filter == "search" %}<div class="search form"><span data-i18n="FiltersSearch"></span><input type="text" class="editable" name="search" value="{{filters.data.search}}" autocomplete="off"><button class="btn-search" type="submit" tabindex="-1"><i class="glyphicon glyphicon-search"></i></button></div>\n    {% elif filter == "extraSearch" %}{% for extra_search in value %}<div class="search form extra-search">{% if extra_search.label %}<span data-i18n="{{extra_search.label.key}}">{{extra_search.label.text}}</span>{% endif %}<input type="text" class="editable {% if extra_search.label %} with-label {% endif %}{% if extra_search.class %}{{extra_search.class}}{% endif %}" name="{{extra_search.name}}" autocomplete="off" value="{% if filters.data[extra_search.name] %}{{filters.data[extra_search.name]}}{% endif %}" {% if extra_search.placeholder.key %}data-i18n="[placeholder]{{extra_search.placeholder.key}}" placeholder="{{extra_search.placeholder.text}}"{% else %} placeholder="{{extra_search.placeholder}}"{% endif %}><button class="btn-search" type="submit"><i class="glyphicon glyphicon-search"></i></button></div>{% endfor %}\n    {% elif filter == "filtersCombo" %}\n      {% for comboFilter in value %}\n        <div class="combo-filter {% if not comboFilter.visible %}hide-combo-filter{% endif %}">\n          <div class="combo-filter-wrapper">\n            <span {% if comboFilter.label.key %} data-i18n="{{comboFilter.label.key}}">{{comboFilter.label.text}}{% else %}>{{comboFilter.label}}{% endif %}</span>\n            <select\n                  class="select select-native select-suggest select-autoselect{%if comboFilter.load %} select-load{% endif %}{% if comboFilter.class %} {{comboFilter.class}}{% endif %}"\n                  {%if comboFilter.load %}\n                    data-url="{{comboFilter.load}}"\n                    data-result={% if comboFilter.dataResult %}\'{{comboFilter.dataResult|json}}\'{% else%}\'{"id": "id", "text": "nm"}\'{% endif %}\n                    data-more={% if comboFilter.data %}\'{{comboFilter.data|json}}\'{% else %}\'{}\'{% endif %}\n                  {% endif %}\n                  name="{{comboFilter.name}}"\n                  data-style={% if comboFilter.width %}"width: {{comboFilter.width}}px;"{% else %}"width: 200px;"{% endif %}>\n              {% if comboFilter.options %}\n                {% for option in comboFilter.options %}\n                  <option value=\'{{option.id}}\'{% if option.id == filters.data[comboFilter.name] %} selected="selected"{% endif %}>\n                    {{option.text}}\n                  </option>\n                {% endfor %}\n              {% else %}\n                {% if comboFilter.text %}\n                  <option value="{% if filters.data[comboFilter.name] %}{{filters.data[comboFilter.name]}}{% endif %}" selected="selected">\n                    {{comboFilter.text}}\n                  </option>\n                {% endif %}\n              {% endif %}\n            </select>\n          </div>\n        </div>\n      {% endfor %}\n    {% elif filter == "filter_by" %}{% for _filter_by in filters.filter_by %}<div class="filter_by" data-name="{{ _filter_by.name }}" {% if _filter_by.style_view %} style="{{_filter_by.style_view}}" {% endif %}>{% if _filter_by.choices|length == 1 %}{% for value, label in _filter_by.choices %}<span {% if label.key %} data-i18n="{{label.key}}">{{ label.text }}{% else %}>{{ label }}{% endif %}</span><input type="checkbox" name="{{ value }}"{% if filters.data[_filter_by.name] %} checked="checked"{% endif %}/>{% endfor %}{% else %}<span {% if _filter_by.class %} class="{{ _filter_by.class }}" {% endif %} data-i18n={% if _filter_by.datai18n %}"{{ _filter_by.datai18n }}"{% else %}"FiltersFilterBy"{% endif %} {% if _filter_by.style %} style="{{ _filter_by.style }}" {% endif %}>Filter by</span><div class="filter-wrapper dropdown" {% if _filter_by.width %} style="width: {{_filter_by.width}}px"{% endif %}><span class="select dropdown-toggle" data-toggle="dropdown"><span class="span_txt" {% for value, label in _filter_by.choices %}{% if filters.data[_filter_by.name] and value == filters.data[_filter_by.name] or not filters.data[_filter_by.name] and loop.first %}{% if label.key %} data-i18n="{{label.key}}">{{label.text}}{% else %}>{{label}}{% endif %}{% endif %}{% endfor %}</span><span class="glyphicon glyphicon-menu-down"></span></span><ul class="filter dropdown-menu popover bottom" role="menu">{% for value, label in _filter_by.choices %}<li{% if filters.data[_filter_by.name] and value == filters.data[_filter_by.name] or not filters.data[_filter_by.name] and loop.first %} class="active"{% endif %} tabindex="-1"><a href="{{value}}"{% if label.key %} data-i18n="{{label.key}}">{{label.text}}{% else %}>{{label}}{% endif %}</a></li>{% endfor %}</ul></div>{% endif %}</div>{% endfor %}\n    {% elif filter == "date" %}\n      {% for date in value %}\n        <div class="date form">\n          <span{% if date.label.key %} data-i18n="{{date.label.key}}">{{ date.label.text }}{% else %}>{{ date.label }}{% endif %}</span>\n          <input class="editable" autocomplete="off" type="text" name="{{ date.name }}"{% if filters.data.date and filters.data.date[date.name] %} value="{{filters.data.date[date.name]}}"{% endif %} />\n          <button type="button" class="datepicker-trigger" tabIndex="-1"></button>\n          {% if date.time %}\n            <input class="editable time-picker" type="text" name="{{ date.time.name }}" {% if filters.data.time and filters.data.time[date.time.name] %} value="{{filters.data.time[date.time.name]}}"{% endif %}/>\n          {% endif %}\n        </div>\n      {% endfor %}\n    {% elif filter == "actions" %}<div class="actions">{% for action in value %}{% if not action.hasOwnProperty(\'massaction\') %}{% if action.id != \'add\' %}{% if action.openButtonGroup %}<div class="btn-group {{action.buttonGroupClass}}">{% endif %}{% if action.dropDown %}<div class="btn-group {{action.buttonGroupClass}}"><button type="button" class="btn {{action.class}} dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button><ul class="dropdown-menu">{% for menuAction in action.dropDown %}{% if menuAction == "divider" %}<li class="divider"></li>{% else %}<li><a href="#" class="{{menuAction.class}}" data-id="{{menuAction.id}}" {% if menuAction.href %} data-href="{{ menuAction.href }}"{% endif %}{% if menuAction.target %} data-target="{{menuAction.target}}" data-toggle="modal"{% endif %}>{% if action.icon %}<span class="glyphicon glyphicon-{{menuAction.icon}}"></span> {% endif %} \'{% if menuAction.name %}<span{% if menuAction.name.key %} data-i18n="{{menuAction.name.key}}">{{ menuAction.name.text }}{% else %}>{{ menuAction.name }}{% endif %}</span>{% endif %}</a></li>{% endif %}{% endfor %}</ul></div>{% else %}<button type="button" class="btn{% if action.selectable %} selectable{% endif %} {{action.class}}" data-id="{{action.id}}" {% if action.attrs %}{% for attr, attrVal in action.attrs %} {{attr}}="{{attrVal}}"{% endfor %}{% endif %}>{% if action.icon %} <span class="glyphicon glyphicon-{{action.icon}}"></span> {% endif %} {% if action.name %} <span{% if action.name.key %} data-i18n="{{action.name.key}}">{{ action.name.text }}{% else %}>{{ action.name }}{% endif %}</span> {% endif %}</button>{% endif %}{% if action.closeButtonGroup %}</div>{% endif %}{% endif %}{% endif %}{% endfor %}</div>{% endif %}{% endfor %}</div>\n<div class=\'floating-filters-mass hide\'>{% for filter, value in filters %}{% if filter == "actions" %}<div class="actions_mass">{% for action in value %}{% if action.hasOwnProperty(\'massaction\') %}<button type="button" class="btn{% if action.selectable %} selectable{% endif %} {{action.class}}" data-id="{{action.id}}"{% if action.attrs %}{% for attr, attrVal in action.attrs %}{{attr}}="{{attrVal}}"{% endfor %}{% endif %}>{% if action.icon %}<span class="glyphicon glyphicon-{{action.icon}}"></span> {% endif %}{% if action.name %} <span{% if action.name.key %} data-i18n="{{action.name.key}}">{{ action.name.text }}{% else %}>{{ action.name }}{% endif %}</span> {% endif %}</button>{% endif %}{% endfor %}</div>{% endif %}{% endfor %}</div>\n<div class=\'floating-orders hide\'>\n  {% for filter, value in filters %}\n    {% if filter == "order" %}\n      <div class="order_by">\n        {% if filters.order_by %}\n          <table class="sorting">\n            {% for value, label in filters.order_by %}\n              <tr id="#tr{{value}}" {% if filters.data.sorting and value == filters.data.sorting or not filters.data.sorting and loop.first %} class="orderSelected" {% else %} class="orderNoSelected" {% endif %}>\n                <td><button id="desc" class="sorting-order btn btn-default"><span id="{{value}}" class="glyphicon glyphicon-arrow-up{% if filters.data.sorting and value == filters.data.sorting or not filters.data.sorting and loop.first %}{% if filters.data.order == 0 %} spanSelected {% endif %}{% endif %} "></span></button></td>\n                <td><button id="asc" class="sorting-order btn btn-default"><span id="{{value}}" class="glyphicon glyphicon-arrow-down {% if filters.data.sorting and value == filters.data.sorting or not filters.data.sorting and loop.first %}{% if filters.data.order %} spanSelected {% endif %}{% endif %} "></span></button></td>\n                <td class="name"><span {% if label.key %} data-i18n="{{label.key}}" {% endif %}>{{label.text}}</span></td>\n              </tr>\n            {% endfor %}\n          </table>\n        {% endif %}\n      </div>\n    {% endif %}\n  {% endfor %}\n</div>\n<div class=\'floating-options hide {% if filters.hideClass %}{{ filters.hideClass }}{% endif %}\'>{% for filter, value in filters %}{% if filter == "options" %}<div class="options"><ul class="list-group">{% for option in value %}<li class="list-group-item list-group-item-action" data-option="{{option.id}}"> <a href="#" data-id="{{ option.id }}" {% if option.label.key %} data-i18n="{{ option.label.key }}"> {{ option.label.text }} {% else %}>{{ option.label }} {% endif %} </a></li>{% endfor %}</ul></div>{% endif %}{% endfor %}</div>\n{% if view %}{% if view.columns %}<div class="columns">{% for index, column in view.columns %}<label for="{{column.name}}" class="col-{{index}}{% for order_key, order_value in filters.order_by %}{% if order_key == column.name %} order{% if filters.data.sorting and column.name == filters.data.sorting or not filters.data.sorting and order_value == filters.order_by|first %}{% if filters.data.order %} asc{% else %} desc{% endif %}{% endif %}{% endif %}{% endfor %}{% if column.class %} {{ column.class }}{% endif %}">{% if column.order %}<i class="fa"></i>{% endif %}<span{% if column.label.key %} data-i18n="{{column.label.key}}">{{column.label.text}}{% else %}>{{column.label}}{% endif %}</span></label>{% endfor %}</div>{% endif %}{% endif %}\n<div class=\'floating-buttons\'>\n  {% if addButton %}<button type="button" class="btn btn-success add-button" data-id="{{addButton.id}}"><span class="glyphicon glyphicon-plus"></span></button>{% endif %}\n  {% if scrollUpButton %}<button type="button" class="btn scrollup-button" data-id="{{scrollButton.id}}"><span class="glyphicon glyphicon glyphicon-arrow-up"></span></button>{% endif %}\n  {% if loginBIButton %}<button type="button" class="btn login-bi-button" data-id="{{scrollButton.id}}"><span class="glyphicon fa fa-line-chart"></span></button>{% endif %}\n  <button id="filter-mass" type="button" class="btn filters-mass-button"><span class="glyphicon glyphicon-edit"></span></button>\n  <button id="filter" type="button" class="btn btn-info filters-button"><span class="glyphicon glyphicon-filter"></span></button>\n  <button id="sorts" type="button" class="btn btn-info orders-button"><span class="glyphicon glyphicon-sort"></span></button>\n  <button id="active" type="button" class="btn btn-danger options-button"><span class="glyphicon glyphicon-cog"></span></button>\n  <button id="view" type="button" class="btn btn-warning view-button"><span class="glyphicon glyphicon-th"></span></button>\n</div>\n<div id="hide-buttons"><span class="glyphicon glyphicon-arrow-up"></span></div>'),
            tabs: swig.compile('{% for i, tab in tabsVisible %}<li{% if tab.id == current %} class="active"{% endif %} id="tab_{{tab.id}}"><a href="#{{tab.id}}"{% if tab.label.key %} data-i18n="{{tab.label.key}}" data-i18n-options=\'{{tab.label.variables|json}}\'>{{tab.label.text}}{% else %}>{{tab.label}}{% endif %}</a>{% if not tab.cantClose %}<svg class="close" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve"><path d="M16,15l-1,1l-3-3l-3,3l-1-1l3-3L8,9l1-1l3,3l3-3l1,1l-3,3L16,15z"/></svg>{% endif %}</li>{% endfor %}{% if tabsVisible %}<li class="list-more popup-menu-holder"><svg class="list-tabs" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve"><path d="M5,13h14v-2H5 M3,17h14v-2H3 M7,7v2h14V7"/></svg><ul class="popup-menu">{% for i, tab in tabsHidden %}<li><a href="#{{tab.id}}"{% if tab.label.key %} data-i18n="{{tab.label.key}}" data-i18n-options=\'{{tab.label.variables|json}}\'>{{tab.label.text}}{% else %}>{{tab.label}}{% endif %}</a>{% if not tab.cantClose %}<svg class="close" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve"><path d="M16,15l-1,1l-3-3l-3,3l-1-1l3-3L8,9l1-1l3,3l3-3l1,1l-3,3L16,15z"/></svg>{% endif %}</li>{% endfor %}{% if count > visibleCount %}<li role="separator" class="divider"></li>{% endif %}<li class="close-all"><a href="#" data-i18n="TabCloseAll">Close all tabs</a></li></ul></li>{% endif %}'),
            elements: swig.compile('<div class="row elements"></div> <div class="no-results-info"{% if tab.load.noResults.key %} data-i18n="{{tab.load.noResults.key}}">{{tab.load.noResults.text}}{% else %}>{{tab.load.noResults}}{% endif %}</div> <div class="no-elements-info" {% if tab.load.noElements.key %} data-i18n="{{tab.load.noElements.key}}">{{tab.load.noElements.text}}{% else %}>{{tab.load.noElements}}{% endif %}</div> <div class="loader"></div>'),
            //element: swig.compile('<div class="element-container {% if data.containerClass %}{{data.containerClass}}{% endif %}"> <div class="element{% if data.class %} {{data.class}}{% endif %}"{% if data.element.id %} data-id="{{data.element.id}}"{% endif %}{% if data.attrs %}{% for attr, value in data.attrs %} {{attr}}="{{value}}"{% endfor %}{% endif %}> {% if data.selectable %}<label class="selectable"><input type="checkbox"{% if data.selected %} checked="checked"{% endif %} /></label>{% endif %} {% if data.actions %} <div class="actions dropdown"> {% if data.actions|first %}<span class="dropdown-toggle"> <span data-i18n="GridActions">Actions</span> <i class="fa fa-angle-down"></i> <svg viewBox="0 0 24 24"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-dots-vertical"></use></svg> </span> <ul class="dropdown-menu"> {% for action in data.actions %} <li class="{% if action.class %}{{ action.class }}{% endif %}"><a href="#" data-id="{{action.id}}"{% if action.label.key %} data-i18n="{{action.label.key}}">{{action.label.text}}{% else %}>{{action.label}}{% endif %}</a></li> {% endfor %} </ul>{% endif %}</div> {% endif %} {% if data.fields %} <div class="fields"> {% for field in data.fields %} <div {% if field.attrs %}{% for attr, attrVal in field.attrs %} {{attr}}="{{attrVal}}"{% endfor %}{% endif %} class="field{% if field.type == "image" %} image{% endif %}{% if field.class %} {{field.class}}{% endif %}"> {% if field.type == "image" %} <img src="{{field.value}}" /> {% else %} {% if field.label %} <label{% if field.label.key %} data-i18n="{{field.label.key}}">{{field.label.text}}{% else %}>{{field.label}}{% endif %}</label> {% endif %} <span{% if field.valueClass %} class="{{field.valueClass}}"{% endif %}{% if field.i18n %} data-i18n="{{field.i18n}}"{% if field|hasValue %} data-i18n-options=\'{{field.value|json}}\'{% endif %}{% endif %}>{% if field|hasValue %}{{field.value}}{% else %}{{field}}{% endif %}</span> {% endif %} </div> {% endfor %} </div> {% endif %}{% if data.cells %} <div class="cells"> {% for index, cell in data.cells %} <div {% if cell.attrs %}{% for attr, attrVal in cell.attrs %} {{attr}}="{{attrVal}}"{% endfor %}{% endif %} class="cell col-{% if data.selectable %}{{index + 1}}{% else %}{{index}}{% endif %} {% if cell.class %} {{cell.class}}{% endif %}"{% if cell.i18n %} data-i18n="{{cell.i18n}}"{% if cell|hasValue %} data-i18n-options=\'{{cell.value|json}}\'{% endif %}{% endif %}>{% if cell.label %} <label{% if cell.label.key %} data-i18n="{{cell.label.key}}">{{cell.label.text}}{% else %}>{{cell.label}}{% endif %}</label> {% endif %}{% if cell.safe %}{{cell.value|safe}}{% else %}{% if cell|hasValue %}{{cell.value}}{% else %}{{cell}}{% endif %}{% endif %}</div> {% endfor %} </div> {% endif %} {% if data.buttons %} <ul class="buttons{% if data.buttons.class %} {{data.buttons.class}}{% endif %}"> {% for action in data.buttons.actions %} <li{% if action.class %} class="{{action.class}}"{% endif %} {% if action.attrs %}{% for attr, value in action.attrs %} {{attr}}="{{value}}"{% endfor %}{% endif %}><a href="#" data-id="{{action.id}}">{% if action.icon %}<i class="glyphicon glyphicon-{{action.icon}}"></i> {% endif %}{% if action.label.key %}<span data-i18n="{{action.label.key}}">{{action.label.text}}</span>{% else %}{{action.label}}{% endif %}</a></li> {% endfor %} </ul> {% if data.buttons.remove %} <div class="remove-dialog"> <div class="note"{% if data.buttons.remove.key %} data-i18n="{{data.buttons.remove.key}}">{{data.buttons.remove.text}}{% else %}>{{data.buttons.remove}}{% endif %}</div> <ul> <li class="confirm"><a href="#">כן</a></li> <li class="cancel"><a href="#" data-i18n="No">לא</a></li> </ul> <span class="info" >אזהרה: אין אפשרות לבטל את המחיקה</span> </div> {% endif %} {% endif %} </div> </div>')
            element: swig.compile('<div class="element-container {% if data.containerClass %}{{data.containerClass}}{% endif %}"> <div class="element{% if data.class %} {{data.class}}{% endif %}"{% if data.element.id %} data-id="{{data.element.id}}"{% endif %}{% if data.attrs %}{% for attr, value in data.attrs %} {{attr}}="{{value}}"{% endfor %}{% endif %}> {% if data.selectable %}<label class="selectable"><input type="checkbox"{% if data.selected %} checked="checked"{% endif %} /></label>{% endif %} {% if data.actions %} <div class="actions dropdown"> {% if data.actions|first %}<span class="dropdown-toggle"> <span data-i18n="GridActions">Actions</span> <i class="fa fa-angle-down"></i> <svg viewBox="0 0 24 24"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-dots-vertical"></use></svg> </span> <ul class="dropdown-menu"> {% for action in data.actions %} <li class="{% if action.class %}{{ action.class }}{% endif %}"><a href="#" data-id="{{action.id}}"{% if action.label.key %} data-i18n="{{action.label.key}}">{{action.label.text}}{% else %}>{{action.label}}{% endif %}</a></li> {% endfor %} </ul>{% endif %}</div> {% endif %} {% if data.fields %} <div class="fields"> {% for field in data.fields %} <div {% if field.attrs %}{% for attr, attrVal in field.attrs %} {{attr}}="{{attrVal}}"{% endfor %}{% endif %} class="field{% if field.type == "image" %} image{% endif %}{% if field.class %} {{field.class}}{% endif %}"> {% if field.type == "image" %} <img src="{{field.value}}" /> {% else %} {% if field.label %} <label{% if field.label.key %} data-i18n="{{field.label.key}}">{{field.label.text}}{% else %}>{{field.label}}{% endif %}</label> {% endif %} <span{% if field.valueClass %} class="{{field.valueClass}}"{% endif %}{% if field.i18n %} data-i18n="{{field.i18n}}"{% if field|hasValue %} data-i18n-options=\'{{field.value|json}}\'{% endif %}{% endif %}>{% if field|hasValue %}{{field.value}}{% else %}{{field}}{% endif %}</span> {% endif %} </div> {% endfor %} </div> {% endif %}{% if data.cells %} <div class="cells"> {% for index, cell in data.cells %} <div {% if cell.attrs %}{% for attr, attrVal in cell.attrs %} {{attr}}="{{attrVal}}"{% endfor %}{% endif %} class="cell col-{% if data.selectable %}{{index + 1}}{% else %}{{index}}{% endif %} {% if cell.class %} {{cell.class}}{% endif %}"{% if cell.i18n %} data-i18n="{{cell.i18n}}"{% if cell|hasValue %} data-i18n-options=\'{{cell.value|json}}\'{% endif %}{% endif %}>{% if cell.label %} <label{% if cell.label.key %} data-i18n="{{cell.label.key}}">{{cell.label.text}}{% else %}>{{cell.label}}{% endif %}</label> {% endif %}{% if cell.safe %}{{cell.value|safe}}{% else %}{% if cell|hasValue %}{{cell.value}}{% else %}{{cell}}{% endif %}{% endif %}</div> {% endfor %} </div> {% endif %} {% if data.buttons %} <ul class="buttons{% if data.buttons.class %} {{data.buttons.class}}{% endif %}"> {% for action in data.buttons.actions %} <li{% if action.class %} class="{{action.class}}"{% endif %} {% if action.attrs %}{% for attr, value in action.attrs %} {{attr}}="{{value}}"{% endfor %}{% endif %}><a href="#" data-id="{{action.id}}">{% if action.icon %}<i class="glyphicon glyphicon-{{action.icon}}"></i> {% endif %}{% if action.label.key %}<span data-i18n="{{action.label.key}}">{{action.label.text}}</span>{% else %}{{action.label}}{% endif %}</a></li> {% endfor %} </ul> {% if data.buttons.remove %} <div class="remove-dialog"> <div class="note"{% if data.buttons.remove.key %} data-i18n="{{data.buttons.remove.key}}">{{data.buttons.remove.text}}{% else %}>{{data.buttons.remove}}{% endif %}</div> <ul> <li class="confirm"><a href="#" data-i18n="Yes">Yes</a></li> <li class="cancel"><a href="#" data-i18n="No">No</a></li> </ul> <span class="info" data-i18n="GridDeleteInfo">Caution: This cannot be undone</span> </div> {% endif %} {% endif %} </div> </div>')
        };
        ref = this.constructor["default"];
        for (prop in ref) {
            value = ref[prop];
            this[prop] = value;
        }
        for (prop in settings) {
            value = settings[prop];
            if (prop in this) {
                this[prop] = value;
            }
        }
        tabManager = this;
        $(window).on('resize', function () {
            tabManager.contentResize();
            tabManager.renderTabs();
        });
        this.render();
    }

    TabManager.prototype.update = function (settings) {
        var prop, value;
        if (settings == null) {
            settings = {};
        }
        for (prop in settings) {
            value = settings[prop];
            if (prop in this) {
                this[prop] = value;
            }
        }
        this.render(true);
    };

    TabManager.prototype.makeFunction = function (func) {
        var e;
        if (typeof func === 'function') {
            return func;
        } else if (typeof func === 'string') {
            try {
                eval('func = ' + func);
            } catch (error1) {
                e = error1;
                console.error('function parse exception:', e);
            }
        } else {
            func = function () { };
        }
        return func;
    };

    TabManager.prototype.tabsToObject = function () {
        var tabs;
        tabs = this;
        return this.tabs.map(function (obj) {
            return tabs.stateFilter(obj);
        });
    };

    TabManager.prototype.stateFilter = function (data) {
        var j, len, prop, returnObj, value;
        returnObj = null;
        if (data instanceof Object) {
            if (data instanceof Array) {
                returnObj = [];
                for (j = 0, len = data.length; j < len; j++) {
                    value = data[j];
                    if (!(value instanceof $)) {
                        returnObj.push(this.stateFilter(value));
                    }
                }
            } else if (data instanceof Function) {
                returnObj = data.toString();
            } else {
                returnObj = {};
                for (prop in data) {
                    value = data[prop];
                    if (!(value instanceof jQuery || (value != null) && value.constructor.prototype.jquery) && prop.indexOf('_') !== 0) {
                        returnObj[prop] = this.stateFilter(value);
                    }
                }
            }
        } else {
            returnObj = data;
        }
        return returnObj;
    };

    TabManager.prototype.getState = function () {
        return {
            tabs: this.tabsToObject(),
            history: this.history,
            current: this.current
        };
    };

    TabManager.prototype.render = function (reset) {
        if (reset == null) {
            reset = false;
        }
        if ((this.navContainer != null) || reset) {
            this.renderTabs();
        }
        if ((this.filterContainer != null) || reset) {
            this.renderFilters();
        }
        if ((this.content != null) || reset) {
            this.renderContent();
        }
        this.selectTab(this.current);
    };

    TabManager.prototype.renderTabs = function () {
        var allTabs, index, j, k, l, len, len1, len2, ref, ref1, ref2, tabManager, tabsContainerWidth, tabsHidden, tabsVisible, tabsWidth, templateData;
        if (this.tabs.length) {
            tabManager = this;
            allTabs = [];
            ref = this.history;
            for (j = 0, len = ref.length; j < len; j++) {
                index = ref[j];
                allTabs.push(this.tabs[index]);
            }
            templateData = {
                tabsVisible: allTabs,
                tabsHidden: [],
                current: this.tabs[this.current].id,
                count: this.tabs.length,
                visibleCount: this.tabs.length
            };
            this.navContainer.html(this.templates.tabs($.extend({}, templateData)));
            this.parent.i18n(null, this.navContainer);
            tabsWidth = 0;
            tabsContainerWidth = this.navContainer.innerWidth() - this.navContainer.children('.list-more').outerWidth();
            this.visibleCount = 0;
            this.navContainer.children().not('.list-more').each(function () {
                var tabWidth;
                tabWidth = $(this).outerWidth();
                if (tabsWidth + tabWidth > tabsContainerWidth) {
                    return false;
                } else {
                    tabsWidth += tabWidth;
                    tabManager.visibleCount++;
                }
            });
            this.visible = this.history.slice(-this.tabs.length, this.visibleCount);
            tabsVisible = [];
            tabsHidden = [];
            ref1 = this.visible;
            for (k = 0, len1 = ref1.length; k < len1; k++) {
                index = ref1[k];
                tabsVisible.unshift(this.tabs[index]);
            }
            ref2 = this.history;
            for (l = 0, len2 = ref2.length; l < len2; l++) {
                index = ref2[l];
                if (this.visible.indexOf(index) === -1) {
                    tabsHidden.unshift(this.tabs[index]);
                }
            }
            templateData.visibleCount = this.visibleCount;
            templateData.tabsVisible = tabsVisible;
            templateData.tabsHidden = tabsHidden;
            this.navContainer.html(this.templates.tabs($.extend({}, templateData)));
            this.parent.i18n(null, this.navContainer);
            this.navContainer.find('.list-tabs').on('click', function (e) {
                if (e.hasOwnProperty('originalEvent')) {
                    e.originalEvent.namespace = 'popup-menu';
                }
                $(this).closest('.popup-menu-holder').find('.popup-menu').toggleClass('active');
            });
            this.navContainer.find('a').on('click', function (e) {
                e.preventDefault();
                if (e.hasOwnProperty('originalEvent')) {
                    e.originalEvent.closePopupMenu = true;
                }
                if ($(this).parent().hasClass('close-all')) {
                    tabManager.closeAllTabs();
                    $('#menu-icon').trigger(e);
                } else {
                    tabManager.selectTab($(this).attr('href').substr(1));
                    $('.filters-btn-tab').removeClass('active');
                }
            });
            this.navContainer.find('.close').on('click', function (e) {
                e.preventDefault();
                tabManager.close($(this).closest('li').children('a').attr('href').substr(1));
                if (!tabManager.tabs.length) {
                    $('#menu-icon').trigger(e);
                }
            });
        } else {
            this.navContainer.html('');
        }
    };

    TabManager.prototype.closeAllTabs = function () {
        var index, j, ref;
        for (index = j = ref = this.history.length; ref <= 0 ? j <= 0 : j >= 0; index = ref <= 0 ? ++j : --j) {
            this.close(this.history[index], false);
        }
        return this.render(true);
    };

    TabManager.prototype.renderFilters = function () {
        var index, j, len, ref, tab;
        this.filterContainer.children('li').addClass('not-exist');
        ref = this.tabs;
        for (index = j = 0, len = ref.length; j < len; index = ++j) {
            tab = ref[index];
            if ($("li[for=" + tab.id + "]", this.filterContainer).length) {
                $("li[for=" + tab.id + "]", this.filterContainer).removeClass('not-exist');
            } else {
                this.addFilters(index);
            }
        }
        this.filterContainer.children('li.not-exist').remove();
    };

    TabManager.prototype.switchType = function (tabIndex, type, force) {
        var currentTab, scrollContainer, tabManager;
        if (force == null) {
            force = false;
        }
        tabManager = this;
        currentTab = this.tabs[tabIndex];
        if (currentTab.load.viewType === type && !force) {
            return;
        }
        currentTab.load.viewType = type;
        currentTab.filterContainer.removeClass('grid list').addClass(type);
        currentTab.content.removeClass('grid list').addClass(type);
        scrollContainer = currentTab.content.getNiceScroll();
        if (scrollContainer.length) {
            scrollContainer[0].opt.railoffset.left = type === 'list' ? -5 : 10;
            scrollContainer[0].opt.railoffset.top = type === 'list' ? 0 : 15;
            scrollContainer[0].updateScrollBar();
            scrollContainer.resize();
        }
        this.parent.pushState();
        currentTab.content.scrollTop(0);
        setTimeout(function () {
            tabManager.contentResize();
        }, 0);
    };

    TabManager.prototype.cssRule = function (rule, style) {
        var attr, cssRule, index, j, k, len, len1, rulePos, ruleStyle, selector, sheet, sheetFile, sheets, value;
        if (!$('#tabManager_columns').length) {
            $('head').append($('<style />').attr({
                id: 'tabManager_columns',
                type: 'text/css'
            }));
        }
        if (document.styleSheets) {
            sheets = document.styleSheets;
            sheet = null;
            for (index = j = 0, len = sheets.length; j < len; index = ++j) {
                sheetFile = sheets[index];
                if ($(sheetFile.ownerNode).attr('id') === 'tabManager_columns') {
                    sheet = sheets[index];
                    break;
                }
            }
        }
        if (sheet.cssRules) {
            cssRule = sheet.cssRules;
        } else {
            cssRule = sheet.rules;
        }
        for (rulePos = k = 0, len1 = cssRule.length; k < len1; rulePos = ++k) {
            selector = cssRule[rulePos];
            if (selector.selectorText !== void 0 && selector.selectorText.toLowerCase() === rule) {
                if (sheet.cssRules) {
                    sheet.deleteRule(rulePos);
                } else {
                    sheet.removeRule(rulePos);
                }
                break;
            }
        }
        if (style != null) {
            rulePos = cssRule.length;
            ruleStyle = [];
            for (attr in style) {
                value = style[attr];
                ruleStyle.push(attr + ": " + value);
            }
            ruleStyle = ruleStyle.join(";\n");
            if (sheet.addRule) {
                sheet.addRule(rule, ruleStyle, rulePos);
            } else {
                sheet.insertRule(rule + " {" + ruleStyle, rulePos);
            }
        }
    };

    TabManager.prototype.cellsResize = function (tabIndex) {
        var autoWidth, buttonsWidth, column, columnWidth, element, index, j, k, l, len, len1, len2, len3, len4, len5, n, o, q, reduceRowWidth, ref, ref1, ref2, rowWidth, tab, tempElement, unit, width, widths;
        if (tabIndex == null) {
            tabIndex = null;
        }
        ref = this.tabs;
        for (index = j = 0, len = ref.length; j < len; index = ++j) {
            tab = ref[index];
            if (((tabIndex == null) || index === tabIndex) && (tab.load != null) && (tab.load.element != null) && (tab.load.columns != null) && (tab.load.viewType != null) && tab.load.viewType === 'list') {
                if (!tab.content.find('.elements').children().first().children('.element').length) {
                    this.addElement(tab, {}, true);
                    tempElement = tab.content.find('.elements').children().first();
                }
                element = tab.content.find('.elements').children().first().children('.element');
                rowWidth = element.width();
                if ((tab.load.element.actions != null) || (tab.load.element.buttons != null)) {
                    buttonsWidth = Math.max.apply(Math, tab.content.find('.elements .buttons').map(function () {
                        return $(this).width();
                    }).get());
                    rowWidth -= element.children('.actions').outerWidth() + buttonsWidth;
                }
                if (tempElement != null) {
                    tempElement.remove();
                }
                widths = (function () {
                    var k, ref1, results;
                    results = [];
                    for (k = 0, ref1 = tab.load.columns.length - 1; 0 <= ref1 ? k <= ref1 : k >= ref1; 0 <= ref1 ? k++ : k--) {
                        results.push(null);
                    }
                    return results;
                })();
                autoWidth = 0;
                ref1 = ['fixed', 'percent'];
                for (k = 0, len1 = ref1.length; k < len1; k++) {
                    unit = ref1[k];
                    reduceRowWidth = 0;
                    ref2 = tab.load.columns;
                    for (index = l = 0, len2 = ref2.length; l < len2; index = ++l) {
                        column = ref2[index];
                        if ((column.width != null) && !isNaN((columnWidth = parseFloat(column.width))) && columnWidth >= 0 && (columnWidth <= rowWidth || column.width.toString().indexOf('%') !== -1)) {
                            if ((column["class"] != null) && column["class"] === 'hide') {
                                widths[index] = 0;
                            } else if (unit === 'fixed' && column.width.toString().indexOf('%') === -1) {
                                widths[index] = columnWidth;
                                rowWidth -= columnWidth;
                            } else if (unit === 'percent' && column.width.toString().indexOf('%') !== -1) {
                                columnWidth = rowWidth * (columnWidth / 100);
                                widths[index] = columnWidth;
                                reduceRowWidth += columnWidth;
                            }
                        }
                    }
                    if (reduceRowWidth) {
                        rowWidth -= reduceRowWidth;
                    }
                }
                for (n = 0, len3 = widths.length; n < len3; n++) {
                    columnWidth = widths[n];
                    if (columnWidth == null) {
                        autoWidth++;
                    }
                }
                if (autoWidth) {
                    for (index = o = 0, len4 = widths.length; o < len4; index = ++o) {
                        columnWidth = widths[index];
                        if (columnWidth == null) {
                            widths[index] = rowWidth / autoWidth - 2;
                        }
                    }
                }
                for (index = q = 0, len5 = widths.length; q < len5; index = ++q) {
                    width = widths[index];
                    this.cssRule(this.content.selector + " #" + tab.id + " .col-" + index + ", " + this.filterContainer.selector + " [for=\"" + tab.id + "\"] .col-" + index, {
                        width: width + "px"
                    });
                }
            }
        }
    };

    TabManager.prototype.contentResize = function () {
        var index, j, len, ref, tab;
        this.content.outerHeight($(window).height() - (this.content.position().top + parseInt(this.content.parent().css('paddingBottom'))));
        this.cellsResize();
        ref = this.tabs;
        for (index = j = 0, len = ref.length; j < len; index = ++j) {
            tab = ref[index];
            this.afterRender(tab.id);
        }
    };

    TabManager.prototype.addFilters = function (tabIndex) {
        var action, addButton, cantAdd, check_mass, currentTab, fn, importOption, j, k, key, keys, keyupTimeout, l, len, len1, len2, len3, loginBIButton, n, option, ref, ref1, ref2, ref3, scrollUpButton, tabManager, view;
        tabManager = this;
        currentTab = this.tabs[tabIndex];
        keyupTimeout = null;
        if (!this.filterContainer.find("li[for=" + currentTab.id + "]").length) {
            currentTab.filterContainer = $('<li />', {
                "class": 'clearfix',
                "for": currentTab.id
            });
        }
        if (currentTab.load !== void 0 && currentTab.load.element) {
            $.ajax({
                data: {
                    tab_id: currentTab.tabId
                },
                url: "/system/display_type.aspx/get_type/",
                async: false,
                headers: {
                    'X-CSRFToken': global.csrf
                },
                success: function (response) {
                    return currentTab.is_list = response;
                }
            });
            view = {
                switcher: (currentTab.load.element.fields != null) && (currentTab.load.element.cells != null),
                type: currentTab.is_list ? 'list' : (currentTab.load.viewType != null ? currentTab.load.viewType : (currentTab.load.element.fields != null ? 'grid' : 'list')),
                columns: currentTab.load.columns != null ? currentTab.load.columns : null
            };
            if (currentTab.selected === void 0) {
                currentTab.selected = typeof currentTab.load.element.selectable !== void 0 && (currentTab.load.element.selectable != null) ? [] : null;
            }
            if ((currentTab.selected != null) && (view.columns != null) && view.columns.length && (view.columns[0].name != null) && view.columns[0].name !== 'selected') {
                view.columns.unshift({
                    name: 'selected',
                    label: '',
                    width: 25
                });
            }
        }
        cantAdd = (currentTab.permissions != null) && 'add' in currentTab.permissions && !currentTab.permissions['add'];
        if (currentTab.hasOwnProperty('filters') && currentTab.filters.hasOwnProperty('actions') && !cantAdd) {
            addButton = currentTab.filters.actions.find(function (action) {
                return action.id === 'add';
            });
        } else {
            addButton = null;
        }
        if (currentTab.hasOwnProperty('buttons')) {
            scrollUpButton = currentTab.buttons.find(function (action) {
                return action.id === 'scroll-up';
            });
            loginBIButton = currentTab.buttons.find(function (action) {
                return action.id === 'login-bi';
            });
        } else {
            scrollUpButton = null;
            loginBIButton = null;
        }
        if (currentTab.hasOwnProperty('filters')) {
            if (currentTab.filters.hideClass == null) {
                currentTab.filters.hideClass = '';
            }
            if (currentTab.filters.hasOwnProperty('options')) {
                importOption = currentTab.filters.options.find(function (option) {
                    return option.id === 'import';
                });
            } else {
                importOption = null;
            }
            if (importOption != null) {
                currentTab.filters.hideClass = 'show-filters';
            }
        }
        if (currentTab.hasOwnProperty('filters') && currentTab.filters.hasOwnProperty('filter_by')) {
            if (!(currentTab.filters.filter_by instanceof Array)) {
                currentTab.filters.filter_by = [
                    {
                        name: 'filter_by',
                        choices: currentTab.filters.filter_by
                    }
                ];
            }
        }
        currentTab.filterContainer.html($(tabManager.templates.filters({
            filters: currentTab.filters,
            view: view,
            addButton: addButton,
            scrollUpButton: scrollUpButton,
            loginBIButton: loginBIButton
        })));
        if (scrollUpButton) {
            currentTab.filterContainer.find(".floating-buttons > .btn.scrollup-button").click(function (e) {
                var callback;
                e.preventDefault();
                callback = tabManager.makeFunction(scrollUpButton.callback);
                return callback(currentTab, null);
            });
        }
        if (loginBIButton) {
            currentTab.filterContainer.find(".floating-buttons > .btn.login-bi-button").click(function (e) {
                var callback;
                e.preventDefault();
                callback = tabManager.makeFunction(loginBIButton.callback);
                return callback(currentTab, null);
            });
        }
        if ((view != null) && view.switcher === true) {
            if (view.type === 'grid') {
                currentTab.filterContainer.find('.glyphicon-th').removeClass('glyphicon-th').addClass('glyphicon-list');
            }
            currentTab.filterContainer.find('.view-button').click(function (e) {
                var data, spanSelected;
                e.preventDefault();
                currentTab.filterContainer.find('.floating-filters, .floating-filters-mass, .floating-orders, .floating-options').addClass('hide');
                spanSelected = $(this).find('span');
                if (spanSelected.hasClass('glyphicon-list')) {
                    tabManager.switchType(tabManager.current, 'list');
                    spanSelected.removeClass('glyphicon-list').addClass('glyphicon-th');
                } else {
                    tabManager.switchType(tabManager.current, 'grid');
                    spanSelected.removeClass('glyphicon-th').addClass('glyphicon-list');
                }
                data = {
                    tab_id: currentTab.tabId,
                    is_list: spanSelected.hasClass('glyphicon-list') === true ? 0 : 1
                };
                $.ajax({
                    data: data,
                    url: "/system/display_type.aspx",
                    headers: {
                        'X-CSRFToken': global.csrf
                    }
                });
            });
            currentTab.filterContainer.find('.columns .order').click(function (e) {
                var sortBy;
                $(this).parent().addClass('active');
                currentTab.filterContainer.find('.columns .order').removeClass('asc desc');
                sortBy = currentTab.filterContainer.find(".order_by .sorting tr #" + ($(this).attr('for')));
                if (sortBy.length) {
                    if (sortBy.hasClass('spanSelected') && currentTab.filters.data.order === 0) {
                        currentTab.filterContainer.find('.spanSelected').removeClass('spanSelected');
                        currentTab.filterContainer.find('.columns .order').filter("[for=" + ($(this).attr('for')) + "]").addClass('asc');
                        sortBy.last().addClass("spanSelected");
                        currentTab.filters.data.order = 1;
                    } else {
                        currentTab.filterContainer.find('.spanSelected').removeClass('spanSelected');
                        currentTab.filterContainer.find('.columns .order').filter("[for=" + ($(this).attr('for')) + "]").addClass('desc');
                        sortBy.first().addClass("spanSelected");
                        currentTab.filters.data.order = 0;
                    }
                    currentTab.filterContainer.find('.orderSelected').removeClass('orderSelected').addClass('orderNoSelected');
                    currentTab.filterContainer.find(".order_by .sorting tr[id=#tr" + ($(this).attr('for')) + "]").removeClass('orderNoSelected').addClass('orderSelected');
                    currentTab.filters.data.sorting = $(this).attr('for');
                    if ((currentTab.filters.callbacks != null) && (currentTab.filters.callbacks.sorting != null)) {
                        currentTab.filters.callbacks.sorting = tabManager.makeFunction(currentTab.filters.callbacks.sorting);
                        currentTab.filters.callbacks.sorting(currentTab, $(this));
                    } else {
                        tabManager.load(tabManager.current, true, void 0, false);
                    }
                }
            });
        } else {
            currentTab.filterContainer.find('.view-button').addClass('hide');
        }
        if (currentTab.filters != null) {
            keys = Object.keys(currentTab.filters).length;
            if (keys < 3 || (keys === 3 && currentTab.filters.hasOwnProperty('options'))) {
                currentTab.filterContainer.find('.filters-button, .filters-mass-button').addClass('hide');
            }
            if (currentTab.filters.data == null) {
                currentTab.filters.data = {};
                currentTab.filtersData = {};
            } else {
                currentTab.filtersData = {};
                ref = Object.keys(currentTab.filters.data);
                for (j = 0, len = ref.length; j < len; j++) {
                    key = ref[j];
                    currentTab.filtersData[key] = currentTab.filters.data[key];
                }
            }
            if (this.parent != null) {
                this.parent.i18n(null, currentTab.filterContainer);
            }
            this.content.on('keydown.tab-pane', function (e) {
                var current;
                if (!(e.which === 88 && e.ctrlKey)) {
                    return true;
                }
                current = tabManager.tabs[tabManager.current];
                current.filterContainer.find('.clear-all').trigger('click');
                $('.filters-button', current.filterContainer).removeClass('selected');
                return false;
            });
            this.filterContainer.on('keydown.floating-filters', function (e) {
                var current, currentElement, nextElement;
                if (!(e.which === 9) || e.shiftKey === true) {
                    return true;
                }
                current = tabManager.tabs[tabManager.current];
                if (currentTab === current) {
                    currentElement = $(document.activeElement).closest('.filter_by');
                    if (currentElement) {
                        currentElement.children('div.filter-wrapper').removeClass('open');
                    }
                    nextElement = $(document.activeElement).closest('.date, .combo-filter, .search, .filter_by').next();
                    if (nextElement.hasClass('combo-filter') && (nextElement.find('input.select-input').is(':disabled') || nextElement.hasClass('hide-combo-filter'))) {
                        nextElement = nextElement.next();
                    }
                    if (nextElement.hasClass('search')) {
                        nextElement.children('.editable').first().focus();
                    } else {
                        if (nextElement.hasClass('combo-filter')) {
                            nextElement.find('input.select-input').first().focus();
                        } else {
                            if (nextElement.hasClass('search')) {
                                nextElement.children('input[name="search"]').focus();
                            } else {
                                if (nextElement.hasClass('filter_by')) {
                                    nextElement.children('div.filter-wrapper').addClass('open');
                                    nextElement.find('li.active a').first().focus();
                                } else {
                                    if (nextElement.hasClass('date')) {
                                        nextElement.find('.hasDatePicker').first().focus();
                                    }
                                }
                            }
                        }
                    }
                    return false;
                }
            });
            currentTab.filterContainer.find('.date input').each(function () {
                var dateInput;
                dateInput = $(this);
                dateInput.datepicker(tabManager.datePickerOptions);
                dateInput.addClass('hasDatePicker').next('.datepicker-trigger').click(function () {
                    dateInput.datepicker('show');
                });
                if (dateInput.val()) {
                    dateInput.datepicker('setDate', new Date(dateInput.val()));
                    return setTimeout(function () {
                        dateInput.trigger('change');
                        if ((currentTab.filters.callbacks != null) && (currentTab.filters.callbacks.date != null)) {
                            currentTab.filters.callbacks.date = tabManager.makeFunction(currentTab.filters.callbacks.date);
                            currentTab.filters.callbacks.date(currentTab, dateInput);
                        }
                        dateInput.datepicker('update');
                    }, 0);
                }
            });
            currentTab.filterContainer.find('.date .time-picker').each(function () {
                var timeInput;
                timeInput = $(this);
                timeInput.datetimepicker({
                    format: 'HH:mm'
                });
                timeInput.addClass('hasTimePicker');
                if (timeInput.val()) {
                    return setTimeout(function () {
                        timeInput.trigger('change');
                        if ((currentTab.filters.callbacks != null) && (currentTab.filters.callbacks.time != null)) {
                            currentTab.filters.callbacks.time = tabManager.makeFunction(currentTab.filters.callbacks.time);
                            currentTab.filters.callbacks.time(currentTab, timeInput);
                        }
                    }, 0);
                }
            });
            currentTab.filterContainer.find('.combo-filter span').click(function (e) {
                return $(this).next().data('select').set(null, '');
            });
            currentTab.filterContainer.find('.combo-filter select').each(function () {
                return $(this).data('select', new Select(this));
            });
            currentTab.filterContainer.find('.combo-filter select').change(function (e) {
                var cb, comboFilter, filter, filterText, k, len1, ref1, select;
                select = $(e.target).data('select');
                filter = select.element.attr('name');
                if (!currentTab.filters.data.hasOwnProperty(filter) || (currentTab.filters.data[filter] == null)) {
                    currentTab.filters.data[filter] = null;
                }
                if (select.current.id) {
                    currentTab.filters.data[filter] = select.current.id;
                } else {
                    currentTab.filters.data[filter] = null;
                }
                filterText = select.current.text;
                ref1 = currentTab.filters.filtersCombo;
                for (k = 0, len1 = ref1.length; k < len1; k++) {
                    comboFilter = ref1[k];
                    if ((comboFilter.name != null) && comboFilter.name === filter) {
                        comboFilter.text = filterText;
                        comboFilter.callback = tabManager.makeFunction(comboFilter.callback);
                        cb = comboFilter.callback(currentTab, select);
                        if ((cb != null) && !cb) {
                            return;
                        }
                        tabManager.load(tabManager.current, true);
                    }
                }
            });
            currentTab.filterContainer.find('.date .hasDatePicker').change(function () {
                var date, filter;
                if (currentTab.filters.data.date == null) {
                    currentTab.filters.data.date = {};
                }
                filter = null;
                if ($(this).val()) {
                    date = $(this).datepicker('getDate');
                    if (date != null) {
                        filter = (date.getFullYear()) + "-" + (('0' + (date.getMonth() + 1)).substr(-2)) + "-" + (('0' + date.getDate()).substr(-2));
                    }
                }
                if (currentTab.filters.data.date[$(this).attr('name')] === filter) {
                    return;
                }
                currentTab.filters.data.date[$(this).attr('name')] = filter;
                if ((currentTab.filters.callbacks != null) && (currentTab.filters.callbacks.date != null)) {
                    currentTab.filters.callbacks.date = tabManager.makeFunction(currentTab.filters.callbacks.date);
                    currentTab.filters.callbacks.date(currentTab, $(this));
                } else {
                    tabManager.load(tabManager.current, true);
                }
            });
            currentTab.filterContainer.find('.time .hasTimePicker').on('dp.change', function () {
                var filter, time;
                if (currentTab.filters.data.time == null) {
                    currentTab.filters.data.time = {};
                }
                filter = null;
                if ($(this).val()) {
                    time = $(this).val();
                    if (time != null) {
                        filter = time;
                    }
                }
                if (currentTab.filters.data.time[$(this).attr('name')] === filter) {
                    return;
                }
                currentTab.filters.data.time[$(this).attr('name')] = filter;
                if ((currentTab.filters.callbacks != null) && (currentTab.filters.callbacks.time != null)) {
                    currentTab.filters.callbacks.time = tabManager.makeFunction(currentTab.filters.callbacks.time);
                    currentTab.filters.callbacks.time(currentTab, $(this));
                } else {
                    tabManager.load(tabManager.current, true);
                }
            });
            currentTab.filterContainer.find('.date .hasDatePicker').keyup(function (e) {
                var _keyupTimeout, dateInput, ref1;
                if ((ref1 = e.keyCode) === 13 || ref1 === 9) {
                    return;
                }
                dateInput = $(this);
                clearTimeout(_keyupTimeout);
                if (dateInput.val().length === 0 || dateInput.val().length === tabManager.datePickerOptions.format.length) {
                    _keyupTimeout = setTimeout(function () {
                        dateInput.trigger('change');
                        dateInput.datepicker('update', dateInput.val());
                    }, 500);
                }
            });
            currentTab.filterContainer.find('.date .hasDatePicker').on('keydown blur', function (e) {
                var c, change, changeValue, date, dateFormat, i, k, l, len1, now, ref1, ref2, restOfYear, val;
                if (e.type === 'blur' || e.type === 'keydown' && ((ref1 = e.keyCode) === 13 || ref1 === 9)) {
                    now = new Date();
                    date = {
                        d: '',
                        m: '',
                        y: ''
                    };
                    dateFormat = tabManager.datePickerOptions.format.replace(/[^\w]/g, '');
                    val = $(this).val();
                    if (val.match(/^(\+|-)\d+$/g)) {
                        now.setDate(now.getDate() + parseInt(val));
                    } else if (val.match(/^\d+$/)) {
                        for (i = k = 0, len1 = dateFormat.length; k < len1; i = ++k) {
                            c = dateFormat[i];
                            if (i < val.length) {
                                date[c] += val[i];
                            }
                        }
                        if (date.y.length !== 4) {
                            restOfYear = '';
                            for (i = l = 0, ref2 = 4 - date.y.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
                                restOfYear += now.getFullYear().toString()[i];
                            }
                            date.y = restOfYear + date.y;
                        }
                    } else if (val.match(/^((\+|-)(\d+)(d|m|y)){1,3}$/ig)) {
                        while (change = val.match(/((\+|-)(\d+)(d|m|y))/i)) {
                            change = change[0];
                            val = val.replace(change, '');
                            changeValue = parseInt(change.slice(0, -1));
                            if (change.toLowerCase().slice(-1) === 'd') {
                                now.setDate(now.getDate() + changeValue);
                            }
                            if (change.toLowerCase().slice(-1) === 'm') {
                                now.setMonth(now.getMonth() + changeValue);
                            }
                            if (change.toLowerCase().slice(-1) === 'y') {
                                now.setFullYear(now.getFullYear() + changeValue);
                            }
                        }
                    } else {
                        return;
                    }
                    if (!date.d && $(this).hasClass('no-day')) {
                        date.d = 1;
                    }
                    if (date.d) {
                        now.setDate(parseInt(date.d));
                    }
                    if (date.m) {
                        now.setMonth(parseInt(date.m) - 1);
                    }
                    if (date.y) {
                        now.setFullYear(parseInt(date.y));
                    }
                    $(this).datepicker('setDate', now);
                    $(this).datepicker('update');
                    $(this).trigger('change');
                }
            });
            currentTab.filterContainer.find('.search input').keyup(function (e) {
                var fieldName, ref1;
                if ((ref1 = e.keyCode) === 13 || ref1 === 9) {
                    return;
                }
                fieldName = $(this).attr('name');
                currentTab.filters.data[fieldName] = $(this).val();
                if ($(this).val()) {
                    $(this).addClass('selected');
                } else {
                    $(this).removeClass('selected');
                }
                if ((currentTab.filters.callbacks != null) && (currentTab.filters.callbacks.searching != null)) {
                    currentTab.filters.callbacks.searching = tabManager.makeFunction(currentTab.filters.callbacks.searching);
                    currentTab.filters.callbacks.searching(currentTab, $(this));
                } else {
                    clearTimeout(keyupTimeout);
                    if ($(this).val()) {
                        keyupTimeout = setTimeout(function () {
                            tabManager.load(tabManager.current, true);
                        }, 1000);
                    } else {
                        keyupTimeout = setTimeout(function () {
                            tabManager.load(tabManager.current, true);
                        }, 0);
                    }
                }
            });
            currentTab.filterContainer.find('.filter_by input').change(function () {
                var filter_by_name;
                filter_by_name = $(this).closest('div.filter_by').data('name');
                if (currentTab.filters.data.filter_by == null) {
                    currentTab.filters.data[filter_by_name] = null;
                }
                if ($(this).is(':checked')) {
                    currentTab.filters.data[filter_by_name] = 1;
                } else {
                    currentTab.filters.data[filter_by_name] = 0;
                }
                if ((currentTab.filters.callbacks != null) && (currentTab.filters.callbacks.filtering != null)) {
                    currentTab.filters.callbacks.filtering = tabManager.makeFunction(currentTab.filters.callbacks.filtering);
                    currentTab.filters.callbacks.filtering(currentTab, $(this));
                } else {
                    tabManager.load(tabManager.current, true);
                }
            });
            currentTab.filterContainer.find('.filter_by .filter li a').click(function (e) {
                var filter_by_name;
                e.preventDefault();
                filter_by_name = $(this).closest('div.filter_by').data('name');
                $(this).closest('.filter-wrapper').find('.select').children('span.span_txt').text($(this).text());
                $(this).closest('ul').children().removeClass('active');
                $(this).parent().addClass('active');
                currentTab.filters.data[filter_by_name] = $(this).attr('href');
                if ((currentTab.filters.callbacks != null) && (currentTab.filters.callbacks.filtering != null)) {
                    currentTab.filters.callbacks.filtering = tabManager.makeFunction(currentTab.filters.callbacks.filtering);
                    currentTab.filters.callbacks.filtering(currentTab, $(this));
                } else {
                    tabManager.load(tabManager.current, true);
                }
            });
            currentTab.filterContainer.find('.order_by .sorting tr td button').click(function (e) {
                var button;
                e.preventDefault();
                button = $(this);
                currentTab.filterContainer.find('.floating-orders').addClass('hide');
                button.parent().addClass('active');
                currentTab.filters.data.order = button.attr('id') === 'asc' ? 1 : 0;
                currentTab.filters.data.sorting = button.find('span').attr('id');
                currentTab.filterContainer.find('.columns .order').removeClass('asc desc').filter("[for=" + currentTab.filters.data.sorting + "]").addClass(button.attr('id'));
                if ((currentTab.filters.callbacks != null) && (currentTab.filters.callbacks.sorting != null)) {
                    currentTab.filters.callbacks.sorting = tabManager.makeFunction(currentTab.filters.callbacks.sorting);
                    currentTab.filters.callbacks.sorting(currentTab, $(this));
                } else {
                    tabManager.load(tabManager.current, true, void 0, false);
                }
            });
            currentTab.filterContainer.find('.order_by .sorting tr td button span').click(function (e) {
                e.preventDefault();
                currentTab.filterContainer.find('.orderSelected').removeClass('orderSelected').addClass('orderNoSelected');
                $(this).closest("tr").removeClass('orderNoSelected').addClass('orderSelected');
                currentTab.filterContainer.find('.spanSelected').removeClass('spanSelected');
                $(this).addClass('spanSelected');
            });
            currentTab.filterContainer.find('.clear-all').click(function (e) {
                currentTab.filterContainer.find('.search input').val('');
                currentTab.filterContainer.find('.search input').trigger('keyup');
                currentTab.filterContainer.find('.select-container input').each(function () {
                    if (!this.hasAttribute('disabled')) {
                        return $(this).val('');
                    }
                });
                currentTab.filterContainer.find('.combo-filter select').each(function () {
                    if (!this.hasAttribute('disabled')) {
                        return $(this).data('select').set(null, '');
                    }
                });
                currentTab.filterContainer.find('.filter_by').each(function () {
                    var filter_by_val;
                    filter_by_val = currentTab.filtersData[$(this).data('name')];
                    if (filter_by_val) {
                        return $(this).find('.filter li a[href=' + filter_by_val + ']').trigger('click');
                    } else {
                        return $(this).find('.filter li:first-child a').trigger('click');
                    }
                });
                currentTab.filterContainer.find('.date .hasDatePicker').val('');
                currentTab.filterContainer.find('.date .hasTimePicker').val('');
                currentTab.filterContainer.find('.date .hasDatePicker').trigger('change');
                currentTab.filterContainer.find('.date .hasTimePicker').trigger('change');
            });
            currentTab.filterContainer.find('.btn-close').click(function (e) {
                var filters;
                filters = currentTab.filterContainer.find('.floating-filters');
                filters.addClass('hide');
                if (filters.find('.selected, .filter_by').length) {
                    $('.filters-button', currentTab.filterContainer).addClass('selected');
                }
                filters.find('.clear-all').css('margin-left', "0px");
            });
            if (currentTab.filters.hasOwnProperty('options')) {
                currentTab.filterContainer.find('.list-group .list-group-item a').click(function (e) {
                    e.preventDefault();
                    currentTab.filterContainer.find('.floating-options').toggleClass('hide');
                });
                ref1 = currentTab.filters.options;
                fn = function (option) {
                    var callback;
                    if (option.callback != null) {
                        callback = tabManager.makeFunction(option.callback);
                        return currentTab.filterContainer.find(".options [data-id=" + option.id + "]").click(function (e) {
                            e.preventDefault();
                            return callback(currentTab);
                        });
                    }
                };
                for (k = 0, len1 = ref1.length; k < len1; k++) {
                    option = ref1[k];
                    fn(option);
                }
            } else {
                currentTab.filterContainer.find('.options-button').addClass('hide');
            }
            if (currentTab.filters.order === void 0) {
                currentTab.filterContainer.find('.orders-button').addClass('hide');
            }
            if (currentTab.filters.actions != null) {
                if (currentTab.filterContainer.find('.floating-filters .actions').children(':visible').length === 0) {
                    currentTab.filterContainer.find('.floating-filters .actions').addClass('hide');
                }
                check_mass = false;
                ref2 = currentTab.filters.actions;
                for (l = 0, len2 = ref2.length; l < len2; l++) {
                    action = ref2[l];
                    if (action.hasOwnProperty('massaction')) {
                        check_mass = true;
                    }
                }
                if (check_mass === false) {
                    currentTab.filterContainer.find('.filters-mass-button').addClass('hide');
                }
            } else {
                currentTab.filterContainer.find('.filters-mass-button').addClass('hide');
            }
            if (currentTab.filters.actions != null) {
                ref3 = currentTab.filters.actions;
                for (n = 0, len3 = ref3.length; n < len3; n++) {
                    action = ref3[n];
                    if ((currentTab.permissions != null) && action.id in currentTab.permissions && !currentTab.permissions[action.id]) {
                        currentTab.filterContainer.find(".actions [data-id=" + action.id + "]").addClass('no-permission');
                    } else {
                        (function (action) {
                            var btn, btn_mass, callback;
                            switch (action.id) {
                                case 'select_all':
                                case 'deselect_all':
                                    currentTab.filterContainer.find(".actions_mass [data-id=" + action.id + "]").click(function (e) {
                                        var act, btn, callback, cb, len4, o, ref4;
                                        e.preventDefault();
                                        if (action.callback != null) {
                                            callback = tabManager.makeFunction(action.callback);
                                            cb = callback(currentTab, action.id === 'select_all');
                                            if ((cb != null) && !cb) {
                                                return;
                                            }
                                        }
                                        currentTab.selected = action.id === 'select_all' ? ['all'] : [];
                                        currentTab.content.children('.elements').children('.element-container').children('.element').children('.selectable').children().prop('checked', action.id === 'select_all');
                                        tabManager.parent.pushState();
                                        ref4 = currentTab.filters.actions;
                                        for (o = 0, len4 = ref4.length; o < len4; o++) {
                                            act = ref4[o];
                                            if (act.selectable !== void 0 && act.selectable) {
                                                btn = currentTab.filterContainer.find(".actions_mass [data-id=" + act.id + "]");
                                                if (currentTab.selected.length) {
                                                    btn.removeClass('disabled');
                                                    btn.addClass('display-block');
                                                } else {
                                                    btn.addClass('disabled');
                                                    btn.removeClass('display-block');
                                                }
                                            }
                                        }
                                    });
                                    break;
                                default:
                                    if (action.callback != null) {
                                        callback = tabManager.makeFunction(action.callback);
                                        btn = currentTab.filterContainer.find(".actions [data-id=" + action.id + "]").click(function (e) {
                                            e.preventDefault();
                                            if (action.selectable !== void 0 && action.selectable) {
                                                callback(currentTab, {
                                                    selected: currentTab.selected,
                                                    filters: currentTab.filters.data
                                                });
                                            } else {
                                                callback(currentTab, null);
                                            }
                                        });
                                        btn_mass = currentTab.filterContainer.find(".actions_mass [data-id=" + action.id + "]").click(function (e) {
                                            e.preventDefault();
                                            if (action.selectable !== void 0 && action.selectable) {
                                                callback(currentTab, {
                                                    selected: currentTab.selected,
                                                    filters: currentTab.filters.data
                                                });
                                            } else {
                                                callback(currentTab, null);
                                            }
                                        });
                                        if (action.selectable !== void 0 && action.selectable) {
                                            if ((currentTab.selected != null) && currentTab.selected.length) {
                                                btn.removeClass('disabled');
                                                btn_mass.removeClass('disabled');
                                                btn_mass.addClass('display-block');
                                            } else {
                                                btn.addClass('disabled');
                                                btn_mass.addClass('disabled');
                                                btn_mass.removeClass('display-block');
                                            }
                                        }
                                        return;
                                    }
                            }
                        })(action);
                    }
                }
            }
            if (addButton) {
                currentTab.filterContainer.find(".floating-buttons > .btn.add-button").click(function (e) {
                    var callback;
                    e.preventDefault();
                    currentTab.filterContainer.find('.floating-filters, .floating-options, .floating-orders').addClass('hide');
                    callback = tabManager.makeFunction(addButton.callback);
                    return callback(currentTab, $(this));
                });
            }
            currentTab.filterContainer.find(".floating-buttons > .btn.filters-button").click(function (e) {
                var documentWidth, elementOffset, filters, firstFilter;
                e.preventDefault();
                filters = currentTab.filterContainer.find('.floating-filters').toggleClass('hide');
                if (filters.hasClass('hide') && filters.find('.selected, .filter_by').length) {
                    $('.filters-button', currentTab.filterContainer).addClass('selected');
                } else {
                    $('.filters-button', currentTab.filterContainer).removeClass('selected');
                }

                if (global.user.current_language_code !== 'he') {
                    currentTab.filterContainer.find('.floating-filters').css('left', (e.currentTarget.offsetLeft + 12) + "px");
                    filters.find('.clear-all').css('margin-left', (filters[0].offsetWidth - 60) + "px");
                } else {
                    documentWidth = $(document).width();
                    elementOffset = $(e.currentTarget).offset();
                    currentTab.filterContainer.find('.floating-filters').css('right', (documentWidth - elementOffset.left - 50) + "px");
                    filters.find('.clear-all').css('margin-right', (filters[0].offsetWidth - 52) + "px");
                }
                currentTab.filterContainer.find('.floating-orders, .floating-options, .floating-filters-mass').addClass('hide');
                if (!filters.hasClass('hide')) {
                    firstFilter = filters.children().not('.div-header-filters').first();
                    if (firstFilter.hasClass('combo-filter') && (firstFilter.find('input.select-input').is(':disabled') || firstFilter.hasClass('hide-combo-filter'))) {
                        firstFilter = firstFilter.next();
                    }
                    if (firstFilter.hasClass('extra-search')) {
                        return filters.find('div.search .editable').first().focus();
                    } else {
                        if (firstFilter.hasClass('combo-filter')) {
                            return firstFilter.find('input.select-input').first().focus();
                        } else {
                            if (firstFilter.hasClass('search')) {
                                return filters.find('input[name="search"]').focus();
                            }
                        }
                    }
                }
            });
            currentTab.filterContainer.find(".floating-buttons > .btn.filters-mass-button").click(function (e) {
                var documentWidth, elementOffset;
                e.preventDefault();
                currentTab.filterContainer.find('.floating-filters-mass').toggleClass('hide');
                if (global.user.current_language_code !== 'he') {
                    currentTab.filterContainer.find('.floating-filters-mass').css('left', (e.currentTarget.offsetLeft + 12) + "px");
                } else {
                    documentWidth = $(document).width();
                    elementOffset = $(e.currentTarget).offset();
                    currentTab.filterContainer.find('.floating-filters-mass').css('right', (documentWidth - elementOffset.left - 50) + "px");
                }
                currentTab.filterContainer.find('.floating-filters, .floating-orders, .floating-options').addClass('hide');
                return currentTab.filterContainer.find('.floating-filters, .floating-orders, .floating-options').addClass('hide');
            });
            currentTab.filterContainer.find(".floating-buttons > .btn.orders-button").click(function (e) {
                var documentWidth, elementOffset;
                e.preventDefault();
                currentTab.filterContainer.find('.floating-orders').toggleClass('hide');
                if (global.user.current_language_code !== 'he') {
                    currentTab.filterContainer.find('.floating-orders').css('left', (e.currentTarget.offsetLeft + 10) + "px");
                } else {
                    documentWidth = $(document).width();
                    elementOffset = $(e.currentTarget).offset();
                    currentTab.filterContainer.find('.floating-orders').css('right', (documentWidth - elementOffset.left - 50) + "px");
                }
                currentTab.filterContainer.find('.floating-filters, .floating-filters-mass, .floating-options').addClass('hide');
                return currentTab.filterContainer.find('.floating-filters, .floating-filters-mass, .floating-options').addClass('hide');
            });
            currentTab.filterContainer.find(".floating-buttons > .btn.options-button").click(function (e) {
                var documentWidth, elementOffset;
                e.preventDefault();
                currentTab.filterContainer.find('.floating-options').toggleClass('hide');
                if (global.user.current_language_code !== 'he') {
                    currentTab.filterContainer.find('.floating-options').css('left', (e.currentTarget.offsetLeft + 10) + "px");
                } else {
                    documentWidth = $(document).width();
                    elementOffset = $(e.currentTarget).offset();
                    currentTab.filterContainer.find('.floating-options').css('right', (documentWidth - elementOffset.left - 50) + "px");
                }
                currentTab.filterContainer.find('.floating-filters, .floating-filters-mass, .floating-orders').addClass('hide');
                return currentTab.filterContainer.find('.floating-filters, .floating-filters-mass, .floating-orders').addClass('hide');
            });
        } else {
            currentTab.filterContainer.find('.filters-button').addClass('hide');
            currentTab.filterContainer.find('.filters-mass-button').addClass('hide');
            currentTab.filterContainer.find('.orders-button').addClass('hide');
            currentTab.filterContainer.find('.options-button').addClass('hide');
        }
        $('#hide-buttons', currentTab.filterContainer).click(function () {
            return $('.floating-buttons', currentTab.filterContainer).toggleClass('hidden-buttons');
        });
        $('.btn-search', currentTab.filterContainer).click(function (e) {
            var input;
            input = $(e.target).closest('div.search').find('input');
            return input.val('').trigger('keyup').focus();
        });
        this.filterContainer.append(currentTab.filterContainer);
        setTimeout(function () {
            if (!$('.floating-buttons > .btn:not(.scrollup-button):visible', currentTab.filterContainer).length) {
                return $('#hide-buttons', currentTab.filterContainer).hide();
            }
        }, 0);
    };

    TabManager.prototype.renderContent = function () {
        var index, j, len, ref, tab;
        this.content.children('li').removeClass('tab-pane');
        ref = this.tabs;
        for (index = j = 0, len = ref.length; j < len; index = ++j) {
            tab = ref[index];
            if (this.content.children("#" + tab.id).length) {
                this.content.children("#" + tab.id).addClass('tab-pane');
            } else {
                this.addContent(index);
            }
        }
        this.content.children('li').not('.tab-pane').remove();
    };

    TabManager.prototype.add = function (tabObj) {
        var index, j, len, ref, tab;
        ref = this.tabs;
        for (index = j = 0, len = ref.length; j < len; index = ++j) {
            tab = ref[index];
            if (tab.id === tabObj.id) {
                this.selectTab(index);
                return;
            }
        }
        this.tabs.push(tabObj);
        if ((this.current != null) && (this.tabs[this.current] != null) && (this.tabs[this.current]._table != null)) {
            if (this.tabs[this.current]._table.body.getNiceScroll().length) {
                this.tabs[this.current]._table.body.getNiceScroll().hide();
            }
        }
        this.current = this.tabs.length - 1;
        this.render(true);
    };

    TabManager.prototype.RefreshTab = function (RefSec, Curr) {
        var DateNow, tabManager;
        tabManager = this;
        if (Curr === this.current) {
            DateNow = new Date();
            if (Math.round(DateNow.getMinutes() - this.ClickDateLast.getMinutes()) > 10) {
                tabManager.load(this.current, true);
            }
            setTimeout(function () {
                tabManager.RefreshTab(RefSec, Curr);
            }, RefSec);
        }
    };

    TabManager.prototype.UpClickDate = function () {
        this.ClickDateLast = new Date();
    };

    TabManager.prototype.load = function (index, reset, loadNext, isFilter) {
        var load, prop, ref, sendData, tab, tabManager, val;
        if (reset == null) {
            reset = false;
        }
        if (loadNext == null) {
            loadNext = 0;
        }
        if (isFilter == null) {
            isFilter = true;
        }
        tabManager = this;
        if (typeof index === 'string') {
            tab = tabManager.getTabOrTable(index);
        } else if (typeof index === 'object') {
            tab = index;
        } else {
            tab = this.tabs[index];
        }
        if (!tab || (tab.load == null)) {
            return;
        }
        load = tab.load;
        if (tab.load.data == null) {
            load.data = {};
        }
        if (reset) {
            tab.content.scrollTop(0);
            if (tab._ajax != null) {
                tab._ajax.abort();
            }
            if (load.element != null) {
                if ((tab.selected != null) && isFilter) {
                    tab.filterContainer.find(".actions_mass [data-id=deselect_all]").trigger('click');
                }
                tab.content.find('.elements').html('');
                delete load._list;
                delete load._start;
            } else {
                tab.content.html('');
            }
            delete load._loadMore;
            this.parent.pushState();
        }
        if (tab.filters.data != null) {
            ref = tab.filters.data;
            for (prop in ref) {
                val = ref[prop];
                load.data[prop] = val;
            }
        }
        if (load._loadMore == null) {
            load._loadMore = true;
        }
        if ((tab._ajax == null) && load._loadMore) {
            tab.content.addClass('loading');
            if ((tab.load.checkElement != null) && tab.load.checkElement !== 'function') {
                tab.load.checkElement = this.makeFunction(tab.load.checkElement);
            }
            if (load.element != null) {
                if ((load.onGetData != null) && load.onGetData !== 'function') {
                    load.onGetData = tabManager.makeFunction(load.onGetData);
                }
                if ((load.elementWrapper != null) && load.onGetData !== 'function') {
                    load.elementWrapper = tabManager.makeFunction(load.elementWrapper);
                }
                if (load._list == null) {
                    load._list = [];
                }
                load._start = load._list.length;
            } else if (load.callback != null) {
                load.callback = tabManager.makeFunction(load.callback);
            }
            load._loadMore = false;
            sendData = $.extend(true, {}, load.data);
            if (tab.load.element != null) {
                sendData = $.extend(true, sendData, {
                    start: load._start,
                    length: loadNext ? loadNext : tabManager.loadLength
                });
            }
            if ((sendData.start != null) && sendData.start === 0 || (sendData.start == null)) {
                sendData.addLog = true;
            }
            tab._ajax = $.ajax({
                url: load.url,
                type: 'post',
                data: JSON.stringify({ 'listData': sendData }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response, status, request) {
                    try {
                        response = JSON.parse(response.d);
                    }
                    catch {
                        response = response.d;
                    }
                    var append, cb, content, element, elementsInRow, i, j, k, len, length;
                    BaseManager.serverError(response);
                    tab._ajax = null;
                    tab.content.removeClass('loading');
                    if (load.hasOwnProperty('element')) {
                        if (load._start === 0) {
                            tab.content.find('.elements').html('');
                        }
                        if (load.onGetData != null) {
                            response = load.onGetData(response, tab);
                        }
                        elementsInRow = 0;
                        for (i = j = 0; j <= 9; i = ++j) {
                            if (!window.matchMedia('(min-width: ' + (245 * (i + 1) + 110) + 'px)').matches) {
                                break;
                            }
                            elementsInRow = i + 1;
                        }
                        length = parseInt((load._start + response.length) / elementsInRow) * elementsInRow - load._start;
                        if (length < (parseInt(tabManager.loadLength / elementsInRow) * elementsInRow)) {
                            length = tabManager.loadLength;
                        }
                        if (response == "-1") {
                            alert("The system must be reconnected");
                            window.location.href = "Default.aspx";
                            return;
                        }
                        response = response.slice(0, length);
                        Array.prototype.push.apply(load._list, response);
                        append = '';
                        for (k = 0, len = response.length; k < len; k++) {
                            element = response[k];
                            append = tabManager.addElement(tab, element, false, append);
                        }
                        append = $(append);
                        if (tabManager.parent != null) {
                            tabManager.parent.i18n(null, append);
                        }
                        tab.content.children('.elements').append(append);
                        load._total = request.getResponseHeader('Count-Elements') != null ? parseInt(request.getResponseHeader('Count-Elements')) : null;
                        if (!load._list.length) {
                            if ((load._total != null) && !load._total && tabManager.current === index) {
                                tab.filterContainer.addClass('disabled no-results');
                                tab.content.removeClass('no-results').addClass('no-elements');
                                tab.filterContainer.find(".floating-buttons > .btn.add-button").trigger('click');
                            } else {
                                tab.filterContainer.removeClass('disabled').addClass('no-results');
                                tab.content.removeClass('no-elements').addClass('no-results');
                            }
                        } else {
                            tab.filterContainer.removeClass('disabled no-results');
                            tab.content.removeClass('no-elements no-results');
                            if (load._start === 0 && tabManager.current === index) {
                                tabManager.cellsResize(index);
                            }
                            if (load._start + (loadNext ? loadNext : parseInt((load._start + tabManager.loadLength) / elementsInRow) * elementsInRow - load._start) === load._list.length) {
                                load._loadMore = true;
                                tab.content.trigger('scroll');
                            }
                        }
                        tabManager.afterRender(tab.id);
                    } else {
                        content = $(response);
                        if (load.callback != null) {
                            cb = load.callback(content, tab);
                            if ((cb != null) && !cb) {
                                return;
                            }
                        }
                        if (tabManager.parent != null) {
                            tabManager.parent.i18n(null, content);
                        }
                        tab.content.html(content);
                    }
                    tab.content.getNiceScroll().resize();
                },
                error: function () {
                    tab._ajax = null;
                    tab.content.removeClass('loading');
                }
            });
        }
    };

    TabManager.prototype.afterRender = function (tabId) {
        var _tab, i, j, len, ref, tab;
        tab = null;
        ref = this.tabs;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
            _tab = ref[i];
            if (_tab.id === tabId) {
                tab = _tab;
                break;
            }
        }
        if ((tab != null) && (tab.load != null) && tab.load.afterRender !== void 0) {
            tab.load.afterRender = this.makeFunction(tab.load.afterRender);
            return tab.load.afterRender(tab.content);
        }
    };

    TabManager.prototype.updateElement = function (tabId, elementId, element) {
        var active, elm, index, j, k, len, len1, ref, ref1, tab;
        ref = this.tabs;
        for (j = 0, len = ref.length; j < len; j++) {
            tab = ref[j];
            if (tab.id === tabId) {
                ref1 = tab.load._list;
                for (index = k = 0, len1 = ref1.length; k < len1; index = ++k) {
                    elm = ref1[index];
                    if (elm.id === elementId) {
                        active = true;
                        if (tab.filters && tab.filters.data && (element != null) && tab.load && tab.load.checkElement) {
                            active = tab.load.checkElement(tab.filters.data, element);
                        }
                        if ((element != null) && active) {
                            tab.load._list[index] = element;
                            this.addElement(tab, element, false, $(tab.content).find('.element').filter("[data-id='" + elementId + "']").parent());
                        } else {
                            this.removeElement(tab, index);
                        }
                        return;
                    }
                }
                return;
            }
        }
    };

    TabManager.prototype.addElement = function (tab, element, prepend, replace) {
        var action, actionId, addDate, all, data, date, dateLine, elm, id, index, j, k, len, ref, ref1;
        if (prepend == null) {
            prepend = false;
        }
        if (replace == null) {
            replace = null;
        }
        data = $.extend(true, {}, tab.load.element, {
            element: element
        });
        if ((data.element.id != null) && (tab.selected != null)) {
            all = tab.selected.indexOf('all') !== -1;
            id = tab.selected.indexOf(data.element.id) !== -1;
            data.selected = !all && id || all && !id;
        }
        if (tab.load.elementWrapper != null) {
            tab.load.elementWrapper(data, tab);
        }
        if ((data.actions != null) && data.actions.length) {
            for (index = j = ref = data.actions.length - 1; ref <= 0 ? j <= 0 : j >= 0; index = ref <= 0 ? ++j : --j) {
                actionId = data.actions[index].id;
                if ((tab.permissions != null) && actionId in tab.permissions && !tab.permissions[actionId]) {
                    data.actions.splice(index, 1);
                }
            }
        }
        if ((data.buttons != null) && (data.buttons.actions != null)) {
            ref1 = data.buttons.actions;
            for (k = 0, len = ref1.length; k < len; k++) {
                action = ref1[k];
                if (action !== void 0 && action) {
                    if ((tab.permissions != null) && action.id in tab.permissions && !tab.permissions[action.id]) {
                        if (action["class"] != null) {
                            action["class"] += ' disabled';
                        } else {
                            action["class"] = 'disabled';
                        }
                    }
                }
            }
        }
        elm = $(this.templates.element({
            data: data
        }));
        if ((this.parent != null) && ((replace == null) || (replace != null) && typeof replace !== 'string')) {
            this.parent.i18n(null, elm);
        }
        if (replace != null) {
            if (typeof replace === 'string') {
                dateLine = '';
                addDate = false;
                if (tab.hasOwnProperty('addDateBeforeLine')) {
                    date = BaseManager.dateFormat(BaseManager.dateParse(element[tab.addDateBeforeLine.field]));
                    dateLine = $('<div />', {
                        "class": 'tab-date-line'
                    }).html(date);
                    dateLine = $('<div />').html(dateLine).html();
                    addDate = !tab.addDateBeforeLine.stop && (elm.hasClass(tab.addDateBeforeLine["class"]) || replace === '');
                }
                if (prepend) {
                    return $('<div />').html(elm).html() + replace;
                } else {
                    if (addDate) {
                        replace = replace + dateLine;
                    }
                    return replace + $('<div />').html(elm).html();
                }
            } else {
                replace.replaceWith(elm);
            }
        } else {
            if (prepend) {
                tab.content.find('.elements').prepend(elm);
                tab.content.getNiceScroll().resize();
            } else {
                tab.content.find('.elements').append(elm);
            }
        }
    };

    TabManager.prototype.removeElement = function (tab, index) {
        tab.load._list.splice(index, 1);
        tab.content.find('.elements').find('.element-container').eq(index).remove();
        tab.content.getNiceScroll().resize();
        if (tab.load._list.length) {
            this.load(this.current, false, 1);
        } else {
            this.load(this.current, true, 0);
        }
    };

    TabManager.prototype.getElementData = function (tab, elementId) {
        var el, j, len, ref;
        if (tab.load && tab.load._list) {
            ref = tab.load._list;
            for (j = 0, len = ref.length; j < len; j++) {
                el = ref[j];
                if (el.id === elementId) {
                    return el;
                }
            }
        }
        return {};
    };

    TabManager.prototype.updateTabs = function (tab, responseData, stopUpdate, dontUpdate) {
        var base, elId, j, len, linkedTab, linkedTabObj, oldData, ref, results, tabId, tabManager, translateOptions, updateItemAjax;
        if (stopUpdate == null) {
            stopUpdate = false;
        }
        if (dontUpdate == null) {
            dontUpdate = false;
        }
        if (tab == null) {
            return false;
        }
        base = this.parent;
        tabManager = this;
        oldData = responseData && responseData.id ? tabManager.getElementData(tab, responseData.id) : {};
        if (!dontUpdate) {
            if (tab._table) {
                tab._table.resetTable();
            } else if (tab.load && tab.load.element) {
                if (responseData && responseData.id && tab.content.find(".element[data-id='" + responseData.id + "']").length) {
                    tabManager.updateElement(tab.id, responseData.id, responseData);
                } else {
                    setTimeout(function () {
                        tabManager.load(tab.id, true);
                    }, 400);
                }
            } else if (tab.updateCallback) {
                tab.updateCallback = tabManager.makeFunction(tab.updateCallback);
                tab.updateCallback();
            }
        }
        if (stopUpdate) {
            return false;
        }
        updateItemAjax = function (linkedTabObj, elementId, stopUpdate) {
            var url;
            if (linkedTabObj._table || !elementId) {
                return tabManager.updateTabs(linkedTabObj, {});
            } else if (linkedTabObj.load && linkedTabObj.load.url) {
                if (linkedTabObj.load.url.indexOf('?') === -1) {
                    url = linkedTabObj.load.url + '?element_id=' + elementId;
                } else {
                    url = linkedTabObj.load.url + '&element_id=' + elementId;
                }
                return $.get(url).done(function (responseData) {
                    return tabManager.updateTabs(linkedTabObj, responseData[0], stopUpdate);
                });
            }
        };
        if (tab.linkedTabs && (responseData != null)) {
            ref = tab.linkedTabs;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
                linkedTab = ref[j];
                results.push((function () {
                    var k, len1, ref1, results1;
                    ref1 = linkedTab.tabId;
                    results1 = [];
                    for (k = 0, len1 = ref1.length; k < len1; k++) {
                        tabId = ref1[k];
                        linkedTabObj = tabManager.getTabOrTable(tabId.replace(/({[0-9]+})/g, responseData[linkedTab.fieldName] ? responseData[linkedTab.fieldName] : oldData[linkedTab.fieldName]));
                        if (linkedTabObj) {
                            elId = linkedTab.idName ? responseData[linkedTab.idName] : responseData[linkedTab.fieldName];
                            updateItemAjax(linkedTabObj, elId, linkedTab.stopUpdate);
                            if (linkedTab.updateName && responseData) {
                                translateOptions = JSON.parse(JSON.stringify(linkedTab.updateName));
                                translateOptions.options.variables.name = responseData.nm;
                                linkedTabObj.label = base.__(translateOptions.key, translateOptions.options);
                                tabManager.renderTabs();
                            }
                            if (oldData[linkedTab.fieldName] && oldData !== responseData) {
                                elId = linkedTab.idName ? oldData[linkedTab.idName] : oldData[linkedTab.fieldName];
                                results1.push(updateItemAjax(linkedTabObj, elId, linkedTab.stopUpdate));
                            } else {
                                results1.push(void 0);
                            }
                        } else {
                            results1.push(void 0);
                        }
                    }
                    return results1;
                })());
            }
            return results;
        }
    };

    TabManager.prototype.table = function (index) {
        var action, j, len, prop, ref, tab, table, value;
        tab = this.tabs[index];
        if (tab.table == null) {
            return;
        }
        ref = tab.table;
        for (prop in ref) {
            value = ref[prop];
            if (typeof value === 'string' && value.match(/^function/)) {
                tab.table[prop] = this.makeFunction(value);
            }
            if (prop === 'actions') {
                for (j = 0, len = value.length; j < len; j++) {
                    action = value[j];
                    if (action.callback != null) {
                        action.callback = this.makeFunction(action.callback);
                    }
                }
            }
        }
        table = new Table(tab.table);
        tab._table = table;
        table.resetTable();
        tab.content.html(table.renderActions().add(table.render())).addClass('table');
    };

    TabManager.prototype.updateSelectedType = function (tab) {
        var $elements, element, index, j, len, ref;
        if (tab.hasOwnProperty('selectedType')) {
            $elements = tab.content.children('.elements').children();
            ref = tab.load._list;
            for (index = j = 0, len = ref.length; j < len; index = ++j) {
                element = ref[index];
                $elements.eq(index).find('.selectable').children('input').prop('disabled', !this.checkSelectedType(tab, element));
            }
        }
    };

    TabManager.prototype.addContent = function (tabIndex) {
        var action, cb, cell, field, i, j, k, l, len, len1, len2, len3, n, ref, ref1, ref2, ref3, selector, tabManager, tabObj;
        tabObj = this.tabs[tabIndex];
        tabManager = this;
        if (!tabObj.hasOwnProperty('filters')) {
            tabObj.filters = {};
        }
        if (!this.content.children("\#" + tabObj.id).length) {
            if (!tabObj.hasOwnProperty('content') || !(tabObj.content instanceof $)) {
                tabObj.content = null;
            }
            tabObj.content = $('<li />').attr({
                id: tabObj.id,
                "class": 'tab-pane'
            }).html(tabObj.content != null ? tabObj.content : '');
            if (tabObj["class"]) {
                tabObj.content.addClass(tabObj["class"]);
            }
        }
        this.content.append(tabObj.content);
        if (tabObj.hasOwnProperty('load')) {
            if (tabObj.load.hasOwnProperty('element')) {
                tabObj.content.html(this.templates.elements({
                    tab: tabObj
                }));
                tabObj.content.on('scroll', function (e) {
                    var fromBottom;
                    fromBottom = $(e.target).get(0).scrollHeight - $(e.target).height() - $(e.target).scrollTop();
                    if (fromBottom <= tabManager.fromBottomLoad && fromBottom >= 0) {
                        tabManager.load(tabIndex);
                    }
                });
                if (tabObj.load.element.callback != null) {
                    tabObj.load.element.callback = tabManager.makeFunction(tabObj.load.element.callback);
                    tabObj.content.on('click', '.element', function (e) {
                        var element, elementContainer, index;
                        if ($(e.target).is('.actions, .buttons, .remove-dialog, .selectable') || $(e.target).closest('.actions, .buttons, .remove-dialog, .selectable').length) {
                            return;
                        }
                        tabManager.UpClickDate();
                        elementContainer = $(this).closest('.element-container');
                        index = elementContainer.parent().children('.element-container').index(elementContainer);
                        element = tabObj.load._list[index];
                        tabObj.load.element.callback(element, $(this).closest('.element'), tabObj);
                    });
                }
                if (tabObj.load.element.fields != null) {
                    ref = tabObj.load.element.fields;
                    for (i = j = 0, len = ref.length; j < len; i = ++j) {
                        field = ref[i];
                        if (field != null) {
                            if (field.callback != null) {
                                field.callback = tabManager.makeFunction(field.callback);
                                (function (field) {
                                    tabObj.content.on('click', ".element .field:nth-of-type(" + (i + 1) + ")", function (e) {
                                        var cb, element, elementContainer, index;
                                        elementContainer = $(this).closest('.element-container');
                                        index = elementContainer.parent().children('.element-container').index(elementContainer);
                                        element = tabObj.load._list[index];
                                        cb = field.callback(element, $(this), tabObj);
                                        e.stopPropagation();
                                        if ((cb != null) && !cb) {
                                            return false;
                                        } else {

                                        }
                                    });
                                })(field);
                            }
                            if ((field.type != null) && field.type === 'checkbox') {
                                (function (field) {
                                    return tabObj.content.on('click', ".element .field:nth-of-type(" + (i + 1) + ")", function (e) {
                                        e.stopPropagation();
                                    });
                                })(field);
                            }
                        }
                    }
                }
                if (tabObj.load.element.cells != null) {
                    ref1 = tabObj.load.element.cells;
                    for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
                        cell = ref1[i];
                        if ((cell != null) && (cell.callback != null)) {
                            cell.callback = tabManager.makeFunction(cell.callback);
                            (function (cell) {
                                tabObj.content.on('click', ".element .cell:nth-of-type(" + (i + 1) + ")", function (e) {
                                    var element;
                                    e.stopPropagation();
                                    element = tabObj.load._list[$(this).closest('.element-container').index()];
                                    cell.callback(element, $(this), tabObj);
                                    return false;
                                });
                            })(cell);
                        }
                    }
                }
                if (tabObj.load.element.selectable != null) {
                    tabObj.content.on('click', ".element .selectable input", function (e) {
                        var action, btn, cb, documentWidth, element, id, index, l, len2, offsetLeft, ref2;
                        element = tabObj.load._list[$(this).closest('.element-container').index()];
                        if (tabObj.load.element.onSelect != null) {
                            tabObj.load.element.onSelect = tabManager.makeFunction(tabObj.load.element.onSelect);
                            cb = tabObj.load.element.onSelect(element, tabObj, $(this).prop('checked'));
                            if ((cb != null) && typeof cb === 'boolean') {
                                if (!cb) {
                                    return;
                                }
                            }
                        }
                        if ((cb != null) && typeof cb !== 'boolean') {
                            id = cb;
                        } else if (element.id != null) {
                            id = element.id;
                        }
                        if (id != null) {
                            index = tabObj.selected.indexOf(id);
                            if (index !== -1) {
                                tabObj.selected.splice(index, 1);
                            } else {
                                tabObj.selected.push(id);
                            }
                        }
                        if (!tabObj.load._loadMore) {
                            if (tabObj.selected.indexOf('all') !== -1) {
                                if (tabObj.selected.length - 1 === tabObj.load._list.length) {
                                    tabObj.selected = [];
                                }
                            }
                        }
                        ref2 = tabObj.filters.actions;
                        for (l = 0, len2 = ref2.length; l < len2; l++) {
                            action = ref2[l];
                            if (action.selectable !== void 0 && action.selectable) {
                                btn = tabObj.filterContainer.find(".actions_mass [data-id=" + action.id + "]");
                                if (tabObj.selected.length) {
                                    btn.removeClass('disabled');
                                    btn.addClass('display-block');
                                } else {
                                    btn.addClass('disabled');
                                    btn.removeClass('display-block');
                                }
                            }
                        }
                        tabManager.parent.pushState();
                        if (tabObj.selected.length > 0) {
                            tabObj.filterContainer.find('.floating-filters-mass').removeClass('hide');
                            documentWidth = $(document).width();
                            offsetLeft = tabObj.filterContainer.find('.filters-mass-button').offset().left;
                            tabObj.filterContainer.find('.floating-filters-mass').css('right', (documentWidth - offsetLeft - 50) + "px");
                            tabObj.filterContainer.find('.floating-filters, .floating-orders, .floating-options').addClass('hide');
                        } else {
                            tabObj.filterContainer.find('.floating-filters-mass').addClass('hide');
                        }
                    });
                }
                if (tabObj.load.element.actions != null) {
                    tabObj.content.on('click', ".element .actions .dropdown-toggle", function () {
                        var dropDownMenu, listView, tempShow;
                        tempShow = false;
                        dropDownMenu = $(this).closest('.element').find('.dropdown-menu');
                        listView = $(this).closest('.tab-pane.list');
                        dropDownMenu.removeClass('top');
                        if (!dropDownMenu.closest('.dropdown').hasClass('active')) {
                            tempShow = true;
                            dropDownMenu.closest('.dropdown').addClass('active');
                        }
                        if (listView.length && dropDownMenu.offset().top + dropDownMenu.outerHeight() > listView.closest('.tab-pane.list').offset().top + listView.closest('.tab-pane.list').height()) {
                            dropDownMenu.addClass('top');
                        }
                        if (tempShow) {
                            dropDownMenu.closest('.dropdown').removeClass('active');
                        }
                    });
                    ref2 = tabObj.load.element.actions;
                    for (l = 0, len2 = ref2.length; l < len2; l++) {
                        action = ref2[l];
                        if (action.callback != null) {
                            action.callback = tabManager.makeFunction(action.callback);
                            (function (action) {
                                tabObj.content.on('click', ".element .actions a[data-id='" + action.id + "']", function (e) {
                                    var element, elementContainer, index;
                                    e.preventDefault();
                                    elementContainer = $(this).closest('.element-container');
                                    index = elementContainer.parent().children('.element-container').index(elementContainer);
                                    element = tabObj.load._list[index];
                                    action.callback(element, $(this), tabObj);
                                });
                            })(action);
                        }
                    }
                }
                if (tabObj.load.element.buttons != null) {
                    if (tabObj.load.element.buttons.actions != null) {
                        ref3 = tabObj.load.element.buttons.actions;
                        for (n = 0, len3 = ref3.length; n < len3; n++) {
                            action = ref3[n];
                            selector = ".element .buttons a[data-id='" + action.id + "']";
                            if (action.id === 'remove') {
                                tabObj.content.on('click', selector, function (e) {
                                    e.preventDefault();
                                    if ($(this).parent().hasClass('disabled')) {
                                        return;
                                    }
                                    $(this).closest('.element').find('.remove-dialog').addClass('active');
                                });
                                selector = ".element .remove-dialog .confirm a";
                                tabObj.content.on('click', ".element .remove-dialog .cancel a", function (e) {
                                    e.preventDefault();
                                    $(this).closest('.remove-dialog').removeClass('active');
                                });
                                if ((action.callback == null) && (action.url != null)) {
                                    (function (action) {
                                        tabObj.content.on('click', selector, function (e) {
                                            var btn, element, elm, index;
                                            e.preventDefault();
                                            btn = $(this);
                                            if (btn.parent().hasClass('disabled')) {
                                                return;
                                            }
                                            btn.parent().addClass('disabled');
                                            elm = btn.closest('.element-container');
                                            elm.addClass('removing');
                                            index = elm.index();
                                            element = tabObj.load._list[index];
                                            /*let dataRemove = {
                                                "action": action.id,
                                                "id": element.id
                                            }
                                            if (element.company_id != null)
                                                dataRemove = $.extend(dataRemove, { company_id: element.company_id })
                                            if (element.item != null)
                                                dataRemove = $.extend(dataRemove, { item: element.item })
                                            if (element.branch_id != null)
                                                dataRemove = $.extend(dataRemove, { branch_id: element.branch_id })*/
                                            //if (element.id == null)
                                            //    dataRemove = $.extend(dataRemove, { element: element })
                                            $.ajax({
                                                url: action.url,
                                                data: JSON.stringify({ 'deleteData': element }),
                                                type: 'post',
                                                contentType: 'application/json; charset=utf-8',
                                                dataType: 'json',
                                                success: function (response) {
                                                    try {
                                                        response = JSON.parse(response);
                                                    } catch (e) {
                                                        response = response.d;
                                                    }
                                                    BaseManager.serverError(response);
                                                    if (response.success) {
                                                        tabManager.updateTabs(tabObj, response.data, void 0, true);
                                                        if (response.data != "999")
                                                            tabManager.removeElement(tabObj, index);
                                                        else
                                                            tabManager.load(tabManager.current, true, 0);
                                                    } else {
                                                        elm.addClass('removing');
                                                        btn.parent().removeClass('disabled');
                                                        if (response.data != null) {
                                                            tabManager.updateElement(tabObj.id, element.id, response.data);
                                                        }
                                                    }
                                                    if (response.messages.length && (tabManager.parent != null)) {
                                                        tabManager.parent.notify(response.messages[0].message, response.messages[0].type);
                                                    }
                                                }
                                            });
                                        });
                                    })(action);
                                }
                            }
                            if (action.callback != null) {
                                action.callback = tabManager.makeFunction(action.callback);
                                (function (action) {
                                    tabObj.content.on('click', selector, function (e) {
                                        var element, elementContainer, index;
                                        e.preventDefault();
                                        if ($(this).parent().hasClass('disabled')) {
                                            return;
                                        }
                                        elementContainer = $(this).closest('.element-container');
                                        index = elementContainer.parent().children('.element-container').index(elementContainer);
                                        element = tabObj.load._list[index];
                                        action.callback(element, $(this), tabObj);
                                    });
                                })(action);
                            }
                        }
                    }
                }
            }
            this.load(tabIndex);
        } else if (tabObj.table != null) {
            this.table(tabIndex);
        }
        if (tabObj.onSelect != null) {
            tabObj.onSelect = tabManager.makeFunction(tabObj.onSelect);
        }
        if (tabObj.callback != null) {
            tabObj.callback = tabManager.makeFunction(tabObj.callback);
            cb = tabObj.callback(tabObj);
            if ((cb != null) && !cb) {
                return;
            }
        }
        if (this.parent != null) {
            this.parent.i18n(null, tabObj.content);
        }
        tabObj.content.niceScroll({
            horizrailenabled: false,
            cursoropacitymin: 0.5,
            railoffset: {
                left: 10
            }
        });
        tabObj.content.niceScroll().rail[0].children[0].onmousedown = function () {
            return tabManager.UpClickDate();
        };
        tabObj.content[0].onscroll = function () {
            tabManager.UpClickDate();
            return $('#selectOptionsContainer').css('display', 'none');
        };
        if ((tabObj.load != null) && (tabObj.load.element != null)) {
            this.switchType(tabIndex, (tabObj.is_list ? 'list' : (tabObj.load.viewType != null ? tabObj.load.viewType : (tabObj.load.element.fields != null ? 'grid' : 'list'))), true);
        }
    };

    TabManager.prototype.close = function (index, doRender) {
        var cb, deleted, i, j, len, ref, tab;
        if (doRender == null) {
            doRender = true;
        }
        if (isNaN(parseInt(index))) {
            ref = this.tabs;
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
                tab = ref[i];
                if (tab.id === index) {
                    index = i;
                    break;
                }
            }
        }
        if (index < this.tabs.length) {
            deleted = this.tabs[index];
            if (deleted.onClose != null) {
                deleted.onClose = this.makeFunction(deleted.onClose);
                cb = deleted.onClose(deleted);
                if ((cb != null) && !cb) {
                    return;
                }
            }
            this.tabs.splice(index, 1);
            this.historyTab(index);
            if (deleted._table != null) {
                deleted._table.body.getNiceScroll().remove();
            }
            if (deleted._ajax != null) {
                deleted._ajax.abort();
            }
            if (deleted.content != null) {
                deleted.content.getNiceScroll().remove();
                deleted.content.remove();
            }
            if (deleted.filterContainer != null) {
                deleted.filterContainer.remove();
            }
            if (this.current === index) {
                this.current = this.history[0];
            } else if (this.current > index) {
                this.current--;
            }
            if (doRender) {
                this.render(true);
            }
        }
    };

    TabManager.prototype.historyTab = function (indexOfTab, add, moreVisible) {
        var notIndex, reindexValues;
        if (indexOfTab == null) {
            indexOfTab = null;
        }
        if (add == null) {
            add = false;
        }
        if (moreVisible == null) {
            moreVisible = false;
        }
        notIndex = function (x) {
            return x !== indexOfTab;
        };
        reindexValues = function (x) {
            if (x > indexOfTab) {
                return x - 1;
            } else {
                return x;
            }
        };
        if (indexOfTab != null) {
            if (!add || this.visible.indexOf(indexOfTab) === -1) {
                this.history = this.history.filter(notIndex);
                if (add) {
                    this.history.unshift(indexOfTab);
                } else {
                    this.history = this.history.map(reindexValues);
                }
            }
            if (this.parent != null) {
                this.parent.pushState();
            }
        }
    };

    TabManager.prototype.selectTab = function (index) {
        var $popupMenuCurrent, base1, i, j, len, ref, tab, table, visibleIndex;
        if ((this.current != null) && (this.tabs[this.current] != null)) {
            if (typeof (base1 = this.tabs[this.current]).load === "function" ? base1.load(this.tabs[this.current].content.getNiceScroll().length) : void 0) {
                this.tabs[this.current].content.getNiceScroll().hide();
            } else if ((this.tabs[this.current]._table != null) && this.tabs[this.current]._table.body.getNiceScroll().length) {
                this.tabs[this.current]._table.body.getNiceScroll().hide();
            }
        }
        if (isNaN(parseInt(index))) {
            ref = this.tabs;
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
                tab = ref[i];
                if (tab.id === index) {
                    index = i;
                    break;
                }
            }
        }
        this.current = index;
        this.historyTab(index, true);
        this.renderTabs();
        visibleIndex = this.visible.slice().reverse().indexOf(index);
        this.navContainer.children('li').removeClass('active').eq(visibleIndex).addClass('active');
        this.filterContainer.children('li').removeClass('active').eq(this.current).addClass('active');
        this.content.children('li').removeClass('active').eq(this.current).addClass('active');
        this.contentResize();
        if ((index != null) && (this.tabs[index] != null)) {
            if (this.tabs[index].onSelect != null) {
                this.tabs[index].onSelect(this.tabs[index]);
            }
            $popupMenuCurrent = this.tabs[this.current].filterContainer.find('.popup-menu-current');
            setTimeout(function () {
                $popupMenuCurrent.each(function () {
                    var $popupMenu;
                    $popupMenu = $(this).closest('.popup-menu-holder').find('.popup-menu');
                    $popupMenu.addClass('ghost-active');
                    $(this).width($popupMenu.width());
                    $popupMenu.removeClass('ghost-active');
                });
            }, 0);
            if ((this.tabs[index].load != null) && this.tabs[index].content.getNiceScroll().length) {
                this.tabs[index].content.getNiceScroll().show();
            } else if (this.tabs[index]._table != null) {
                if (window.navigator.userAgent.indexOf('MSIE ') !== -1) {
                    table = this.tabs[index]._table;
                    setTimeout(function () {
                        table.columnsResize();
                    }, 100);
                }
                this.tabs[index]._table.columnsResize();
                if (this.tabs[index]._table.body.getNiceScroll().length) {
                    this.tabs[index]._table.body.getNiceScroll().show();
                    this.tabs[index]._table.body.getNiceScroll().resize();
                }
            }
        }
    };

    TabManager.prototype.getTabOrTable = function (id, table) {
        var j, len, ref, tab;
        if (table == null) {
            table = false;
        }
        ref = this.tabs;
        for (j = 0, len = ref.length; j < len; j++) {
            tab = ref[j];
            if (tab.id === id) {
                if (table) {
                    return tab._table;
                } else {
                    return tab;
                }
            }
        }
        return null;
    };

    TabManager.prototype.loadAllTabs = function () {
        var j, len, ref, tab, tabManager;
        tabManager = this;
        ref = this.tabs;
        for (j = 0, len = ref.length; j < len; j++) {
            tab = ref[j];
            if (tab.load) {
                tabManager.load(tab, true);
            } else if (tab._table) {
                tab._table.resetTable();
            } else if (tab.updateCallback) {
                tab.updateCallback = tabManager.makeFunction(tab.updateCallback);
                tab.updateCallback();
            }
        }
        return false;
    };

    TabManager.prototype.selectElements = function (index, ids) {
        var element, id, j, len;
        if (ids == null) {
            ids = null;
        }
        if (index < this.tabs.length && (this.tabs[index].selected != null)) {
            if ((ids != null) && !(ids instanceof Array)) {
                ids = [ids];
            }
            if (ids != null) {
                for (j = 0, len = ids.length; j < len; j++) {
                    id = ids[j];
                    element = this.tabs[index].content.children('.elements').children().children("[data-id=" + id + "]").children('.selectable');
                    if (element.length && !element.children().prop('checked')) {
                        element.trigger('click');
                    }
                }
            } else {
                this.tabs[index].filterContainer.children('.actions_mass').children('[data-id=select_all]').trigger('click');
            }
        }
    };

    TabManager.prototype.deselectElements = function (index, ids) {
        var element, id, j, len;
        if (ids == null) {
            ids = null;
        }
        if (index < this.tabs.length && (this.tabs[index].selected != null)) {
            if ((ids != null) && !(ids instanceof Array)) {
                ids = [ids];
            }
            if (ids != null) {
                for (j = 0, len = ids.length; j < len; j++) {
                    id = ids[j];
                    element = this.tabs[index].content.children('.elements').children().children("[data-id=" + id + "]").children('.selectable');
                    if (element.length && element.children().prop('checked')) {
                        element.trigger('click');
                    }
                }
            } else {
                this.tabs[index].filterContainer.children('.actions_mass').children('[data-id=deselect_all]').trigger('click');
            }
        }
    };

    return TabManager;

})();

//# sourceMappingURL=base.js.map
