function liquidFillGaugeDefaultSettings(value) {
    let settings = {
        minValue: 0, // The gauge minimum value.
        maxValue: 100, // The gauge maximum value.
        circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
        circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer
        // circles radius.
        waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
        waveCount: 1, // The number of full waves per width of the wave circle.
        waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime: 1000, // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height
        // reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to
        // prevent the wave from making the wave circle from appear totally full or empty when
        // near it's minimum or maximum fill.
        waveAnimate: true, // Controls if the wave scrolls or is static.
        waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        textVertPosition: 0.5, // The height at which to display the percentage text withing the wave circle.
        // 0 = bottom, 1 = top.
        textSize: 0.8, // The relative height of the text to display in the wave circle. 1 = 50%
        valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading.
        // If false, the final value is displayed.
        displayPercent: true, // If true, a % symbol is displayed after the value.
    }

    // let blueColorSettings = {
    //   circleColor: "#178BCA", // The color of the outer circle.
    //   waveColor: "#178BCA", // The color of the fill wave.
    //   textColor: "#045681", // The color of the value text when the wave does not overlap it.
    //   waveTextColor: "#A4DBf8" // The color of the value text when the wave overlaps it.
    // }


    let Settings90 = {
        circleColor: '#C94D3F', // The color of the outer circle.
        waveColor: '#a73124', // The color of the fill wave.
        textColor: '#D23030', // The color of the value text when the wave does not overlap it.
        waveTextColor: '#F8A4A4' // The color of the value text when the wave overlaps it.
    }
    let Settings92 = {
        circleColor: '#C94D3F',
        waveColor: '#d63f1d',
        textColor: '#D23030',
        waveTextColor: '#F8A4A4'
    }
    let Settings94 = {
        circleColor: '#dc6f11',
        waveColor: '#e77b1f',
        textColor: '#753305',
        waveTextColor: '#753305'
    }
    let Settings96 = {
        circleColor: '#f1b715',
        waveColor: '#f1b715',
        textColor: '#923f04',
        waveTextColor: '#923f04'
    }
    let Settings98 = {
        circleColor: '#87c410',
        waveColor: '#87c410',
        textColor: '#364c0a',
        waveTextColor: '#364c0a'
    }
    let Settings100 = {
        circleColor: '#5aab10',
        waveColor: '#5aab10',
        textColor: '#c8e096',
        waveTextColor: '#c8e096'
    }
    let Settings100up = {
        circleColor: '#298e0f',
        waveColor: '#298e0f',
        textColor: '#c8e096',
        waveTextColor: '#c8e096'
    }
    let colorSettings

    if (value < 90) {
        colorSettings = Settings90
    }
    if (value >= 90 && value < 92) {
        colorSettings = Settings92
    }
    if (value >= 92 && value < 94) {
        colorSettings = Settings94
    }
    if (value >= 94 && value < 96) {
        colorSettings = Settings96
    }
    if (value >= 96 && value < 98) {
        colorSettings = Settings98
    }
    if (value >= 98 && value < 100) {
        colorSettings = Settings100
    }
    if (value >= 100) {
        colorSettings = Settings100up
    }

    $.extend(settings, colorSettings)
    return settings
}

function loadLiquidFillGauge(elementId, value, config) {
    if (config == null) {
        config = liquidFillGaugeDefaultSettings(value)
    }
    let gauge = d3.select('#' + elementId)
    gauge.html('')

    if (value) {
        $('#' + elementId).parent().removeClass('hide')
    } else {
        $('#' + elementId).parent().addClass('hide')
    }

    let radius = parseInt(gauge.style('height')) / 2
    let fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue

    let waveHeightScale
    if (config.waveHeightScaling) {
        waveHeightScale = d3
            .scale
            .linear()
            .range([0, config.waveHeight, 0])
            .domain([0, 50, 100])
    } else {
        waveHeightScale = d3
            .scale
            .linear()
            .range([config.waveHeight, config.waveHeight])
            .domain([0, 100])
    }

    let textPixels = (config.textSize * radius / 2)
    let textFinalValue = parseFloat(value).toFixed(value >= 100 ? 0 : 2)
    let textStartValue = config.valueCountUp ? config.minValue : textFinalValue
    let percentText = config.displayPercent ? '%' : ''
    let circleThickness = config.circleThickness * radius
    let circleFillGap = config.circleFillGap * radius
    let fillCircleMargin = circleThickness + circleFillGap
    let fillCircleRadius = radius - fillCircleMargin
    let waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100)

    let waveLength = fillCircleRadius * 2 / config.waveCount
    let waveClipCount = 1 + config.waveCount
    let waveClipWidth = waveLength * waveClipCount

    // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
    let textRounder = value => Math.round(value)
    if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
        textRounder = value => parseFloat(value).toFixed(1)
    }
    if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
        textRounder = value => parseFloat(value).toFixed(2)
    }

    // Data for building the clip wave area.
    let data = []
    for (let i = 0; i <= 40 * waveClipCount; i++) {
        data.push({
            x: i / 40 * waveClipCount,
            y: i / 40
        })
    }

    // Scales for drawing the outer circle.
    let gaugeCircleX = d3
        .scale
        .linear()
        .range([0, 2 * Math.PI])
        .domain([0, 1])
    let gaugeCircleY = d3
        .scale
        .linear()
        .range([0, radius])
        .domain([0, radius])

    // Scales for controlling the size of the clipping path.
    let waveScaleX = d3
        .scale
        .linear()
        .range([0, waveClipWidth])
        .domain([0, 1])
    let waveScaleY = d3
        .scale
        .linear()
        .range([0, waveHeight])
        .domain([0, 1])

    // Scales for controlling the position of the clipping path.
    let waveRiseScale = d3
        .scale
        .linear()
        .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
        .domain([0, 1])
    let waveAnimateScale = d3
        .scale
        .linear()
        .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
        .domain([0, 1])

    // Scale for controlling the position of the text within the gauge.
    let textRiseScaleY = d3
        .scale
        .linear()
        .range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)])
        .domain([0, 1])

    // Center the gauge within the parent SVG.
    let gaugeGroup = gauge.append('g')

    // Draw the outer circle.
    let gaugeCircleArc = d3.svg
        .arc()
        .startAngle(gaugeCircleX(0))
        .endAngle(gaugeCircleX(1))
        .outerRadius(gaugeCircleY(radius))
        .innerRadius(gaugeCircleY(radius - circleThickness))
    gaugeGroup.append('path')
        .attr('d', gaugeCircleArc)
        .style('fill', config.circleColor)
        .attr('transform', 'translate(' + radius + ',' + radius + ')')

    // Text where the wave does not overlap.
    let text1 = gaugeGroup.append('text')
        .text(textRounder(textStartValue) + percentText)
        .attr('class', 'liquidFillGaugeText')
        .attr('text-anchor', 'middle')
        .attr('font-size', textPixels + 'px')
        .style('fill', config.textColor)
        .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')')

    // The clipping wave area.
    const dblPi = Math.PI * 2
    let clipArea = d3.svg.area()
        .x(d => waveScaleX(d.x))
        .y0(d => waveScaleY(Math.sin(dblPi * config.waveOffset * -1 + dblPi * (1 - config.waveCount) + d.y * dblPi)))
        .y1(() => (fillCircleRadius * 2 + waveHeight))
    let waveGroup = gaugeGroup
        .append('defs')
        .append('clipPath')
        .attr('id', 'clipWave' + elementId)
    let wave = waveGroup
        .append('path')
        .datum(data)
        .attr('d', clipArea)
        .attr('T', 0)

    // The inner circle with the clipping wave attached.
    let fillCircleGroup = gaugeGroup
        .append('g')
        .attr('clip-path', 'url(#clipWave' + elementId + ')')
    fillCircleGroup.append('circle')
        .attr('cx', radius)
        .attr('cy', radius)
        .attr('r', fillCircleRadius)
        .style('fill', config.waveColor)

    // Text where the wave does overlap.
    let text2 = fillCircleGroup
        .append('text')
        .text(textRounder(textStartValue) + percentText)
        .attr('class', 'liquidFillGaugeText')
        .attr('text-anchor', 'middle')
        .attr('font-size', textPixels + 'px')
        .style('fill', config.waveTextColor)
        .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')')

    // Make the value count up.
    if (config.valueCountUp) {
        let textTween = function () {
            let i = d3.interpolate(this.textContent, textFinalValue)
            return function (t) {
                this.textContent = textRounder(i(t)) + percentText
            }
        }
        text1
            .transition()
            .duration(config.waveRiseTime)
            .tween('text', textTween)
        text2
            .transition()
            .duration(config.waveRiseTime)
            .tween('text', textTween)
    }

    // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement
    // can be controlled independently.
    let waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth
    if (config.waveRise) {
        waveGroup
            .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
            .transition()
            .duration(config.waveRiseTime)
            .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')')
            .each('start', () => {
                wave.attr('transform', 'translate(1,0)')
            }) // This transform is necessary to get the clip wave positioned correctly when
        // waveRise=true and waveAnimate=false. The wave will not position correctly without this,
        // but it's not clear why this is actually necessary.
    } else {
        waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')')
    }

    if (config.waveAnimate) {
        animateWave()
    }

    function animateWave() {
        wave.attr('transform', 'translate(' + waveAnimateScale(wave.attr('T')) + ',0)')
        wave
            .transition()
            .duration(config.waveAnimateTime * (1 - wave.attr('T')))
            .ease('linear')
            .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
            .attr('T', 1)
            .each('end', () => {
                wave.attr('T', 0)
                animateWave(config.waveAnimateTime)
            })
    }
}

function create_cell(value, td, float) {
    if (value) {
        if (float) {
            value = parseFloat((value) * 100).toFixed(2)
            td.text(BaseManager.numberFormat(value, true, false, true)).addClass('after-percent')
        } else {
            value = parseFloat(value).toFixed(0)
            td.text(BaseManager.numberFormat(value, false, false, true)).addClass('after-percent')
        }
    } else {
        td.text('').removeClass('after-percent')
    }
    td.removeClass('positive positive-black negative')
    if (value < 0) {
        td.addClass('negative')
    } else if (value > 0) {
        td.addClass('positive positive-black')
    }

    if (value && td.closest('tr').data('vat')) {
        td.text('')
        td.append(`<label class="no-margin" style="font-weight: 400;">${BaseManager.numberFormat(value, false, false, true)}<span style="padding-right: 5px;float: left;">${global.company.currency}</span></label>`)
    }
}

function checkValue(avg_data, float) {
    let return_string = '--'
    if (avg_data > 1000000000) {
        avg_data /= 1000000
        return_string = BaseManager.numberFormat(avg_data, false, undefined, true) + 'M'
    } else if (avg_data > 1000000) {
        avg_data /= 1000
        return_string = BaseManager.numberFormat(avg_data, false, undefined, true) + 'K'
    } else {
        return_string = BaseManager.numberFormat(avg_data, false, undefined, true)
    }
    return return_string
}

function resizeFont(obj) {
    $('.main-number', obj).css('font-size', 72)
    let secondary_width = $('.aux-number', obj).width()
    let parent_width = $('.main-number', obj).parent().parent().width()
    let main_width = $('.main-number', obj).width()

    let max_font_size_percent = 72
    let fill_width = parseInt(parent_width) - parseInt(secondary_width) - 12
    let max_font_percent = fill_width / main_width
    max_font_percent *= max_font_size_percent
    if (max_font_percent > max_font_size_percent) {
        max_font_percent = max_font_size_percent
    }
    $('.main-number', obj).css('font-size', parseInt(max_font_percent))
}

function createCompare(graph, tabObj) {
    let columns = [['x'], ['data_1'], ['data_2'], ['data_3']]
    let total = ['data_1', 0, 0, 0]
    let data = null
    if (typeof tabObj != 'undefined') {
        data = tabObj
        for (let index in data) {
            columns[0].push(parseInt(index) + 1)
            columns[1].push(data[index].last_year_before)
            columns[2].push(data[index].last_year)
            columns[3].push(data[index].this_year)
            total[1] += data[index].last_year_before
            total[2] += data[index].last_year
            total[3] += data[index].this_year
        }
        if ($.contains(document, graph.get(0))) {
            graph.find('.graph').removeClass('loading').each((index, $graph) => {
                $($graph).find('.c3').data('c3').load({
                    columns: ($($graph).hasClass('total') ? [total] : columns)
                })
            })
        }
    }
}

function updateTopDonut(topDonut, data, legend) {
    let j
    let column_list = []
    let names_dict = {}
    let sales = 0
    legend.empty()
    for (j = 0; j < data.length; j++) {
        if ((data[j].sales / sales * 100).toFixed(2) >= 0.1) {
            sales += parseFloat(data[j].sales)
        }
    }
    for (j = 0; j < data.length; j++) {
        let percent = (data[j].sales / sales * 100).toFixed(2)
        if (percent >= 0.1) {
            column_list.push(['data' + j, data[j].sales])
            names_dict['data' + j] = data[j].nm
            let elm1 = $('<span/>').css({
                'margin-left': '6px'
            }).addClass('bold').text((percent >= 0.1 ? percent : '< 0.1') + '% ')
            let elm2 = $('<span/>').text(data[j].nm)
            legend
                .append($('<li />')
                    .data('id', 'data' + j)
                    .append(elm1)
                    .append(elm2))
        }
    }
    if (column_list && topDonut) {
        topDonut.load({
            unload: true,
            columns: column_list
        })
        topDonut.data.names(names_dict)
    }
}

function updateTopTable(topTable, data, addCurrency) {
    if (typeof addCurrency == 'undefined') {
        addCurrency = false
    }
    let j
    topTable.empty()
    let sales = 0
    for (j = 0; j < data.length; j++) {
        if (data[j]['sales'] * 100 / sales >= 0.1) {
            sales += data[j]['sales']
        }
    }
    for (j = 0; j < data.length; j++) {
        let row = data[j]
        let percent = row['sales'] * 100 / sales
        if (percent >= 0.1) {
            let newRow = $('<tr />')
            newRow.append($('<td />').text(row['nm']))
            newRow.append($('<td />').append(
                $('<div />').append(
                    $('<div />')
                        .animate({
                            width: percent + '%',
                            title: ''
                        })
                        .append($('<span />')
                            .text(percent >= 0.01 ? BaseManager.numberFormat(percent) : '< 0.01'))
                )
            ))
            if (topTable.selector == '#top_items_month_qty tbody' || topTable.selector == '#top_items_year_qty tbody') {
                newRow
                    .append($('<td />')
                        .text(BaseManager.numberFormat(parseFloat(row['sales']).toFixed(0), false, false, true, global.format.quantity)))
            } else {
                newRow.append($('<td />').text(BaseManager.numberFormat(parseFloat(row['sales']).toFixed(0), false, false, true) + (addCurrency ? ' ' + global.company.currency : '')))
            }

            topTable.append(newRow)
        }
    }
}

function updateTopTableManufacturers(topTable, data, addCurrency) {
    if (typeof addCurrency == 'undefined') {
        addCurrency = false
    }
    topTable.empty()
    let sales = data.reduce((sum, value) => sum + value.sales, 0)
    data.forEach((manufacturer) => {
        let percent = manufacturer.sales / sales * 100
        let newRow = $('<tr />')
        newRow.append($('<td />').text(manufacturer.nm))
        newRow.append($('<td />').append(
            $('<div />').append(
                $('<div />')
                    .animate({
                        width: percent + '%',
                        title: ''
                    })
                    .append($('<span />').text(percent >= 0.01 ? BaseManager.numberFormat(percent) : '< 0.01'))
            )
        ))
        newRow.append($('<td />').text(BaseManager.numberFormat(manufacturer.sales) + (addCurrency ? ' ' + global.company.currency : '')))
        topTable.append(newRow)
        let total_qty = data.reduce((qty, value) => qty + value.sales_qty, 0)
        let percentQty = manufacturer.sales_qty / total_qty * 100
        let newRowQty = $('<tr />', {
            class: 'grey-row'
        })
        newRowQty.append($('<td />').text(manufacturer.nm))
        newRowQty.append($('<td />').append(
            $('<div />').append(
                $('<div />')
                    .animate({
                        width: percentQty + '%',
                        title: ''
                    })
                    .append($('<span />').text(percentQty >= 0.01 ? BaseManager.numberFormat(percentQty) : '< 0.01'))
            )
        ))
        newRowQty.append($('<td />').text(BaseManager.numberFormat(manufacturer.sales_qty, true, false, false, global.format.quantity)))
        topTable.append(newRowQty)
    })
}

// region dashboard
function updateDashboard(tabContent, tabObj, isTab) {
    let nmTab = 'dashboard'
    if (typeof tabContent == 'undefined' && typeof tabObj == 'undefined') {
        let tabIndex = getTableOrTab(nmTab)
        if (tabIndex != null) {
            tabObj = BaseManager.tab.tabs[tabIndex]
            tabContent = tabObj.content
        }
    }
    if (typeof tabContent != 'undefined' && typeof tabObj != 'undefined') {

        const yearElementIds = [
            '#top_customers_year',
            '#top_items_year',
            '#top_items_year_qty',
            '#top_manufacturers_year',
            '#top_manufacturers_year_qty',
            '#top_locations_year',
            '#top_customers_companies_year'
        ]
        tabContent.find(yearElementIds.join(', ')).find('.hasDatePicker').trigger('changeYear')

        const mounthElementIds = [
            '#top_customers_month',
            '#top_items_month',
            '#top_items_month_qty',
            '#top_manufacturers_month',
            '#top_manufacturers_month_qty',
            '#top_locations_month',
            '#top_customers_companies_month'
        ]
        tabContent.find(mounthElementIds.join(', ')).find('.hasDatePicker').trigger('changeMonth')

        const dayElementIds = [
            '#graph_today',
            '#today_compare_graph',
            '#graph_month',
            '#vat_groups'
        ]
        tabContent.find(dayElementIds.join(', ')).find('.hasDatePicker').trigger('changeDate')

        const avgElementIds = [
            '#avg_receipt_month',
            '#avg_nr_customers_month',
            '#avg_nr_sales_customers_month'
        ]
        tabContent.find(avgElementIds.join(', ')).find('.hasDatePicker').trigger('change')

        let locations = $.param({ 'location': tabObj.locations.filter(x => x.checked).map(x => x.id) })
        let all_locations = tabObj.all_locations

        if (tabObj._ajax_requests.avg_buying_circle_day) {
            tabObj._ajax_requests.avg_buying_circle_day.abort()
        }
        let buying_circle_params = {
            all_locations: all_locations
        }
        let buying_circle_url = `/dashboard/avg_buying_circle_day/?${locations}&${$.param(buying_circle_params)}`
        tabObj._ajax_requests.avg_buying_circle_day = $.get(buying_circle_url, response => {
            let value
            let timeWord
            if (response.avg_minutes >= 1) {
                value = response.avg_minutes
                timeWord = BaseManager.__('Minutes', 'minutes', true)
            } else {
                value = response.avg_seconds
                timeWord = BaseManager.__('Seconds', 'seconds', true)
            }
            $('#avg_buying_circle_day .main-number', tabContent).text(checkValue(value, false))
            $('#avg_buying_circle_day .aux-number', tabContent).text(timeWord)
            resizeFont($('#avg_buying_circle_day', tabContent))
        })

        if (tabObj._ajax_requests.graph_data) {
            tabObj._ajax_requests.graph_data.abort()
        }
        let graph_data_params = {
            all_locations: all_locations
        }
        let graph_data_url = `/dashboard/graph-data/?${locations}&${$.param(graph_data_params)}`
        tabObj._ajax_requests.graph_data = $.getJSON(graph_data_url, response => {
            let statCashFlowTableRows = ['incomes', 'expenses', 'cashflow']
            let statIncomeTableRows = ['sales', 'profit', 'profitp']
            let statTableCols = [
                'today_report',
                'yesterday_report',
                'this_week_report',
                'this_month_report',
                'this_year_report'
            ]
            let columnsLength = statTableCols.length

            statCashFlowTableRows.forEach((element, index) => {
                for (let i = 0; i < columnsLength; i++) {
                    let td = tabContent.find('#cashflow-table').find('tr').eq(index + 1).find('td').eq(i)
                    let value = response.tables_data[i][element]
                    create_cell(value, td, false)
                }
            })

            statIncomeTableRows.forEach((element, index) => {
                for (let i = 0; i < columnsLength; i++) {
                    let td = tabContent.find('#profit-table').find('tr').eq(index + 1).find('td').eq(i)
                    let value = response.tables_data[i][element]
                    let float = element == 'profitp'
                    create_cell(value, td, float)
                }
            })

            for (let k = 0; k < tabContent.find('.select-input').length; k++) {
                tabContent.find('.select-input')[k].value = tabContent.find('#group_month')[0][0].text
            }

            setTimeout(() => {
                tabObj.content.getNiceScroll().resize()
            }, 0)
        })

        let gauges_data_url = `/dashboard/gauges-data/?${locations}&${$.param(graph_data_params)}`
        tabObj._ajax_requests.gauges_data = $.getJSON(gauges_data_url, response => {
            let last_week_now_value = response.today_last_week_now || 0
            tabObj._last_week_now = loadLiquidFillGauge('last_week_now', last_week_now_value)
            let last_week_full_value = response.today_last_week_all_day || 0
            tabObj._last_week_full = loadLiquidFillGauge('last_week_full', last_week_full_value)
            let last_month_now_value = response.today_last_month_now || 0
            tabObj._last_month_now = loadLiquidFillGauge('last_month_now', last_month_now_value)
            let last_month_full_value = response.today_last_month_all_day || 0
            tabObj._last_month_full = loadLiquidFillGauge('last_month_full', last_month_full_value)
            let last_year_now_value = response.today_last_year_now || 0
            tabObj._last_year_now = loadLiquidFillGauge('last_year_now', last_year_now_value)
            let last_year_full_value = response.today_last_year_all_day || 0
            tabObj._last_year_full = loadLiquidFillGauge('last_year_full', last_year_full_value)
        })

        let last_three_years_incomes_url = `/dashboard/last-three-years-incomes/?${locations}&${$.param(graph_data_params)}`
        tabObj._ajax_requests.last_three_years_incomes = $.getJSON(last_three_years_incomes_url, response => {
            createCompare(tabContent.find('#graph_compare.graph_income'), response)
        })

        let last_three_years_expenses_url = `/dashboard/last-three-years-expenses/?${locations}&${$.param(graph_data_params)}`
        tabObj._ajax_requests.last_three_years_expenses = $.getJSON(last_three_years_expenses_url, response => {
            createCompare(tabContent.find('#graph_compare.graph_expenses'), response)
        })

        let five_years_charts_url = `/dashboard/five-years-charts/?${locations}&${$.param(graph_data_params)}`
        tabObj._ajax_requests.five_years_charts = $.getJSON(five_years_charts_url, response => {
            if (isTab) {
                let graphics_tab = getTableOrTab(nmTab)
                let graphics_tab_has_no_data = typeof BaseManager.tab.tabs[graphics_tab]._data == 'undefined'
                if (BaseManager.tab.tabs.length <= graphics_tab || graphics_tab_has_no_data) {
                    return
                }
                BaseManager.tab.tabs[graphics_tab]._data.five_years_charts = response
            }
            tabContent.find('#graph_year').find('.hasDatePicker').trigger('changeYear')
        })
    }
}

function updateLang() {
    var N_Lang;
    if (global.user.current_language_code == "en-US")
        N_Lang = "1";
    else
        N_Lang = "0";
    $.ajax({
        url: "Default.aspx",
        data: {
            status: "changeLanguage",
            N_Lang: N_Lang
        },
        method: 'Post',
        async: false,
        cache: false,
        success: function (data) {
            var resData = JSON.parse(data);
            if (resData.success) {
                changeStyleLanguage();
            }
        }
    })
}

function changeStyleLanguage() {
    if (global.user.current_language_code !== "he") {
        var para = document.getElementsByTagName('head')[0]
        var a = document.createElement('link');
        a.rel = "stylesheet";
        a.href = "css/style-en.css";
        para.appendChild(a);
    }
    else {
        if (document.querySelectorAll('link[rel=stylesheet][href~="css/style-en.css"]')[0] != undefined)
            document.querySelectorAll('link[rel=stylesheet][href~="css/style-en.css"]')[0].remove();
    }

}

function updateCompanyLocationName(tabContent, tabObj) {
    if (typeof window.updateCompanyLocationNameTimer != 'undefined') {
        clearTimeout(window.updateCompanyLocationNameTimer)
    }
    window.updateCompanyLocationNameTimer = setTimeout(() => {
        let checkedLocations = tabObj.locations.filter(x => x.checked)
        if (!tabObj.all_locations && checkedLocations.length > 0) {
            $('.selected-company-locations', tabContent).text(checkedLocations.map(x => x.nm).join(', '))
        } else {
            $('.selected-company-locations', tabContent).text(BaseManager.__('All', 'All').text)
        }
        $('.row.main', tabObj.content).first().css('margin-top', $('.charts-filters', tabObj.content).height() + 20 + 'px')
    }, 10)
}

function createDashboard(tabContent, tabObj, isTab) {
    $(window).on('resize.dashboard', () => {
        tabObj.content
            .find('#avg_receipt_month, #avg_nr_customers_month, #avg_nr_sales_customers_month')
            .each((index, $element) => {
                resizeFont($element)
            })
    })

    tabContent.find('.select').each((index, $select) => {
        if (($($select).closest('.ignore-inputs').length)) {
            return
        }
        if (!$($select).hasClass('hasSelect')) {
            $($select).data('select', new Select($select, undefined))
        }
    })

    let monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ]
    tabObj._data = {}
    tabObj._ajax_requests = {}
    tabObj.locations = []
    tabObj.all_locations = true

    let group_id_month = 'all'
    let group_id_year = 'all'

    tabContent.find('#group_month').change(function () {
        let date_datepicker = $('#top_items_month .datepicker', tabContent).val()
        let date = date_datepicker.split('/')
        let month = parseInt(date[0])
        let fullYear = parseInt(date[1])
        group_id_month = $(this).val()
        let locations = $.param({ 'location': tabObj.locations.filter(x => x.checked).map(x => x.id) })
        let all_locations = tabObj.all_locations

        if (tabObj._ajax_requests.top_items_month) {
            tabObj._ajax_requests.top_items_month.abort()
        }
        let parameters = {
            month: month,
            year: fullYear,
            group_id: group_id_month,
            all_locations: all_locations
        }
        let url = '/dashboard/top-items/?' + locations + '&' + $.param(parameters)
        tabObj._ajax_requests.top_items_month = $.get(url, response => {
            let topDonut = tabContent.find('#top_items_month').find('.c3').data('c3')
            let topTable = tabContent.find('#top_items_month').find('tbody')
            let legend = tabContent.find('#top_items_month .legend ul')
            if (topDonut) {
                updateTopDonut(topDonut, response['data'], legend)
            }
            if (topTable) {
                updateTopTable(topTable, response['data'], true)
            }
        })
        let selected_group = $('#top_items_month option:selected', tabContent)
        let item_sales = $('#top_items_month [data-i18n="DashboardItemName"]', tabContent).next()
        if ($.trim(selected_group.val()) != 'all') {
            item_sales.text(BaseManager.__('DashboardSalesFromGroup', 'Proceeds % from group', true))
            item_sales.attr('data-i18n', 'DashboardSalesFromGroup')
        } else {
            item_sales.text(BaseManager.__('DashboardSalesFromTotal', 'Proceeds % from total', true))
            item_sales.attr('data-i18n', 'DashboardSalesFromTotal')
        }
        if (tabObj._ajax_requests.top_items_qty_month) {
            tabObj._ajax_requests.top_items_qty_month.abort()
        }
        parameters = {
            month: month,
            year: fullYear,
            group_id: group_id_month
        }
        url = '/dashboard/top-items-qty/?' + $.param(parameters)
        tabObj._ajax_requests.top_items_qty_month = $.get(url, response => {
            let topDonut = tabContent.find('#top_items_month_qty').find('.c3').data('c3')
            let topTable = tabContent.find('#top_items_month_qty').find('tbody')
            let legend = tabContent.find('#top_items_month_qty .legend ul')
            if (topDonut) {
                updateTopDonut(topDonut, response['data'], legend)
            }
            if (topTable) {
                updateTopTable(topTable, response['data'])
            }
        })
    })

    tabContent.find('#avg_receipt_month .datepicker').change(e => {
        let date_datepicker = e.target.value
        if (date_datepicker.trim()) {
            let date = date_datepicker.split('/')
            let month = parseInt(date[0])
            let year = parseInt(date[1])
            let locations = $.param({ 'location': tabObj.locations.filter(x => x.checked).map(x => x.id) })
            let all_locations = tabObj.all_locations

            if (tabObj._ajax_requests.avg_receipt_month) {
                tabObj._ajax_requests.avg_receipt_month.abort()
            }
            let parameters = {
                all_locations: all_locations
            }
            let url = `/dashboard/avg_receipt_month/${month}/${year}/?${locations}&${$.param(parameters)}`
            tabObj._ajax_requests.avg_receipt_month = $.get(url, response => {
                $(e.target).parent().find('[data-i18n=HeaderAverageReceipt]').data()['i18n-options'] = {
                    month: monthNames[month - 1],
                    year: year
                }
                $(e.target).parent().find('[data-i18n=HeaderAverageReceipt]').i18n()
                $('#avg_receipt_month .main-number', tabContent).text(checkValue(response.avg_month))
                $('#avg_receipt_month .aux-number', tabContent).text(checkValue(response.avg_year))
                $('#avg_receipt_month .aux-currency', tabContent).text(`${global.company.currency}`)
                resizeFont($('#avg_receipt_month', tabContent))
            })
        }
    })

    tabContent.find('#avg_nr_customers_month .datepicker').change(e => {
        let date_datepicker = e.target.value
        if (date_datepicker.trim()) {
            let date = date_datepicker.split('/')
            let month = parseInt(date[0])
            let year = parseInt(date[1])
            let locations = $.param({ 'location': tabObj.locations.filter(x => x.checked).map(x => x.id) })
            let all_locations = tabObj.all_locations

            if (tabObj._ajax_requests.avg_nr_customers_month) {
                tabObj._ajax_requests.avg_nr_customers_month.abort()
            }
            let params = {
                all_locations: all_locations
            }
            let url = `/dashboard/avg_nr_customers_month/${month}/${year}/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.avg_nr_customers_month = $.get(url, response => {
                $(e.target).parent().find('[data-i18n=HeaderNumberCustomers]').data()['i18n-options'] = {
                    month: monthNames[month - 1],
                    year: year
                }
                $(e.target).parent().find('[data-i18n=HeaderNumberCustomers]').i18n()
                $('#avg_nr_customers_month .main-number', tabContent).text(checkValue(response.avg_month, false))
                $('#avg_nr_customers_month .aux-number', tabContent).text(checkValue(response.avg_year, false))
                resizeFont($('#avg_nr_customers_month', tabContent))
            })
        }
    })

    tabContent.find('#avg_nr_sales_customers_month .datepicker').change(e => {
        let date_datepicker = e.target.value
        if (date_datepicker.trim()) {
            let date = date_datepicker.split('/')
            let month = parseInt(date[0])
            let year = parseInt(date[1])
            let locations = $.param({ 'location': tabObj.locations.filter(x => x.checked).map(x => x.id) })
            let all_locations = tabObj.all_locations
            if (tabObj._ajax_requests.avg_nr_sales_customers_month) {
                tabObj._ajax_requests.avg_nr_sales_customers_month.abort()
            }
            let params = {
                all_locations: all_locations
            }
            let url = `/dashboard/avg_nr_sales_customers_month/${month}/${year}/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.avg_nr_sales_customers_month = $.get(url, response => {
                $(e.target).parent().find('[data-i18n=HeaderAverageSalesPerCustomer]').data()['i18n-options'] = {
                    month: monthNames[month - 1],
                    year: year
                }
                $(e.target).parent().find('[data-i18n=HeaderAverageSalesPerCustomer]').i18n()
                $('#avg_nr_sales_customers_month .main-number', tabContent).text(checkValue(response.avg_month))
                $('#avg_nr_sales_customers_month .aux-number', tabContent).text(checkValue(response.avg_year))
                $('#avg_nr_sales_customers_month .aux-currency', tabContent).text(`${global.company.currency}`)
                resizeFont($('#avg_nr_sales_customers_month', tabContent))
            })
        }
    })

    tabContent.find('#group_year').change(function () {
        group_id_year = $(this).val()
        let fullYear = $('#top_items_year .datepicker', tabContent).val()
        let locations = $.param({ 'location': tabObj.locations.filter(x => x.checked).map(x => x.id) })
        let all_locations = tabObj.all_locations
        if (tabObj._ajax_requests.top_items_year) {
            tabObj._ajax_requests.top_items_year.abort()
        }
        let params = {
            all_locations: all_locations,
            year: fullYear,
            group_id: group_id_year
        }
        let url = `/dashboard/top-items/?${locations}&${$.param(params)}`
        tabObj._ajax_requests.top_items_year = $.get(url, response => {
            let topDonut = tabContent.find('#top_items_year').find('.c3').data('c3')
            let topTable = tabContent.find('#top_items_year').find('tbody')
            let legend = tabContent.find('#top_items_year .legend ul')
            if (topDonut) {
                updateTopDonut(topDonut, response['data'], legend)
            }
            if (topTable) {
                updateTopTable(topTable, response['data'], true)
            }
        })
        let selected_group = $('#top_items_year option:selected', tabContent)
        let item_sales = $('#top_items_year [data-i18n="DashboardItemName"]', tabContent).next()
        if ($.trim(selected_group.val()) != 'all') {
            item_sales.text(BaseManager.__('DashboardSalesFromGroup', 'Proceeds % from group', true))
            item_sales.attr('data-i18n', 'DashboardSalesFromGroup')
        } else {
            item_sales.text(BaseManager.__('DashboardSalesFromTotal', 'Proceeds % from total', true))
            item_sales.attr('data-i18n', 'DashboardSalesFromTotal')
        }
        if (tabObj._ajax_requests.top_items_qty_year) {
            tabObj._ajax_requests.top_items_qty_year.abort()
        }
        url = `/dashboard/top-items-qty/?year=${fullYear}&group_id=${group_id_year}`
        tabObj._ajax_requests.top_items_qty_year = $.get(url, response => {
            let topDonut = tabContent.find('#top_items_year_qty').find('.c3').data('c3')
            let topTable = tabContent.find('#top_items_year_qty').find('tbody')
            let legend = tabContent.find('#top_items_year_qty .legend ul')
            if (topDonut) {
                updateTopDonut(topDonut, response['data'], legend)
            }
            if (topTable) {
                updateTopTable(topTable, response['data'])
            }
        })
    })

    $('.datepicker', tabContent).each(function () {
        let d = new Date()
        let startDate = new Date()
        let opts = {
            format: 'dd/mm/yyyy',
            autoclose: true,
            startDate: new Date(1900, 0, 1)
        }
        const mounthElementIds = [
            '#top_customers_month',
            '#top_items_month',
            '#top_items_month_qty',
            '#top_manufacturers_month',
            '#top_manufacturers_month_qty',
            '#top_locations_month',
            '#avg_receipt_month',
            '#avg_nr_customers_month',
            '#avg_nr_sales_customers_month',
            '#top_customers_companies_month'
        ]
        const yearElementIds = [
            '#graph_year',
            '#top_customers_year',
            '#top_items_year',
            '#top_items_year_qty',
            '#top_manufacturers_year',
            '#top_manufacturers_year_qty',
            '#top_locations_year',
            '#top_customers_companies_year'
        ]
        if ($(this).parents(mounthElementIds.join(', ')).length) {
            opts['format'] = 'mm/yyyy'
            opts['minViewMode'] = 'months'
            startDate.setMonth(d.getMonth() - 23)
            opts['startDate'] = startDate
            opts['endDate'] = d
        }
        else if ($(this).parents(yearElementIds.join(', ')).length) {
            opts['format'] = 'yyyy'
            opts['minViewMode'] = 'years'
            startDate.setFullYear(d.getFullYear() - 4)
            opts['startDate'] = startDate
            opts['endDate'] = d
        }
        else if ($(this).parents('#graph_month').length) {
            if ($(this).attr('id') == 'graph_month_from') {
                d.setDate(1)
            } else {
                d.setMonth(d.getMonth() + 1)
                d.setDate(0)
            }
            opts['format'] = global.format.date
        }
        else if ($(this).parents('#vat_groups').length) {
            if ($(this).attr('id') == 'vat_groups_from') {
                d.setDate(1)
            }
            opts['format'] = global.format.date
        } else {
            opts['endDate'] = d
        }

        $(this)
            .datepicker(opts)
            .addClass('hasDatePicker')
            .datepicker('setDate', BaseManager.dateFormat(BaseManager.dateParse(d, undefined, false, false), opts['format']))
    })

    let first_sale = BaseManager.dateParse(global.first_sale_date)
    let last_year = new Date((new Date()).getFullYear() - 1, 0, 2)
    let minDate = (!first_sale || first_sale < last_year) ? last_year : first_sale
    let date_from = BaseManager.dateParse($('#vat_groups_from', tabContent).val(), undefined, false, false)
    let date_to = BaseManager.dateParse($('#vat_groups_to', tabContent).val(), undefined, false, false)
    let timer = null

    $('.hasDatePicker', tabContent).parent().click(function () {
        $('.hasDatePicker', this).datepicker('show')
    })

    $('.locations-filters.glyphicon-filter', tabContent).on('click', () => {
        bi_locations_filters(tabObj.locations, locations => {
            tabObj.locations = locations
            let exists_checked = locations.some(x => x.checked)
            let exists_unchecked = locations.some(x => !x.checked)
            tabObj.all_locations = exists_checked && !exists_unchecked || !exists_checked && exists_unchecked
            updateCompanyLocationName(tabContent, tabObj)
            updateDashboard(tabContent, tabObj, isTab)
        })
    })


    $('.hasDatePicker', tabContent).on('changeDate', function (e) {
        function updateGraph(e, data) {
            for (let index in data) {
                columns[0].push(new Date(data[index].date))
                columns[1].push(data[index].income)
                total[1] += data[index].income
                columns[2].push(data[index].expence)
                total[2] += data[index].expence
            }
            if ($.contains(document, e.target)) {
                let categories = [
                    BaseManager.__('DashboardIncome', 'DashboardIncome', true),
                    BaseManager.__('DashboardExpenses', 'DashboardExpenses', true)
                ]
                let data = {
                    data_1: BaseManager.__('DashboardIncome', 'DashboardIncome', true),
                    data_2: BaseManager.__('DashboardExpenses', 'DashboardExpenses', true)
                }
                $(e.target).closest('.row').find('.graph').removeClass('loading').each(function () {
                    $(this).find('.c3').data('c3').load(($(this).hasClass('total') ? {
                        columns: [total],
                        categories: categories
                    } : {
                            columns: columns
                        }))
                    $(this).find('.c3').data('c3').data.names($(this).hasClass('total') ? {
                        data_1: BaseManager.__('GraphAmount', 'Amount', true)
                    } : data)
                })
                let column_list = []
                if (total[1]) {
                    column_list.push(['data_1', total[1]])
                }
                if (total[2]) {
                    column_list.push(['data_2', total[2]])
                }
                $(e.target).closest('.row').find('.donut').removeClass('loading').each(function () {
                    $(this).data('c3').load({
                        unload: true,
                        columns: column_list
                    })
                    $(this).data('c3').data.names(data)
                })
            }
        }

        let d = new Date()
        let url = ''
        let graph = null
        let total = ['data_1', 0, 0]
        let columns = [['x'], ['data_1'], ['data_2']]
        if (e.date) {
            d = new Date(e.date)
        } else if ($(e.target).val()) {
            d = $(e.target).datepicker('getDate')
        }
        let fullYear = d.getFullYear()
        let date = d.getDate()
        let month = d.getMonth()
        let locations = $.param({ 'location': tabObj.locations.filter(x => x.checked).map(x => x.id) })
        let all_locations = tabObj.all_locations
        if ($(this).parents('#graph_today').length) {
            let day = ('0' + date).slice(-2)
            let _month = ('0' + (month + 1)).slice(-2)
            let params = {
                all_locations: all_locations
            }
            url = `/dashboard/day-data/${day}/${_month}/${fullYear}/?${locations}&${$.param(params)}`
            graph = 'graph_today'
            BaseManager.i18n(null, $(this).prev().data('i18n-options', {
                date: date,
                month: monthNames[month],
                year: fullYear
            }))
        }
        else if ($(this).parents('#today_compare_graph').length) {
            let day = ('0' + date).slice(-2)
            let _month = ('0' + (month + 1)).slice(-2)
            let params = {
                all_locations: all_locations
            }
            url = `/dashboard/income-compare-data/${day}/${_month}/${fullYear}/?${locations}&${$.param(params)}`
            BaseManager.i18n(null, $(this).prev().data('i18n-options', {
                date: date,
                month: monthNames[month],
                year: fullYear
            }))
            tabObj._ajax_requests['today_compare_graph'] = $.get(url, data => {
                let columns = [['x'], ['data_1'], ['data_2'], ['data_3'], ['data_4']]
                for (let index in data) {
                    columns[0].push(new Date(data[index].date))
                    columns[1].push(data[index].today)
                    columns[2].push(data[index].week_ago)
                    columns[3].push(data[index].month_ago)
                    columns[4].push(data[index].year_ago)
                }
                if ($.contains(document, e.target)) {
                    let data = {
                        data_1: BaseManager.__('DashboardIncomeToday', 'DashboardIncomeToday', true),
                        data_2: BaseManager.__('DashboardIncomeWeekAgo', 'DashboardIncomeWeekAgo', true),
                        data_3: BaseManager.__('DashboardIncomeMonthAgo', 'DashboardIncomeMonthAgo', true),
                        data_4: BaseManager.__('DashboardIncomeLastYear', 'DashboardIncomeYearAgo', true)
                    }
                    $(e.target).closest('.row').find('.graph').removeClass('loading').each(function () {
                        $(this).find('.c3').data('c3').load({
                            columns: columns
                        })
                        $(this).find('.c3').data('c3').data.names(data)
                    })
                }
            })
        }
        else if ($(this).parents('#graph_month').length) {
            let fromDateInput = $('#graph_month_from', tabContent)
            let toDateInput = $('#graph_month_to', tabContent)

            let dateFrom = fromDateInput.datepicker('getDate')
            let dateTo = toDateInput.datepicker('getDate')
            let startDate
            let endDate

            startDate = new Date(dateFrom)
            toDateInput.datepicker('setStartDate', startDate)

            endDate = new Date(dateFrom)
            endDate.setDate(endDate.getDate() + 60)
            toDateInput.datepicker('setEndDate', endDate)

            endDate = new Date(dateTo)
            fromDateInput.datepicker('setEndDate', endDate)

            startDate = new Date(dateTo)
            startDate.setDate(startDate.getDate() - 60)
            fromDateInput.datepicker('setStartDate', startDate)

            let params = {
                all_locations: all_locations,
                fromDate: fromDateInput.val(),
                toDate: toDateInput.val()
            }
            url = `/dashboard/month-data/?${locations}&${$.param(params)}`
            graph = 'graph_month'
            BaseManager.i18n(null, $(this).prev().data('i18n-options', {
                month: monthNames[month],
                year: fullYear
            }))
        }
        else if ($(this).parents('#vat_groups').length) {
            let fromDateInput = $('#vat_groups_from', tabContent)
            let toDateInput = $('#vat_groups_to', tabContent)
            if (tabObj._ajax_requests.vat_groups_breakdown) {
                tabObj._ajax_requests.vat_groups_breakdown.abort()
            }
            let customers_companies = $('#customers_companies', tabContent).find('input:checkbox:checkbox:checked').serialize()
            let params = {
                all_locations: all_locations,
                fromDate: fromDateInput.val(),
                toDate: toDateInput.val()
            }
            let url = `/dashboard/vat_groups_breakdown/?${customers_companies}&${locations}&${$.param(params)}`
            tabObj._ajax_requests.vat_groups_breakdown = $.get(url, response => {
                let table = tabContent.find('#vat-groups-table')
                Object.keys(response).forEach(key => {
                    let values = response[key]
                    let tr = table.find(`tr[data-vat="${key}"]`)

                    let income_td = tr.find('td').eq(1)
                    create_cell(values.sales_value, income_td)

                    let income_vat_td = tr.find('td').eq(2)
                    create_cell(values.sales_vat_value, income_vat_td)

                    let expense_td = tr.find('td').eq(3)
                    create_cell(values.expenses_value, expense_td)

                    let expense_vat_td = tr.find('td').eq(4)
                    create_cell(values.expenses_vat_value, expense_vat_td)

                    let sales_vat_value
                    let expenses_vat_value
                    if (!values.sales_vat_value) {
                        sales_vat_value = 0
                    } else {
                        sales_vat_value = values.sales_vat_value
                    }
                    if (!values.expenses_vat_value) {
                        expenses_vat_value = 0
                    } else {
                        expenses_vat_value = values.expenses_vat_value
                    }
                    let difference_vat_td = tr.find('td').eq(5)
                    create_cell(sales_vat_value - expenses_vat_value, difference_vat_td)
                })
            })
        }
        $(e.target).closest('.row').find('.graph').addClass('loading')
        if (graph === null) {
            return
        }
        if (tabObj._ajax_requests[graph]) {
            tabObj._ajax_requests[graph].abort()
        }
        tabObj._ajax_requests[graph] = $.get(url, response => {
            updateGraph(e, response)
        })
    })

    $('.hasDatePicker', tabContent).on('changeMonth', function (e) {
        $(e.target).closest('.row').find('.graph').addClass('loading')
        let d = new Date()
        if (e.date) {
            d = new Date(e.date)
        } else if ($(e.target).val()) {
            d = $(e.target).datepicker('getDate')
        }
        let fullYear = d.getFullYear()
        let month = d.getMonth()
        let locations = $.param({ 'location': tabObj.locations.filter(x => x.checked).map(x => x.id) })
        let all_locations = tabObj.all_locations
        if ($(this).parents('#top_customers_month').length) {
            BaseManager.i18n(null, $(this).prev().data('i18n-options', { month: monthNames[month] }))
            if (tabObj._ajax_requests.top_customers_month) {
                tabObj._ajax_requests.top_customers_month.abort()
            }
            let params = {
                all_locations: all_locations,
                year: fullYear,
                month: (month + 1)
            }
            let url = `/dashboard/top-customers/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.top_customers_month = $.get(url, response => {
                let topDonut = tabContent.find('#top_customers_month').find('.c3').data('c3')
                let topTable = tabContent.find('#top_customers_month').find('tbody')
                let legend = tabContent.find('#top_customers_month .legend ul')
                if (topDonut) {
                    updateTopDonut(topDonut, response['data'], legend)
                }
                if (topTable) {
                    updateTopTable(topTable, response['data'], true)
                }
            })
        }
        else if ($(this).parents('#top_items_month').length) {
            let content = $(this)
                .closest('#top_items_month')
                .find('[data-i18n="HeaderGraphTopItemsMonth"]')
                .data('i18n-options', { month: monthNames[month] })
            BaseManager.i18n(null, content)
            if (tabObj._ajax_requests.top_items_month) {
                tabObj._ajax_requests.top_items_month.abort()
            }
            let params = {
                all_locations: all_locations,
                year: fullYear,
                month: (month + 1),
                group_id: group_id_month
            }
            let url = `/dashboard/top-items/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.top_items_month = $.get(url, response => {
                let topDonut = tabContent.find('#top_items_month').find('.c3').data('c3')
                let topTable = tabContent.find('#top_items_month').find('tbody')
                let legend = tabContent.find('#top_items_month .legend ul')
                if (topDonut) {
                    updateTopDonut(topDonut, response['data'], legend)
                }
                if (topTable) {
                    updateTopTable(topTable, response['data'], true)
                }
            })
            if (tabObj._ajax_requests.top_items_qty_month) {
                tabObj._ajax_requests.top_items_qty_month.abort()
            }
            params = {
                all_locations: all_locations,
                year: fullYear,
                month: (month + 1),
                group_id: group_id_month
            }
            url = `/dashboard/top-items-qty/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.top_items_qty_month = $.get(url, response => {
                let topDonut = tabContent.find('#top_items_month_qty').find('.c3').data('c3')
                let topTable = tabContent.find('#top_items_month_qty').find('tbody')
                let legend = tabContent.find('#top_items_month_qty .legend ul')
                if (topDonut) {
                    updateTopDonut(topDonut, response['data'], legend)
                }
                if (topTable) {
                    updateTopTable(topTable, response['data'])
                }
            })
        }
        else if ($(this).parents('#top_manufacturers_month').length) {
            BaseManager.i18n(null, $(this).prev().data('i18n-options', { month: monthNames[month] }))
            if (tabObj._ajax_requests.top_manufacturers_month) {
                tabObj._ajax_requests.top_manufacturers_month.abort()
            }
            let params = {
                all_locations: all_locations,
                year: fullYear,
                month: (month + 1)
            }
            let url = `/dashboard/top-manufacturers/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.top_manufacturers_month = $.get(url, response => {
                let topDonut = tabContent.find('#top_manufacturers_month').find('.c3').data('c3')
                let topTable = tabContent.find('#top_manufacturers_month').find('tbody')
                let legend = tabContent.find('#top_manufacturers_month .legend ul')
                if (topDonut) {
                    updateTopDonut(topDonut, response['data'], legend)
                }
                if (topTable) {
                    updateTopTableManufacturers(topTable, response['data'], true)
                }
            })
        }
        // else if ($(this).parents('#top_manufacturers_month_qty').length) {
        //   let content = $(this)
        //     .closest("#top_manufacturers_month_qty")
        //     .find('[data-i18n="HeaderGraphTopManufacturersMonthByQty"]')
        //     .data('i18n-options', {month: monthNames[month]})
        //   BaseManager.i18n(null, content)
        //   if (tabObj._ajax_requests.top_manufacturers_qty_month) {
        //     tabObj._ajax_requests.top_manufacturers_qty_month.abort()
        //   }
        //   let params = {
        //     all_locations: all_locations,
        //     year: fullYear,
        //     month: (month + 1),
        //     group_id: group_id_month
        //   }
        //   let url = `/dashboard/top-manufacturers-qty/?${locations}&${$.param(params)}`
        //   tabObj._ajax_requests.top_manufacturers_qty_month = $.get(url, response => {
        //     let topDonut = tabContent.find('#top_manufacturers_month_qty').find('.c3').data('c3')
        //     let topTable = tabContent.find('#top_manufacturers_month_qty').find('tbody')
        //     let legend = tabContent.find('#top_manufacturers_month_qty .legend ul')
        //     if (topDonut) {
        //       updateTopDonut(topDonut, response['data'], legend)
        //     }
        //     if (topTable) {
        //       updateTopTable(topTable, response['data'])
        //     }
        //   })
        // }
        else if ($(this).parents('#top_locations_month').length) {
            BaseManager.i18n(null, $(this).prev().data('i18n-options', { month: monthNames[month] }))
            if (tabObj._ajax_requests.top_locations_month) {
                tabObj._ajax_requests.top_locations_month.abort()
            }
            let params = {
                all_locations: all_locations,
                year: fullYear,
                month: (month + 1)
            }
            let url = `/dashboard/top-locations/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.top_locations_month = $.get(url, response => {
                let topDonut = tabContent.find('#top_locations_month').find('.c3').data('c3')
                let topTable = tabContent.find('#top_locations_month').find('tbody')
                let legend = tabContent.find('#top_locations_month .legend ul')
                if (topDonut) {
                    updateTopDonut(topDonut, response['data'], legend)
                }
                if (topTable) {
                    updateTopTable(topTable, response['data'], true)
                }
                if (response['data'].length < 2) {
                    tabContent.find('#top_locations_month').addClass('hide')
                }
            })
        }
        else if ($(this).parents('#top_customers_companies_month').length) {
            BaseManager.i18n(null, $(this).prev().data('i18n-options', { month: monthNames[month] }))
            if (tabObj._ajax_requests.top_customers_companies_month) {
                tabObj._ajax_requests.top_customers_companies_month.abort()
            }
            let params = {
                all_locations: all_locations,
                year: fullYear,
                month: (month + 1)
            }
            let url = `/dashboard/top-customers_companies/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.top_customers_companies_month = $.get(url, response => {
                let topDonut = tabContent.find('#top_customers_companies_month').find('.c3').data('c3')
                let topTable = tabContent.find('#top_customers_companies_month').find('tbody')
                let legend = tabContent.find('#top_customers_companies_month .legend ul')
                if (topDonut) {
                    updateTopDonut(topDonut, response['data'], legend)
                }
                if (topTable) {
                    updateTopTable(topTable, response['data'], true)
                }
                if (response['data'].length < 2) {
                    tabContent.find('#top_customers_companies_month').addClass('hide')
                }
            })
        }
        else {
            $(e.target).closest('.row').find('.graph').removeClass('loading')
        }
    })

    $('.hasDatePicker', tabContent).on('changeYear', function (e) {
        function updateGraph(e, data) {
            for (let index in data) {
                columns[0].push(new Date(data[index].date))
                columns[1].push(data[index].income)
                total[1] += data[index].income
                columns[2].push(data[index].expence)
                total[2] += data[index].expence
            }
            if ($.contains(document, e.target)) {
                let categories = [
                    BaseManager.__('DashboardIncome', 'DashboardIncome', true),
                    BaseManager.__('DashboardExpenses', 'DashboardExpenses', true)
                ]
                let data = {
                    data_1: BaseManager.__('DashboardIncome', 'DashboardIncome', true),
                    data_2: BaseManager.__('DashboardExpenses', 'DashboardExpenses', true)
                }
                $(e.target).closest('.row').find('.graph').each((i, $graph) => {
                    $($graph).find('.c3').data('c3').load(($($graph).hasClass('total') ? {
                        columns: [total],
                        categories: categories
                    } : {
                            columns: columns
                        }))
                    $($graph).find('.c3').data('c3').data.names($($graph).hasClass('total') ? {
                        data_1: BaseManager.__('GraphAmount', 'Amount', true)
                    } : data)
                })
                let column_list = []
                if (total[1]) {
                    column_list.push(['data_1', total[1]])
                }
                if (total[2]) {
                    column_list.push(['data_2', total[2]])
                }
                $(e.target).closest('.row').find('.donut').removeClass('loading').each(function () {
                    $(this).data('c3').load({
                        unload: true,
                        columns: column_list
                    })
                    $(this).data('c3').data.names(data)
                })
                setTimeout(() => {
                    $(e.target).closest('.row').find('.graph').removeClass('loading')
                })
            }
        }

        $(e.target).closest('.row').find('.graph').addClass('loading')
        let d = new Date()
        let data = null
        let total = ['data_1', 0, 0]
        let columns = [['x'], ['data_1'], ['data_2']]
        if (e.date) {
            d = new Date(e.date)
        } else if ($(e.target).val()) {
            d = $(e.target).datepicker('getDate')
        }
        let fullYear = d.getFullYear()
        const customerCompanies = $('#customers_companies')
        let locations = customerCompanies.find('label.location > input:checkbox').serialize()
        let all_locations = customerCompanies.find('label.location > input:checkbox:not(:checked)').length == 0
        if ($(this).parents('#graph_year').length) {
            BaseManager.i18n(null, $(this).prev().data('i18n-options', { year: fullYear }))
            let yearIndex = new Date().getFullYear() - fullYear
            let tab_has_data = typeof tabObj._data != 'undefined'
            let tab_has_data_five_years = typeof tabObj._data.five_years_charts != 'undefined'
            let tab_has_data_for_year = typeof tabObj._data.five_years_charts[yearIndex] != 'undefined'
            if (tab_has_data && tab_has_data_five_years && tab_has_data_for_year) {
                data = tabObj._data.five_years_charts[yearIndex].data
                updateGraph(e, data)
            }
            return
        }
        else if ($(this).parents('#top_customers_year').length) {
            BaseManager.i18n(null, $(this).prev().data('i18n-options', { year: fullYear }))
            if (tabObj._ajax_requests.top_customers_year) {
                tabObj._ajax_requests.top_customers_year.abort()
            }
            let params = {
                year: fullYear,
                all_locations: all_locations
            }
            let url = `/dashboard/top-customers/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.top_customers_year = $.get(url, response => {
                let topDonut = tabContent.find('#top_customers_year').find('.c3').data('c3')
                let topTable = tabContent.find('#top_customers_year').find('tbody')
                let legend = tabContent.find('#top_customers_year .legend ul')
                if (topDonut) {
                    updateTopDonut(topDonut, response['data'], legend)
                }
                if (topTable) {
                    updateTopTable(topTable, response['data'], true)
                }
            })
        }
        else if ($(this).parents('#top_items_year').length) {
            let content = $(this)
                .closest('#top_items_year')
                .find('[data-i18n="HeaderGraphTopItemsYear"]')
                .data('i18n-options', { year: fullYear })
            BaseManager.i18n(null, content)
            if (tabObj._ajax_requests.top_items_year) {
                tabObj._ajax_requests.top_items_year.abort()
            }
            let params = {
                year: fullYear,
                all_locations: all_locations,
                group_id: group_id_year
            }
            let url = `/dashboard/top-items/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.top_items_year = $.get(url, response => {
                let topDonut = tabContent.find('#top_items_year').find('.c3').data('c3')
                let topTable = tabContent.find('#top_items_year').find('tbody')
                let legend = tabContent.find('#top_items_year .legend ul')
                if (topDonut) {
                    updateTopDonut(topDonut, response['data'], legend)
                }
                if (topTable) {
                    updateTopTable(topTable, response['data'], true)
                }
            })
            if (tabObj._ajax_requests.top_items_qty_year) {
                tabObj._ajax_requests.top_items_qty_year.abort()
            }
            params = {
                year: fullYear,
                all_locations: all_locations,
                group_id: group_id_year
            }
            url = `/dashboard/top-items-qty/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.top_items_qty_year = $.get(url, response => {
                let topDonut = tabContent.find('#top_items_year_qty').find('.c3').data('c3')
                let topTable = tabContent.find('#top_items_year_qty').find('tbody')
                let legend = tabContent.find('#top_items_year_qty .legend ul')
                if (topDonut) {
                    updateTopDonut(topDonut, response['data'], legend)
                }
                if (topTable) {
                    updateTopTable(topTable, response['data'])
                }
            })
        }
        else if ($(this).parents('#top_manufacturers_year').length) {
            BaseManager.i18n(null, $(this).prev().data('i18n-options', { year: fullYear }))
            if (tabObj._ajax_requests.top_manufacturers_year) {
                tabObj._ajax_requests.top_manufacturers_year.abort()
            }
            let params = {
                year: fullYear,
                all_locations: all_locations
            }
            let url = `/dashboard/top-manufacturers/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.top_manufacturers_year = $.get(url, response => {
                let topDonut = tabContent.find('#top_manufacturers_year').find('.c3').data('c3')
                let topTable = tabContent.find('#top_manufacturers_year').find('tbody')
                let legend = tabContent.find('#top_manufacturers_year .legend ul')
                if (topDonut) {
                    updateTopDonut(topDonut, response['data'], legend)
                }
                if (topTable) {
                    updateTopTableManufacturers(topTable, response['data'], true)
                }
            })
        }
        // else if ($(this).parents('#top_manufacturers_year_qty').length) {
        //   let content = $(this)
        //     .closest("#top_manufacturers_year_qty")
        //     .find('[data-i18n="HeaderGraphTopManufacturersYearByQty"]')
        //     .data('i18n-options', {year: fullYear})
        //   BaseManager.i18n(null, content)
        //   if (tabObj._ajax_requests.top_manufacturers_qty_year) {
        //     tabObj._ajax_requests.top_manufacturers_qty_year.abort()
        //   }
        //   let params = {
        //     year: fullYear,
        //     all_locations: all_locations
        //   }
        //   let url = `/dashboard/top-manufacturers-qty/?${locations}&${$.param(params)}`
        //   tabObj._ajax_requests.top_manufacturers_qty_year = $.get(url, response => {
        //     let topDonut = tabContent.find('#top_manufacturers_year_qty').find('.c3').data('c3')
        //     let topTable = tabContent.find('#top_manufacturers_year_qty').find('tbody')
        //     let legend = tabContent.find('#top_manufacturers_year_qty .legend ul')
        //     if (topDonut) {
        //       updateTopDonut(topDonut, response['data'], legend)
        //     }
        //     if (topTable) {
        //       updateTopTable(topTable, response['data'])
        //     }
        //   })
        // }
        else if ($(this).parents('#top_locations_year').length) {
            BaseManager.i18n(null, $(this).prev().data('i18n-options', { year: fullYear }))
            if (tabObj._ajax_requests.top_locations_year) {
                tabObj._ajax_requests.top_locations_year.abort()
            }
            let params = {
                year: fullYear,
                all_locations: all_locations
            }
            let url = `/dashboard/top-locations/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.top_locations_year = $.get(url, response => {
                let topDonut = tabContent.find('#top_locations_year').find('.c3').data('c3')
                let topTable = tabContent.find('#top_locations_year').find('tbody')
                let legend = tabContent.find('#top_locations_year .legend ul')
                if (topDonut) {
                    updateTopDonut(topDonut, response['data'], legend)
                }
                if (topTable) {
                    updateTopTable(topTable, response['data'], true)
                }
                if (response['data'].length < 2) {
                    tabContent.find('#top_locations_year').addClass('hide')
                }
            })
        }
        else if ($(this).parents('#top_customers_companies_year').length) {
            BaseManager.i18n(null, $(this).prev().data('i18n-options', { year: fullYear }))
            if (tabObj._ajax_requests.top_customers_companies_year) {
                tabObj._ajax_requests.top_customers_companies_year.abort()
            }
            let params = {
                year: fullYear,
                all_locations: all_locations
            }
            let url = `/dashboard/top-customers_companies/?${locations}&${$.param(params)}`
            tabObj._ajax_requests.top_customers_companies_year = $.get(url, response => {
                let topDonut = tabContent.find('#top_customers_companies_year').find('.c3').data('c3')
                let topTable = tabContent.find('#top_customers_companies_year').find('tbody')
                let legend = tabContent.find('#top_customers_companies_year .legend ul')
                if (topDonut) {
                    updateTopDonut(topDonut, response['data'], legend)
                }
                if (topTable) {
                    updateTopTable(topTable, response['data'], true)
                }
                if (response['data'].length < 2) {
                    tabContent.find('#top_customers_companies_year').addClass('hide')
                }
            })
        }
        else {
            $(e.target).closest('.row').find('.graph').removeClass('loading')
        }
    })

    setTimeout(function () {
        const days = [
            BaseManager.__('DaySunday', 'Sunday', true),
            BaseManager.__('DayMonday', 'Monday', true),
            BaseManager.__('DayTuesday', 'Tuesday', true),
            BaseManager.__('DayWednesday', 'Wednesday', true),
            BaseManager.__('DayThursday', 'Thursday', true),
            BaseManager.__('DayFriday', 'Friday', true),
            BaseManager.__('DaySaturday', 'Saturday', true),
        ]
        $('.canvas', tabContent).each(function () {
            let i
            let isTotal = $(this).closest('.graph').hasClass('total')
            let opts = {
                color: {
                    pattern: ['#78cb76', '#c94d3f']
                },
                legend: {
                    show: false
                },
                grid: {
                    y: {
                        show: true
                    }
                },
                axis: {
                    y: {
                        tick: {
                            culling: false,
                            outer: false,
                            format: x => BaseManager.numberFormat(x, false, false, true)
                        }
                    }
                },
                tooltip: {
                    format: {
                        value: x => BaseManager.numberFormat(x, false, false, true)
                    }
                },
                transition: {
                    duration: 0
                },
                bindto: this
            }
            if (isTotal) {
                opts.data = {
                    type: 'bar',
                    columns: [['data_1', null, null]],
                    names: {
                        data_1: BaseManager.__('GraphAmount', 'Amount', true)
                    },
                    color: (color, d) => {
                        let colors = ['#78cb76', '#c94d3f']
                        let index = typeof d == 'string' ? d.replace('data_', '') : d.index
                        return d3.rgb(colors[index])
                    }
                }
                opts.bar = {
                    width: {
                        ratio: 0.5
                    }
                }
                opts.axis.x = {
                    show: true,
                    type: 'category',
                    categories: [
                        BaseManager.__('DashboardIncome', 'DashboardIncome', true),
                        BaseManager.__('DashboardExpenses', 'DashboardExpenses', true)
                    ],
                    tick: {
                        outer: false,
                        culling: false
                    }
                }
                opts.axis.y.tick.format = opts.tooltip.format.value = value => {
                    return `${BaseManager.numberFormat(value, false, false, true)} ${global.company.currency}`
                }
                if ($(this).parents('#graph_compare').length) {
                    opts.data.color = (color, d) => {
                        let colors = [
                            '#ff8c00',
                            '#42A5F5',
                            '#78cb76'
                        ]
                        let index = typeof d == 'string' ? d.replace('data_', '') : d.index
                        return d3.rgb(colors[index])
                    }
                    opts.data.columns = [['data_1', null, null, null]]
                    opts.axis.x.categories = []
                    // var fromYear = new Date().getFullYear() - 3;
                    for (i = 1; i <= 3; i++) {
                        opts.axis.x.categories.push('')
                    }
                }
            } else {
                opts.data = {
                    x: 'x',
                    type: 'area',
                    columns: [
                        ['x', null],
                        ['data_1', null],
                        ['data_2', null]
                    ],
                    names: {
                        data_1: BaseManager.__('DashboardIncome', 'DashboardIncome', true),
                        data_2: BaseManager.__('DashboardExpenses', 'DashboardExpenses', true)
                    }
                }
                opts.axis.x = {
                    type: 'timeseries',
                    tick: {
                        culling: false,
                        outer: false
                    }
                }
                if ($(this).parents('#graph_today').length) {
                    let addZeros = ($(window).width() <= 1200 ? '' : ':00')
                    opts.axis.x.tick.format = opts.tooltip.format.title = d => d.getUTCHours() + addZeros
                    opts.axis.y.tick.format = opts.tooltip.format.value = value => {
                        return `${BaseManager.numberFormat(value, false, false, true)} ${global.company.currency}`
                    }
                }
                else if ($(this).parents('#today_compare_graph').length) {
                    let addZeros = ($(window).width() <= 1500 ? '' : ':00')
                    opts.axis.x.tick.format = opts.tooltip.format.title = d => {
                        if ([4, 14, 20].includes(d.getUTCHours())) {
                            return d.getUTCHours() + addZeros
                        } else {
                            return ''
                        }
                    }
                    opts.axis.y.tick.format = opts.tooltip.format.value = value => {
                        return `${BaseManager.numberFormat(value, false, false, true)} ${global.company.currency}`
                    }
                    opts.color.pattern = [
                        '#000',
                        '#42A5F5',
                        '#ff8c00',
                        '#c94d3f'
                    ]
                    opts.data.columns = [
                        ['x', null],
                        ['data_1', null],
                        ['data_2', null],
                        ['data_3', null],
                        ['data_4', null]
                    ]
                }
                else if ($(this).parents('#graph_month').length) {
                    opts.axis.x.tick.format = d => d.getUTCDate()
                    opts.tooltip.format.title = x => {
                        let formattedDate = BaseManager.dateFormat(x)
                        let dayOfWeek = days[x.getDay()]
                        return `${formattedDate}<br>${dayOfWeek}`
                    }
                    opts.axis.y.tick.format = opts.tooltip.format.value = value => {
                        return `${BaseManager.numberFormat(value, false, false, true)} ${global.company.currency}`
                    }
                }
                else if ($(this).parents('#graph_month_range').length) {
                    opts.axis.x.tick.format = opts.tooltip.format.title = d => d.getUTCDate()
                }
                else if ($(this).parents('#graph_year').length) {
                    opts.axis.x.tick.format = opts.tooltip.format.title = d => {
                        let month = monthNames[d.getUTCMonth()]
                        return BaseManager.__('Month' + month, month, true)
                    }
                    opts.axis.y.tick.format = opts.tooltip.format.value = value => {
                        return `${BaseManager.numberFormat(value, false, false, true)} ${global.company.currency}`
                    }
                }
                else if ($(this).parents('#graph_compare').length) {
                    opts.color.pattern = [
                        '#ff8c00',
                        '#42A5F5',
                        '#78cb76'
                    ]
                    opts.data.columns = [
                        ['x', null],
                        ['data_1', null],
                        ['data_2', null],
                        ['data_3', null]
                    ]
                    let fromYear = new Date().getFullYear() - 3
                    for (i = 1; i <= 3; i++) {
                        opts.data.names['data_' + i] = fromYear + i
                    }
                    opts.axis.x.type = 'category'
                    opts.axis.x.tick.format = opts.tooltip.format.title = n => {
                        let month = monthNames[n]
                        if (global.is_mobile) {
                            return BaseManager.__('MonthShort' + month, month, true)[0]
                        } else {
                            return BaseManager.__('MonthShort' + month, month, true)
                        }
                    }
                    opts.axis.y.tick.format = opts.tooltip.format.value = value => {
                        return `${BaseManager.numberFormat(value, false, false, true)} ${global.company.currency}`
                    }
                }
            }
            $(this).data('c3', c3.generate(opts))
        })

        $('.donut', tabContent).each(function () {
            let opt = {
                color: {
                    pattern: [
                        '#1f77b4',
                        '#ff7f0e',
                        '#2ca02c',
                        '#d62728',
                        '#9467bd',
                        '#8c564b',
                        '#e377c2',
                        '#7f7f7f',
                        '#bcbd22',
                        '#17becf',
                        '#bbbbbb'
                    ]
                },
                data: {
                    columns: [],
                    onmouseover: function (d) {
                        $(this.bindto)
                            .closest('.top10')
                            .find('.legend ul')
                            .addClass('active')
                            .find('li').filter(function () {
                                return $(this).data('id') == d.id
                            })
                            .addClass('active')
                    },
                    onmouseout: function () {
                        $(this.bindto)
                            .closest('.top10')
                            .find('.legend ul')
                            .removeClass('active')
                            .find('li').removeClass('active')
                    },
                    colors: {
                        dataothers: '#BBBBBB'
                    },
                    type: 'donut'
                },
                donut: {
                    label: {
                        format: function (value, ratio) {
                            return (ratio * 100).toFixed(2) + '%';
                        }
                    }
                },
                // donut: {
                // title: "Top 10"
                // },
                legend: {
                    show: false
                },
                tooltip: {
                    format: {
                        value: x => `${BaseManager.numberFormat(x, false, false, true)} ${global.company.currency}`
                    }
                },
                bindto: this
            }
            if ($(this).closest('div[id]').attr('id').includes('qty')) {
                opt.tooltip.format.value = x => BaseManager.numberFormat(x, false, false, true)
            } else if ($(this).parents('[id^=graph_]').length) {
                opt.data.colors = {
                    data_1: '#78cb76',
                    data_2: '#c94d3f'
                }
            }
            $(this).data('c3', c3.generate(opt))
        })

        $(window).resize()
        updateDashboard(tabContent, tabObj, isTab)

        tabObj._last_week_now = loadLiquidFillGauge('last_week_now', 0)
        tabObj._last_week_full = loadLiquidFillGauge('last_week_full', 0)

        tabObj._last_month_now = loadLiquidFillGauge('last_month_now', 0)
        tabObj._last_month_full = loadLiquidFillGauge('last_month_full', 0)

        tabObj._last_year_now = loadLiquidFillGauge('last_year_now', 0)
        tabObj._last_year_full = loadLiquidFillGauge('last_year_full', 0)
    }, 0)
    return true
}

// endregion

// region sales_dashboard
function create_sales_dashboard(tabContent, tabObj) {

    function update_sales_dashboard() {
        let data = $.extend({}, tabObj.params)

        tabObj._ajax_requests['week-sales-by-day'] = $.get(`sales/dashboard/week-sales-by-day/`, data, response => {
            let graph = $(`#week-sales-by-day`, tabContent)
            graph.find('.graph').addClass('loading')
            let columns = [['x'], ['data_1'], ['data_2'], ['data_3'], ['data_4'], ['data_5'], ['data_6']]
            for (let data of response.current_week) {
                columns[0].push(BaseManager.dateParse(data.date, undefined, false, false))
                columns[1].push(data.sum)
            }
            for (let data of response.last_week) {
                columns[2].push(data.sum)
            }
            for (let data of response.last_year_week) {
                columns[3].push(data.sum)
            }
            for (let data of response.current_week_docs) {
                columns[4].push(data.sum)
            }
            for (let data of response.last_week_docs) {
                columns[5].push(data.sum)
            }
            for (let data of response.last_year_week_docs) {
                columns[6].push(data.sum)
            }
            graph.closest('.row').find('.graph').removeClass('loading').each(function () {
                $(this).find('.c3').data('c3').load({ columns: columns })
            })
        })

        tabObj._ajax_requests['month-sales-by-day'] = $.get(`sales/dashboard/month-sales-by-day/`, data, response => {
            let graph = $(`#month-sales-by-day`, tabContent)
            graph.find('.graph').addClass('loading')
            let columns = [['x'], ['data_1'], ['data_2']]
            for (let data of response.sums) {
                columns[0].push(BaseManager.dateParse(data.date, undefined, false, false))
                columns[1].push(data.sum)
            }
            for (let data of response.docs) {
                columns[2].push(data.sum)
            }
            graph.closest('.row').find('.graph').removeClass('loading').each(function () {
                $(this).find('.c3').data('c3').load({ columns: columns })
            })
        })

        tabObj._ajax_requests['year-sales-by-day'] = $.get(`sales/dashboard/year-sales-by-day/`, data, response => {
            let graph = $(`#year-sales-by-day`, tabContent)
            graph.find('.graph').addClass('loading')
            let columns = [['x'], ['data_1'], ['data_2']]
            for (let data of response.current_year) {
                columns[0].push(BaseManager.dateParse(data.date, undefined, false, false))
                columns[2].push(data.sum)
            }
            for (let data of response.previous_year) {
                columns[1].push(data.sum)
            }
            graph.closest('.row').find('.graph').removeClass('loading').each(function () {
                $(this).find('.c3').data('c3').load({ columns: columns })
            })
        })

        tabObj._ajax_requests['year-sales-by-months'] = $.get(`sales/dashboard/year-sales-by-months/`, data, response => {
            let graph = $(`#year-sales-by-months`, tabContent)
            graph.find('.graph').addClass('loading')
            let columns = [['x'], ['data_1'], ['data_2']]
            for (let data of response.sums) {
                columns[0].push(new Date(data.year, data.month - 1, 1))
                columns[1].push(data.sum)
            }
            for (let data of response.docs) {
                columns[2].push(data.sum)
            }
            graph.closest('.row').find('.graph').removeClass('loading').each(function () {
                $(this).find('.c3').data('c3').load({ columns: columns })
            })
        })

        tabObj._ajax_requests['values'] = $.get(`sales/dashboard/values/`, data, response => {
            for (let value in response) {
                if (response.hasOwnProperty(value)) {
                    let text = '0'
                    if (response[value]) {
                        text = BaseManager.numberFormat(response[value], false, true, true)
                    }
                    tabContent.find(`#${value}`).text(text).toggleClass('negative', response[value] < 0)
                }
            }
        })
        if (tabObj.current_state == 'groups') {
            tabObj._ajax_requests['top_items_groups'] = $.get(`sales/dashboard/month-sales-by-item-group/`, data, response => {
                let topDonut = tabContent.find('#top_items_groups').find('.c3').data('c3')
                let legend = tabContent.find('#top_items_groups .legend ul')
                tabObj._data.groups = response
                tabObj.current_state = 'groups'
                updateTopDonut(topDonut, response, legend)
            })
        } else if (tabObj.current_state == 'items') {
            tabObj._ajax_requests['items'] = $.get('/sales/dashboard/month-sales-by-item-in-group/', data, (response) => {
                let topDonut = tabContent.find('#top_items_groups').find('.c3').data('c3')
                let legend = tabContent.find('#top_items_groups .legend ul')
                tabObj._data[tabObj.current_state] = response
                updateTopDonut(topDonut, response, legend)
            })
        }

        if (!tabObj.current_location) {
            tabObj._ajax_requests['top_locations'] = $.get(`sales/dashboard/month-sales-by-locations/`, data, response => {
                let topDonut = tabContent.find('#top_locations').find('.c3').data('c3')
                let legend = tabContent.find('#top_locations .legend ul')
                tabObj._data.locations = response
                // tabObj.current_state = 'groups'
                updateTopDonut(topDonut, response, legend)
            })
        }

        if (!tabObj.current_company) {
            tabObj._ajax_requests['top_companies'] = $.get(`sales/dashboard/month-sales-by-companies/`, data, response => {
                let topDonut = tabContent.find('#top_companies').find('.c3').data('c3')
                let legend = tabContent.find('#top_companies .legend ul')
                tabObj._data.companies = response
                // tabObj.current_state = 'groups'
                updateTopDonut(topDonut, response, legend)
            })
        }
    }

    function select_item_group(data) {
        let index = parseInt(data.id.replace('data', ''))
        let title
        if (tabObj.current_state == 'item') {
            return
        } else if (tabObj.current_state == 'items') {
            let item = tabObj._data.items[index]
            tabObj.params.item_id = item.id
            title = BaseManager.__('FieldItem', 'Item', true) + ': ' + item.nm
            tabObj.current_state = 'item'
        } else {
            let group = tabObj._data.groups[index]
            tabObj.params.group_id = group.id
            title = BaseManager.__('FieldGroup', 'Group', true) + ': ' + group.nm
            tabObj.current_group = group
            tabObj.current_state = 'items'
        }
        tabContent
            .find('#top_items_groups h3 > span')
            .html('')
            .append($('<span class="glyphicon glyphicon-arrow-left"></span>'))
            .append($(`<span>${title}</span>`))
        update_sales_dashboard()
    }

    function select_location(data) {
        let index = parseInt(data.id.replace('data', ''))
        let location = tabObj._data.locations[index]
        tabObj.params.location_id = location.id
        tabObj.current_location = location
        let title = BaseManager.__('FieldLocation', 'Location', true) + ': ' + location.nm
        update_sales_dashboard()
        let topDonut = tabContent.find('#top_locations').find('.c3').data('c3')
        let legend = tabContent.find('#top_locations .legend ul')
        tabContent
            .find('#top_locations h3 > span')
            .html('')
            .append($('<span class="glyphicon glyphicon-arrow-left"></span>'))
            .append($(`<span>${title}</span>`))
        updateTopDonut(topDonut, [location], legend)
    }

    function select_company(data) {
        let index = parseInt(data.id.replace('data', ''))
        let company = tabObj._data.companies[index]
        tabObj.params.company_id = company.id
        tabObj.current_company = company
        let title = BaseManager.__('FieldCompany', 'Company', true) + ': ' + company.nm
        update_sales_dashboard()
        let topDonut = tabContent.find('#top_companies').find('.c3').data('c3')
        let legend = tabContent.find('#top_companies .legend ul')
        tabContent
            .find('#top_companies h3 > span')
            .html('')
            .append($('<span class="glyphicon glyphicon-arrow-left"></span>'))
            .append($(`<span>${title}</span>`))
        updateTopDonut(topDonut, [company], legend)
    }

    tabContent.find('#top_locations h3 > span').on('click', '.glyphicon', () => {
        BaseManager.i18n(undefined, tabContent.find('#top_locations'))
        let topDonut = tabContent.find('#top_locations').find('.c3').data('c3')
        let legend = tabContent.find('#top_locations .legend ul')
        delete tabObj.params.location_id
        updateTopDonut(topDonut, tabObj._data.locations, legend)
        update_sales_dashboard()
    })

    tabContent.find('#top_companies h3 > span').on('click', '.glyphicon', () => {
        BaseManager.i18n(undefined, tabContent.find('#top_companies'))
        let topDonut = tabContent.find('#top_companies').find('.c3').data('c3')
        let legend = tabContent.find('#top_companies .legend ul')
        delete tabObj.params.company_id
        updateTopDonut(topDonut, tabObj._data.companies, legend)
        update_sales_dashboard()
    })

    tabContent.find('#top_items_groups h3 > span').on('click', '.glyphicon', () => {
        let topDonut = tabContent.find('#top_items_groups').find('.c3').data('c3')
        let legend = tabContent.find('#top_items_groups .legend ul')
        if (tabObj.current_state == 'item') {
            tabContent
                .find('#top_items_groups h3 > span')
                .html('')
                .append($('<span class="glyphicon glyphicon-arrow-left"></span>'))
                .append($(`<span>${BaseManager.__('FieldGroup', 'Group', true) + ': ' + tabObj.current_group.nm}</span>`))
            delete tabObj.params.item_id
            tabObj.current_state = 'items'
        } else {
            delete tabObj.params.group_id
            BaseManager.i18n(undefined, tabContent.find('#top_items_groups'))
            tabObj._data.items = undefined
            tabObj.current_state = 'groups'
        }
        updateTopDonut(topDonut, tabObj._data[tabObj.current_state], legend)
        update_sales_dashboard()
    })

    tabContent.find('.glyphicon-refresh').on('click', () => {
        BaseManager.tab.load(tabObj.id, true)
    })

    tabObj._ajax_requests = {}
    tabObj._data = {}
    tabObj.params = {}
    tabObj.current_state = 'groups'
    tabObj.current_group = null
    tabObj.current_location = null
    tabObj.current_company = null

    update_sales_dashboard()

    const days = [
        BaseManager.__('DaySunday', 'Sunday', true),
        BaseManager.__('DayMonday', 'Monday', true),
        BaseManager.__('DayTuesday', 'Tuesday', true),
        BaseManager.__('DayWednesday', 'Wednesday', true),
        BaseManager.__('DayThursday', 'Thursday', true),
        BaseManager.__('DayFriday', 'Friday', true),
        BaseManager.__('DaySaturday', 'Saturday', true),
    ]

    const months = [
        BaseManager.__('MonthJanuary', 'January', true),
        BaseManager.__('MonthFebruary', 'February', true),
        BaseManager.__('MonthMarch', 'March', true),
        BaseManager.__('MonthApril', 'April', true),
        BaseManager.__('MonthMay', 'May', true),
        BaseManager.__('MonthJune', 'June', true),
        BaseManager.__('MonthJuly', 'July', true),
        BaseManager.__('MonthAugust', 'August', true),
        BaseManager.__('MonthSeptember', 'September', true),
        BaseManager.__('MonthOctober', 'October', true),
        BaseManager.__('MonthNovember', 'November', true),
        BaseManager.__('MonthDecember', 'December', true),
    ]

    const monthsShort = [
        BaseManager.__('MonthShortJanuary', 'January', true),
        BaseManager.__('MonthShortFebruary', 'February', true),
        BaseManager.__('MonthShortMarch', 'March', true),
        BaseManager.__('MonthShortApril', 'April', true),
        BaseManager.__('MonthShortMay', 'May', true),
        BaseManager.__('MonthShortJune', 'June', true),
        BaseManager.__('MonthShortJuly', 'July', true),
        BaseManager.__('MonthShortAugust', 'August', true),
        BaseManager.__('MonthShortSeptember', 'September', true),
        BaseManager.__('MonthShortOctober', 'October', true),
        BaseManager.__('MonthShortNovember', 'November', true),
        BaseManager.__('MonthShortDecember', 'December', true),
    ]

    setTimeout(() => {
        $('.canvas', tabContent).each(function () {
            const dataTypes = {
                'week-sales-by-day': 'bar',
                'month-sales-by-day': 'bar',
                'year-sales-by-day': 'area-spline',
                'year-sales-by-months': 'bar'
            }
            const colors = {
                'week-sales-by-day': [
                    '#78cb76',
                    '#42A5F5',
                    '#ff8c00',
                    '#9467bd',
                    '#fdd536',
                    '#e377c2'
                ],
                'month-sales-by-day': [
                    '#ff8c00',
                    '#9467bd'
                ],
                'year-sales-by-day': [
                    '#cecece',
                    '#78cb76'
                ],
                'year-sales-by-months': [
                    '#78cb76',
                    '#9467bd'
                ]
            }
            let graphName = $(this).closest('div[id]').attr('id')
            let opts = {
                color: {
                    pattern: colors[graphName]
                },
                legend: {
                    show: false
                },
                grid: {
                    y: {
                        show: true
                    }
                },
                axis: {
                    y: {
                        tick: {
                            culling: false,
                            outer: false,
                            format: x => `${BaseManager.numberFormat(x, false, false, true)} ${global.company.currency}`
                        }
                    },
                    x: {
                        type: 'timeseries',
                        tick: {
                            culling: false,
                            outer: false
                        }
                    }
                },
                tooltip: {
                    format: {
                        value: x => `${BaseManager.numberFormat(x, false, false, true)} ${global.company.currency}`
                    }
                },
                transition: {
                    duration: 0
                },
                bindto: this,
                data: {
                    x: 'x',
                    type: dataTypes[graphName],
                    columns: [
                        ['x', null],
                        ['data_1', null]
                    ],
                    names: {
                        data_1: BaseManager.__('DashboardSales', 'Sales', true)
                    }
                }
            }
            if (graphName == 'year-sales-by-months') {
                opts.axis.x.tick.format = x => BaseManager.dateFormat(x, 'mm/yy')
                opts.tooltip.format.title = x => `${months[x.getMonth()]} ${x.getFullYear()}`
                opts.data.names = {
                    data_1: BaseManager.__('DashboardSales', 'Sales', true),
                    data_2: BaseManager.__('DashboardDocumentsCount', 'Number of documents', true)
                }
                opts.legend.show = true
                opts.data.types = {
                    data_2: 'area',
                }
                opts.data.axes = {
                    data_2: 'y2'
                }
                opts.axis.y2 = {
                    show: true,
                    tick: {
                        format: x => BaseManager.numberFormat(x, false, false, true)
                    }
                }
                opts.tooltip.format.value = (value, ratio, id) => {
                    if (id == 'data_2') {
                        return BaseManager.numberFormat(value, false, false, true)
                    }
                    return `${BaseManager.numberFormat(value, false, false, true)} ${global.company.currency}`
                }
            }
            if (graphName == 'year-sales-by-day') {
                opts.data.names = {
                    data_1: BaseManager.__('DashboardLastYear', 'Last year', true),
                    data_2: BaseManager.__('DashboardThisYear', 'This year', true)
                }
                opts.point = {
                    show: false
                }
                opts.axis.x.tick.culling = { max: 10 }
                opts.axis.x.tick.format = x => BaseManager.dateFormat(x)
                opts.tooltip.format.title = x => {
                    let formattedDate = BaseManager.dateFormat(x)
                    let dayOfWeek = days[x.getDay()]
                    return `${formattedDate}<br>${dayOfWeek}`
                }
                opts.regions = []
                let today = new Date()
                for (let month = 0; month < 12; month += 2) {
                    opts.regions.push({
                        start: new Date(today.getFullYear(), month, 1),
                        end: new Date(today.getFullYear(), month + 1, 0),
                        class: 'region-month'
                    })
                }
            }
            if (graphName == 'week-sales-by-day') {
                opts.axis.x.tick.format = x => days[x.getDay()]
                opts.data.names = {
                    data_1: BaseManager.__('DashboardThisWeek', 'This week', true),
                    data_2: BaseManager.__('DashboardLastWeek', 'Last week', true),
                    data_3: BaseManager.__('DashboardThisWeekLastYear', 'This week last year', true),
                    data_4: BaseManager.__('DashboardDocumentsCountThisWeek', 'Nr. of documents this week', true),
                    data_5: BaseManager.__('DashboardDocumentsCountLastWeek', 'Nr. of documents last week', true),
                    data_6: BaseManager.__('DashboardDocumentsCountThisWeekLastYear', 'Nr. of documents this week last year', true),
                }
                opts.data.types = {
                    data_4: 'area',
                    data_5: 'area',
                    data_6: 'area'
                }
                opts.legend.show = true
                opts.data.axes = {
                    data_4: 'y2',
                    data_5: 'y2',
                    data_6: 'y2'
                }
                opts.axis.y2 = {
                    show: true,
                    tick: {
                        format: x => BaseManager.numberFormat(x, false, false, true)
                    }
                }
                opts.tooltip.format.value = (value, ratio, id) => {
                    if (['data_4', 'data_5', 'data_6'].includes(id)) {
                        return BaseManager.numberFormat(value, false, false, true)
                    }
                    return `${BaseManager.numberFormat(value, false, false, true)} ${global.company.currency}`
                }
            }
            if (graphName == 'month-sales-by-day') {
                opts.axis.x.tick.format = x => x.getDate()
                opts.tooltip.format.title = x => {
                    let formattedDate = BaseManager.dateFormat(x)
                    let dayOfWeek = days[x.getDay()]
                    return `${formattedDate}<br>${dayOfWeek}`
                }
                opts.data.names = {
                    data_1: BaseManager.__('DashboardSales', 'Sales', true),
                    data_2: BaseManager.__('DashboardDocumentsCount', 'Number of documents', true)
                }
                opts.legend.show = true
                opts.data.types = {
                    data_2: 'area',
                }
                opts.data.axes = {
                    data_2: 'y2'
                }
                opts.axis.y2 = {
                    show: true,
                    tick: {
                        format: x => BaseManager.numberFormat(x, false, false, true)
                    }
                }
                opts.tooltip.format.value = (value, ratio, id) => {
                    if (id == 'data_2') {
                        return BaseManager.numberFormat(value, false, false, true)
                    }
                    return `${BaseManager.numberFormat(value, false, false, true)} ${global.company.currency}`
                }
            }
            $(this).data('c3', c3.generate(opts))
        })
        $('.donut', tabContent).each(function () {
            let graphName = $(this).closest('div[id]').attr('id')
            let opt = {
                data: {
                    columns: [],
                    onmouseover: function (d) {
                        $(this.bindto)
                            .closest('.top10')
                            .find('.legend ul')
                            .addClass('active')
                            .find('li').filter(function () {
                                return $(this).data('id') == d.id
                            })
                            .addClass('active')
                    },
                    onmouseout: function () {
                        $(this.bindto)
                            .closest('.top10')
                            .find('.legend ul')
                            .removeClass('active')
                            .find('li').removeClass('active')
                    },
                    colors: {
                        dataothers: '#BBBBBB'
                    },
                    type: 'pie'
                },
                pie: {
                    label: {
                        format: function (value, ratio) {
                            return (ratio * 100).toFixed(2) + '%';
                        }
                    }
                },
                // pie: {
                //   title: "Top 10"
                // },
                legend: {
                    show: false
                },
                tooltip: {
                    format: {
                        value: x => `${BaseManager.numberFormat(x, false, false, true)} ${global.company.currency}`
                    }
                },
                bindto: this
            }
            if (graphName == 'top_locations') {
                opt.data.onclick = select_location
            } else if (graphName == 'top_companies') {
                opt.data.onclick = select_company
            } else if (graphName == 'top_items_groups') {
                opt.data.onclick = select_item_group
            }
            $(this).data('c3', c3.generate(opt))
        })
    }, 0)
}

// endregion23/07/2018
