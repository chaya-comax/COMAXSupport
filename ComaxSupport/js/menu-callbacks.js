'use strict'

function products() {
    BaseManager.tab.add({
        id: 'products',
        tabId: 'products',
        label: 'מוצרים',
        filters:
        {
            extraSearch: [
                {
                    name: 'productName',
                    label: BaseManager.__('FieldProductName', 'שם מוצר')
                }
            ],
            order: true,
            data:
            {
                order: 0
            },
            order_by:
            {
                productName: BaseManager.__('FieldProductName', 'שם מוצר')
            },
            actions: [
                {
                    id: 'add',
                    class: 'btn-success',
                    icon: 'plus',
                    callback: (tab, button) => {
                        product(undefined, button)
                    }
                }
            ]
        },
        load: {
            url: 'form/product/product.aspx/list',
            columns: [
                {
                    name: 'productName',
                    label: 'שם מוצר',
                    order: true,
                    width: 250
                },
                {
                    name: 'space',
                    label: ''
                }
            ],
            element: {
                class: 'products',
                buttons: {
                    class: 'count-2',
                    remove: 'למחוק סוג זה?',
                    actions: [
                        {
                            id: 'edit',
                            icon: 'pencil',
                            label: 'עדכון',
                            class: 'text-right',
                            callback: (data, element) => {
                                product(data.id, element.closest('.element'))
                            }
                        },
                        {
                            id: 'remove',
                            icon: 'trash',
                            class: 'text-left divider danger',
                            label: 'מחיקה',
                            url: 'form/product/product.aspx/delete'
                        }
                    ]
                },
                fields: [
                    {
                        class: 'code'
                    }
                ],
                cells: [
                    {
                        class: 'pointer'
                    },
                    null
                ],
                callback: (data, element, tab) => {
                    product(data.id, element)
                }
            },
            elementWrapper: data => {
                data.fields[0].value = data.cells[0].value = data.element.Name

                return data
            },
            noResults: 'לא נמצאו תוצאות',
            noElements: 'לא קיימים מוצרים'
        }
    })
}

function supporters() {
    BaseManager.tab.add({
        id: 'supporters',
        tabId: 'supporters',
        label: 'תומכים',
        filters:
        {
            extraSearch: [
                {
                    name: 'supporterName',
                    label: BaseManager.__('FieldSupporterName', 'שם תומך')
                }
            ], 
            order: true,
            data:
            {
                order: 0
            },
            order_by:
            {
                supporterName: BaseManager.__('FieldSopporterName', 'שם תומך')
            },
            actions: [
                {
                    id: 'add',
                    class: 'btn-success',
                    icon: 'plus',
                    callback: (tab, button) => {
                        supporter(undefined, button)
                    }
                }
            ]
        },
        load: {
            url: 'form/supporter/supporter.aspx/list',
            columns: [
                {
                    name: 'supporterName',
                    label: 'שם תומך',
                    order: true,
                    width: 250
                },
                {
                    name: 'space',
                    label: ''
                }
            ],
            element: {
                class: 'supporters',
                buttons: {
                    class: 'count-2',
                    remove: 'למחוק סוג זה?',
                    actions: [
                        {
                            id: 'edit',
                            icon: 'pencil',
                            label: 'עדכון',
                            class: 'text-right',
                            callback: (data, element) => {
                                supporter(data.id, element.closest('.element'))
                            }
                        },
                        {
                            id: 'remove',
                            icon: 'trash',
                            class: 'text-left divider danger',
                            label: 'מחיקה',
                            url: 'form/supporter/supporter.aspx/delete'
                        }
                    ]
                },
                fields: [
                    {
                        class: 'code'
                    }
                ],
                cells: [
                    {
                        class: 'pointer'
                    },
                    null
                ],
                callback: (data, element, tab) => {
                    supporter(data.id, element)
                }
            },
            elementWrapper: data => {
                data.fields[0].value = data.cells[0].value = data.element.Name

                return data
            },
            noResults: 'לא נמצאו תוצאות',
            noElements: 'לא קיימים תומכים'
        }
    })
}

function institution_themes(item_id) {
    let data = {}
    let tabId = 'institution_themes'
    let tabLabel = 'מוסד/נושא'
    if (typeof item_id != 'undefined') {
        data['item_id'] = item_id
        tabId = `institution_themes_${item_id}`
        tabLabel = 'aaaaמוסד/נושא'
    }


    BaseManager.tab.add({
        id: 'institution_themes',
        tabId: tabId,
        label: tabLabel,
        inner: true,
        filters: {
            data: data,
            extraSearch: [
                {
                    name: 'code',
                    label: BaseManager.__('FieldCode', 'קוד')
                },
                {
                    name: 'description',
                    label: BaseManager.__('FieldDescription', 'תאור')
                }
            ],
            order: true,
            data: {
                order: 0
            },
            order_by: {
                code: BaseManager.__('FieldCode', 'קוד'),
                description: BaseManager.__('FieldDescription', 'תאור')
            },
            actions: [
                {
                    id: 'add',
                    class: 'btn-success',
                    icon: 'plus',
                    callback: (tab, button) => {
                        institution_theme(undefined, button)
                    }
                }
            ]
        },
        load: {
            url: 'institution_theme/institution_theme.aspx/list',
            columns: [
                {
                    name: 'code',
                    label: BaseManager.__('FieldCode', 'קוד'),
                    order: true,
                    width: 100
                },
                {
                    name: 'description',
                    label: BaseManager.__('FieldDescription', 'תאור'),
                    order: true,
                    width: 250
                },
                {
                    name: 'space',
                    label: ''
                }
            ],
            element: {
                class: 'institution_themes',
                buttons: {
                    class: 'count-2',
                    remove: 'למחוק סוג זה?',
                    actions: [
                        {
                            id: 'edit',
                            icon: 'pencil',
                            label: 'עדכון',
                            class: 'text-right',
                            callback: (data, element) => {
                                institution_theme(data.id, element.closest('.element'))
                            }
                        },
                        {
                            id: 'remove',
                            icon: 'trash',
                            class: 'text-left divider danger',
                            label: 'מחיקה',
                            url: 'institution_theme/institution_theme.aspx/delete'
                        }
                    ]
                },
                fields: [
                    {
                        class: 'code'
                    },
                    {
                        class: 'customer-title'
                    }
                ],
                cells: [
                    {
                        class: 'pointer'
                    },
                    {
                        class: 'pointer'
                    },
                    null
                ],
                callback: (data, element, tab) => {
                    institution_theme(data.id, element)
                }
            },
            elementWrapper: data => {
                data.fields[0].value = data.cells[0].value = data.element.Kod
                data.fields[1].value = data.cells[1].value = data.element.Description
                return data
            },
            noResults: 'לא נמצאו תוצאות',
            noElements: 'לא קיימים מוסדות/נושאים'
        }
    })
}


function purchasing_report() {
    $.ajax({
        url: '/get_filter_count/',
        type: 'GET',
        async: false,
        success: response => {
            if (response.suppliers) {
                filters.push({
                    label: BaseManager.__('FiltersVendors', 'Vendor'),
                    class: 'empty',
                    visible: true,
                    name: 'supplier',
                    dataResult: {
                        id: 'id',
                        text: 'nm__code'
                    },
                    text: '',
                    width: 200,
                    load: '/get_vendors_list/',
                    data: {},
                    callback: tab => {
                        BaseManager.pushState()
                        tab._reportTable.resetTable()
                        return false
                    }
                })
            }
        }
    })
    BaseManager.tab.add({
        id: tab_id,
        class: 'tab-report-table',
        label: tab_label,
        filters: {
            data: data,
            filtersCombo: filters,
            callbacks: {
                filtering: tab => {
                    BaseManager.pushState()
                    tab._reportTable.resetTable()
                    return false
                }
            }
        },
        onSelect: () => {
            $(window).trigger('resize')
        },
        load: {
            url: '/purchasing/purchasing_report_form/',
            callback: function (tabContent, tabObj) {
                const tables_filter_by = {
                    FilterByItems: ['items', 'Item'],
                    FilterBySuppliers: ['suppliers', 'Supplier'],
                    FilterByCompanies: ['companies', 'Company'],
                    FilterByLocations: ['locations', 'Location'],
                    FilterByGroups: ['groups', 'Group'],
                    FilterByModels: ['models', 'Model'],
                    FilterByColors: ['colors', 'Color'],
                    FilterBySizes: ['sizes', 'Size'],
                    FilterByImporters: ['importers', 'Importer'],
                    FilterByCollections: ['collections', 'Collection'],
                    FilterByManufacturers: ['manufacturers', 'Manufacturer'],
                }
                tabObj._reportTable = new Table({
                    attrs: { class: 'align-top' },
                    showDefaultOrder: true,
                    margin: -65,
                    filter: tabObj.filters.data,
                    url: '/purchasing/purchasing_report/',
                    order: 'item__code',
                    filterTimeOut: 1000,
                    columns: [
                        {
                            name: 'table__code',
                            label: BaseManager.__('FieldItem', 'Item'),
                            order: true,
                            filter: 'number',
                            attrs: {
                                width: 116
                            }
                        },
                        {
                            name: 'table__nm',
                            label: BaseManager.__('FieldItemName', 'Item name'),
                            order: true,
                            filter: 'text'
                        },
                        {
                            name: 'entry_doc_count',
                            label: BaseManager.__('FieldEntryDoc', 'Entry document '),
                            order: true,
                            filter: 'text',
                            attrs: {
                                width: 116
                            }
                        },
                        {
                            name: 'return_doc_count',
                            label: BaseManager.__('FieldReturnDoc', 'Return document'),
                            order: true,
                            filter: 'text',
                            attrs: {
                                width: 116
                            }
                        },
                        {
                            name: 'documents_count',
                            label: BaseManager.__('FieldDocuments', 'Documents'),
                            order: true,
                            filter: 'text',
                            attrs: {
                                width: 120
                            }
                        },
                        {
                            name: 'quantity',
                            label: BaseManager.__('FieldQty', 'Qty'),
                            order: true,
                            filter: 'text',
                            attrs: {
                                width: 100
                            }
                        },
                        {
                            name: 'weight',
                            label: BaseManager.__('FieldWeight', 'Weight'),
                            order: true,
                            filter: 'text',
                            attrs: {
                                width: 120
                            }
                        },
                        {
                            name: 'price',
                            label: BaseManager.__('FieldBuyPrice', 'Buy Price'),
                            order: true,
                            filter: 'text',
                            attrs: {
                                width: 110
                            }
                        },
                        {
                            name: 'discountpercent',
                            label: BaseManager.__('FieldPercentDiscount', '% Discount'),
                            order: true,
                            filter: 'text',
                            attrs: {
                                width: 100
                            }
                        },
                        {
                            name: 'sum',
                            label: BaseManager.__('FieldAmount', 'Amount'),
                            order: true,
                            filter: 'text',
                            attrs: {
                                width: 150
                            }
                        }
                    ],
                    onGetData: (data, table) => {
                        let rows = []
                        for (let i = 0; i < data.rows.length; i++) {
                            let row = data.rows[i]
                            let discountpercent = null
                            if (round(row.discountpercent)) {
                                discountpercent = {
                                    attrs: { class: 'text-right' + (round(row.discountpercent) < 0 ? ' negative' : '') },
                                    value: BaseManager.numberFormat(row.discountpercent, true, true, true) + '%'
                                }
                            }
                            rows.push({
                                attrs: { 'data-id': row.id },
                                cells: [
                                    { attrs: { class: 'text-right' }, value: row.table__code },
                                    row.table__nm,
                                    row.entry_doc_count,
                                    row.return_doc_count,
                                    {
                                        attrs: { class: 'text-right' },
                                        value: BaseManager.numberFormat(row.documents_count, false, true, true)
                                    },
                                    {
                                        attrs: { class: 'text-right ' + (row.quantity < 0 ? 'negative' : '') },
                                        value: BaseManager.numberFormat(row.quantity, true, true, true, 3)
                                    },
                                    {
                                        attrs: { class: 'text-right ' + (row.weight < 0 ? 'negative' : '') },
                                        value: BaseManager.numberFormat(row.weight, true, true, true, 3)
                                    },
                                    {
                                        attrs: { class: 'text-right ' + (row.price < 0 ? 'negative' : '') },
                                        value: BaseManager.numberFormat(row.price, true, true, true)
                                    },
                                    discountpercent,
                                    {
                                        attrs: { class: 'text-right ' + (row.sum < 0 ? 'negative' : '') },
                                        value: BaseManager.numberFormat(row.sum, true, true, true)
                                    }
                                ],
                                name: row.item_nm
                            })
                        }
                        if (data.total_sum != null || !data.rows.length) {
                            let footerRows = []
                            footerRows.push({
                                cells: [
                                    {
                                        attrs: { class: 'text-left total_black', colspan: 4 },
                                        value: BaseManager.__('TableTotal', 'Total', true)
                                    },
                                    {
                                        attrs: { class: 'text-right total_black' },
                                        value: BaseManager.numberFormat(data.total_documents_count, false, true, true)
                                    },
                                    {
                                        attrs: { class: 'text-right total_black ' + (data.total_qty < 0 ? 'negative' : '') },
                                        value: BaseManager.numberFormat(data.total_qty, true, true, true, 3)
                                    },
                                    {
                                        attrs: { class: 'text-right total_black ' + (data.total_weight < 0 ? 'negative' : '') },
                                        value: BaseManager.numberFormat(data.total_weight, true, true, true, 3)
                                    },
                                    {
                                        attrs: { class: 'text-right total_black ' + (data.avg_price < 0 ? 'negative' : '') },
                                        value: BaseManager.numberFormat(data.avg_price, true, true, true)
                                    },
                                    {
                                        attrs: { class: 'text-right total_black ' + (data.avg_discountpercent < 0 ? 'negative' : '') },
                                        value: BaseManager.numberFormat(data.avg_discountpercent, true, true, true) + (data.avg_discountpercent ? '%' : '')
                                    },
                                    {
                                        attrs: { class: 'text-right total_black ' + (data.total_sum < 0 ? 'negative' : '') },
                                        value: BaseManager.numberFormat(data.total_sum, true, true, true)
                                    }
                                ]
                            })
                            table.renderFooter(footerRows)
                        }
                        return rows
                    }
                })
                tabContent.find('[data-i18n="FilterByItems"]').addClass('active')
                tabObj._filter_by = 'items'
                tabContent.find('button.btnFilterBy').on('click', () => {
                    tabContent.find('.divFilter').addClass('visible')
                })
                tabContent.find('button.btnFilter').on('click', e => {
                    setTimeout(() => {
                        tabContent.find('div.divFilter').removeClass('visible')
                    }, 0)
                    if (!$(e.target).hasClass('active')) {
                        tabContent.find('button.btnFilter').removeClass('active')
                        $(e.target).addClass('active')
                        tabObj._reportTable.body.getNiceScroll().remove()
                        tabObj._reportTable.url = '/purchasing/purchasing_report/?filter_by=' + tables_filter_by[$(e.target).data('i18n')][0]
                        tabObj._filter_by = tables_filter_by[$(e.target).data('i18n')][0]
                        let header_type = tables_filter_by[$(e.target).data('i18n')][1]
                        $('[data-order=table__code]', tabContent).attr('data-i18n', 'Field' + header_type)
                            .text(BaseManager.__('Field' + header_type, header_type).text)
                        $('[data-order=table__nm]', tabContent).attr('data-i18n', 'Field' + header_type + 'Name')
                            .text(BaseManager.__('Field' + header_type + 'Name', header_type + ' name').text)
                        BaseManager.pushState()
                        tabObj._reportTable.resetTable()
                    }
                })
                $('.divFilter .glyphicon-remove', tabContent).on('click', () => {
                    tabContent.find('.divFilter').removeClass('visible')
                })
                tabContent.find('#date_label').on('click', () => {
                    let bounds = $('#daterange', tabContent).dateRangeSlider('bounds')
                    let from = BaseManager.dateFormat(bounds.min)
                    let to = BaseManager.dateFormat(bounds.max)
                    tabContent.find('[name="date[from]"]').val(from).trigger('change')
                    tabContent.find('[name="time_from"]').val('').trigger('change')
                    tabContent.find('[name="date[to]"]').val(to).trigger('change')
                    tabContent.find('[name="time_to"]').val('').trigger('change')
                })
                tabContent.find('#report_filters .date-picker[name="date[from]"]').on('change', e => {
                    let date = BaseManager.dateParse(e.target.value, undefined, true, false)
                    let val = BaseManager.dateFormat(date, 'yyyy-mm-dd')
                    let max = $('#daterange', tabContent).dateRangeSlider('max')
                    $('#daterange', tabContent).dateRangeSlider('values', date, max)
                    tabObj._reportTable.doFilter(e.target, val, true)
                    BaseManager.pushState()
                })
                tabContent.find('#report_filters .date-picker[name="date[to]"]').on('change', e => {
                    let date = BaseManager.dateParse(e.target.value, undefined, true, false)
                    let val = BaseManager.dateFormat(date, 'yyyy-mm-dd')
                    let min = $('#daterange', tabContent).dateRangeSlider('min')
                    $('#daterange', tabContent).dateRangeSlider('values', min, date)
                    tabObj._reportTable.doFilter(e.target, val, true)
                    BaseManager.pushState()
                })
                tabContent.find('#report_filters .time-picker[name="time_from"]').on('dp.change', e => {
                    tabObj._reportTable.doFilter(e.target, e.target.value, true)
                    BaseManager.pushState()
                })
                tabContent.find('#report_filters .time-picker[name="time_to"]').on('dp.change', e => {
                    tabObj._reportTable.doFilter(e.target, e.target.value, true)
                    BaseManager.pushState()
                })
                if (tabObj.filters.data['date[from]']) {
                    tabContent.find('#report_filters [name="date[from]"]').datepicker(
                        'setDate',
                        BaseManager.dateFormat(BaseManager.dateParse(tabObj.filters.data['date[from]'], 'yy-mm-dd', true, false))
                    )
                }
                if (tabObj.filters.data['date[to]']) {
                    tabContent.find('#report_filters [name="date[to]"]').datepicker(
                        'setDate',
                        BaseManager.dateFormat(BaseManager.dateParse(tabObj.filters.data['date[to]'], 'yy-mm-dd', true, false))
                    )
                }
                if (tabObj.filters.data.time_from) {
                    tabContent.find('[name="time_from"]').data('DateTimePicker').date(tabObj.filters.data.time_from)
                }
                if (tabObj.filters.data.time_to) {
                    tabContent.find('[name="time_to"]').data('DateTimePicker').date(tabObj.filters.data.time_to)
                }
                let timer = null
                $('#daterange', tabContent).bind('userValuesChanged', (e, data) => {
                    clearTimeout(timer)
                    timer = setTimeout(() => {
                        let from = BaseManager.dateFormat(BaseManager.dateParse(data.values.min, undefined, true, false))
                        let to = BaseManager.dateFormat(BaseManager.dateParse(data.values.max, undefined, true, false))
                        tabContent.find('#report_filters [name="date[from]"]').datepicker('setDate', from)
                        tabContent.find('#report_filters [name="date[to]"]').datepicker('setDate', to)
                    }, 500)
                })
                reportTable(tabContent, tabObj)
            },
            afterRender: tabContent => {
                set_details_customers_company(tabContent)
            }
        }
    })
}

