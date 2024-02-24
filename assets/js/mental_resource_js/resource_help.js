var infoState = 'close'
var network_chart = document.getElementById('map');
var network_width_chart = network_chart.clientWidth;
var network_height_chart = network_chart.clientHeight;

function info_re() {
    if (infoState === 'close') {
        infoState = 'open'
        document.getElementById('re-help').innerText = 'close help';
        document.getElementById('re-help').classList.add('active');

        // in help.html, #networkChart is a div!! I need to first append svg to div then append g to show help info.
        // if your #Chart is a svg or you have already add a svg in your original code, please delete the following code from start to end.
        // >> start 
       

        var info = d3.select('#map').select('svg')
            .append('g')
            .style('font-size', '12px')
            .style('opacity', 1)
            .attr('class', 'help-info');

        info.append('rect')
            .attr('x', 15)
            .attr('y', network_height_chart * 0.8)
            .attr('width', network_width_chart)
            .attr('height', 120)
            .attr('fill', '#F5FFFA')
            .attr('stroke', '#ccc')
            .attr('stroke-width', '1px')
            .attr('rx', 5);

        var foreignObject = info.append('foreignObject')
            .attr('x', 25)
            .attr('y', network_height_chart * 0.81)
            .attr('width', network_width_chart - 40)
            .attr('height', 120);
        var div = foreignObject.append('xhtml:div')
            .style('text-align', 'left')
            .style('height', '100%') // Make sure the div takes the full height of the foreignObject
            .style('overflow-y', 'auto');

        

        // Adding HTML content inside the div

        div.html('<strong>To use this dashboard:</strong><br>1. Select a state using the "State Selector" to view a proportional map of counties. Hover over counties for population and resource details.</br><br>2. Use the "County Selector" to compare resources between counties or states in the bar chart. Hover over the bars for detailed resource information.</br><br>3. Hover over the map for tooltips on county population and resources. Hover over bar chart for detailed county or state resource information.</br><br>4. Click the "Reset Map" button to reset the map and bar chart to their default states.</br><br>5. The map includes a legend for resource scales, aiding in the interpretation of circle sizes for counties.</br>');

    } else if (infoState === 'open') {
        d3.select('#map').selectAll('.help-info').remove();
        document.getElementById('re-help').innerText = 'help';
        document.getElementById('re-help').classList.remove('active');
        infoState = 'close';
    }
}


