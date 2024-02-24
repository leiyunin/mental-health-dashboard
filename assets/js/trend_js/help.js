var infoState = 'close'
var network_chart = document.getElementById('barChartDiv');
var network_width_chart = network_chart.clientWidth;
var network_height_chart = network_chart.clientHeight;

function info_mode() {
    if (infoState === 'close') {
        infoState = 'open'
        document.getElementById('help').innerText = 'close help';
        document.getElementById('help').classList.add('active');

        // in help.html, #barChartDiv is a div!! I need to first append svg to div then append g to show help info.
        // if your #Chart is a svg or you have already add a svg in your original code, please delete the following code from start to end.
        
        var info = d3.select('#barChartDiv').select('svg')
            .append('g')
            .style('font-size', '12px')
            .style('opacity', 1)
            .attr('class', 'help-info')
            .attr('id', 'help-info')
            .style('position', 'absolute')
            .style('top', '10px')
            .style('max-height', (network_height_chart - 10) + 'px'); // 减去一些顶部空间

        info.append('rect')
            .attr('x', 20)
            .attr('y', network_height_chart )
            .attr('width', 300)
            .attr('height', 160)
            .attr('fill', '#F5FFFA')
            .attr('stroke', '#ccc')
            .attr('stroke-width', '2px')
            .attr('rx', 5);

            var foreignObject = info.append('foreignObject')
            .attr('x', 30)
            .attr('y', network_height_chart * 0.75)
            .attr('width', 290)
            .attr('height', 700); // 固定高度，足够显示滚动条
        
        var div = foreignObject.append('xhtml:div')
            .style('text-align', 'left')
            .style('overflow-y', 'scroll') // 设置滚动条
            .style('height', '200px') // 设置高度，使其略小于 foreignObject
            .style('background', '#F5FFFA') // 可以添加背景色以更好地观察
            .html(`
            <p></p>
            <strong>To use this dashboard:</strong><br>
            <p></p>1. This dashboard shows the search interest of US people. Numbers represent search interest relative to the highest point on the chart for the given time. A value of 100 is the peak popularity for the term. A value of 50 means that the term is half as popular.<br>
            <p></p>2. You can filter the data by date and keywords in the top right corner. Recommend no more than five<br>
            <p></p>3. Hover over to see the number of searches for different keywords at the same time.<br>
            <p></p>4. The timeline represents significant events in the field of mental health during this period.<br>
            <p></p> <br>
            <p></p> <br>
            <p></p>
        `); // 这里是您的内容
        
    
    } else if (infoState === 'open') {
        document.getElementById('help').innerText = 'help';
        document.getElementById('help').classList.remove('active');
        d3.select('#barChartDiv').select('.help-info').remove();
        d3.select('#barChartDiv').selectAll('svg:not(.bar-chart-container svg)').remove();
        infoState = 'close';

        
    }
    
}
