var bar_chart = document.getElementById('barChart');
var bar_width_chart = bar_chart.clientWidth;
var bar_height_chart = bar_chart.clientHeight;
var bar_margin = { top: 80, right: 30, bottom: 50, left: 50 },
    bar_width = bar_width_chart - bar_margin.left - bar_margin.right,
    bar_height = bar_height_chart - bar_margin.top - bar_margin.bottom;

updateBarChart(MODE)
function updateBarChart(MODE) {
    if (MODE == 'cluster_mode') {
        drawBarChart(hoveredCluster);
    } else if (MODE == 'state_mode') {
        drawHeatMap(hoverdCountry);
    }
}
function drawHeatMap(hoverdCountry) {
    d3.select('#barChart').select("svg").remove();
    d3.json('../data/mental_states/races_2023.json').then(data => {
        state_data = data[hoverdCountry]

        const heat_color = d3.scaleSequential()
            .interpolator(d3.interpolateViridis)
            .domain([0, d3.max(state_data, function (d) { return d.value; })])


        var heat_svg = d3.select('#barChart')
            .append('svg')
            .attr("width", bar_width + bar_margin.left + bar_margin.right)
            .attr("height", bar_height + bar_margin.top + bar_margin.bottom*0.5)
            .append("g")
            .attr("transform", `translate(${bar_margin.left*1.25},${bar_margin.top})`)
            .style("font-family", "Inter");

        var Races = Array.from(new Set(state_data.map(d => d.races)))
        var Issues = Array.from(new Set(state_data.map(d => d.issue)))

        const x = d3.scaleBand()
            .range([bar_margin.left, bar_width - 1.5*bar_margin.left])
            .domain(Issues)
            .padding(0.05);

        var xlabel = heat_svg.append("g")
            .style("font-size", '11px')
            .attr("transform", `translate(0, ${bar_height})`)
            .call(d3.axisBottom(x).tickSize(0))
        xlabel.select(".domain").remove()

        var y = d3.scaleBand()
            .range([bar_height*0.95, 0])
            .domain(Races)
            .padding(0.1);

        var ylabel = heat_svg.append("g")
            .style("font-size", '11px')
            .call(d3.axisLeft(y).tickSize(0).tickFormat([]))

        var ylabel_text = ylabel.selectAll("text")
            .style("text-anchor", "middle")
            .attr("transform", "rotate(0)")
            .selectAll("tspan")
            .data(function (d) {
                return d.split("/");
            })
            .enter().append("tspan")
            .attr("x", -15)
            .attr("dy", "1em")
            .text(function (d) { return d; });


        ylabel.select(".domain").remove()
        ylabel.selectAll('text').style("text-anchor", "middle");

        var tooltip = d3.select("#barChart")
            .append("div")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("font-size", "11px")
            .style('text-align', 'left');

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function (event, d) {
            tooltip
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }
        var mousemove = function (event, d) {
            tooltip
                .html(d.issue+" risk in "+d.races+": </br>"+d3.format('.3')(d.value)+" per 100K people")
                .style("left", (event.x) +50 + "px")
                .style("top", (event.y) -10 + "px")
        }
        var mouseleave = function (event, d) {
            tooltip
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }

        var circles = heat_svg.selectAll()
            .data(state_data, function (d) { return d.issues + ':' + d.races; })
            .join("circle")
            .attr("cx", function (d) {return x(d.issue)+x.bandwidth()*0.5; })
            .attr("cy", function (d) { return y(d.races)+y.bandwidth()*0.8 })
            .attr("r", height*0.085)
            .style("fill", function (d) { return heat_color(d.value) })
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

        var circles_text = heat_svg.selectAll('label')
            .data(state_data, function (d) { return d.issue + ':' + d.races; })
            .join("text")
            .attr("x", function (d) { return x(d.issue)+x.bandwidth()*0.5 })
            .attr("y", function (d) { return y(d.races)+y.bandwidth()*0.8 })
            .text(d=>d3.format('.3')(d.value))
            .style('fill', function(d){if(d.value>d3.max(state_data, function (d) { return d.value; })*0.8){return 'black';}else{return 'white';}})
            .attr('text-anchor','middle')
            .attr('alignment-baseline','middle')
            .attr('font-size',height*0.07)
        
        

        heat_svg.append("text")
            .attr("x", bar_width*0.5)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .style("font-size", "13px")
            .style('text-anchor', 'middle')
            // .style('font-size', '0.9em')
            .style('font-weight', 600)
            .text(function(){if(hoverdCountry==='mean'){return "2023 Mental Health Risks across Diverse Ethnic Groups"}else{return hoverdCountry+": 2023 Mental Health Risks Across Ethnic Groups";}});
            

        ylabel_text
            .on('mouseover',function(d,i){
                circles.style('fill',function(e){if ((e.races).includes(i)){return heat_color(e.value);}else{return '#ccc';}})
                circles_text.style('fill',function(e){if ((e.races).includes(i)){if(e.value>100){return 'black';}else{return 'white';}}else{return 'white';}})
            })
            .on('mouseout',function(d,i){
                circles.style('fill',function (e) { return heat_color(e.value) })
                circles_text.style('fill',function(e){if(e.value>100){return 'black';}else{return 'white';}})
            })
        let max_range = d3.max(state_data, d => d.value)
        const legendTicks = d3.range(1.05*d3.max(state_data, d => d.value),d3.max(state_data, d => d.value)/10,-d3.max(state_data, d => d.value)/10); // Adjust the number of ticks as needed
        let legend_x = bar_width*0.85
        let legend_y = bar_height_chart*0.15
        heat_svg.selectAll("rect")
            .data(legendTicks)
            .enter()
            .append("rect")
            .attr("x", legend_x+10) // Set X position
            .attr("y", function(d,i){return legend_y+15*i}) // Set Y position based on color scale
            .attr("width", 12)
            .attr("height", 15)
            .style("fill", d => heat_color(d)); // Set the fill color based on the color scale

        heat_svg.selectAll("color-text")
            .data(legendTicks)
            .enter()
            .append("text")
            .attr("x", legend_x+30) // Adjust the X position for text
            .attr("y", function(d,i){return legend_y+15*i+2;}) // Adjust the Y position for text
            .attr("dy", "0.2em")
            .attr('font-size','10px')
            .text(function(d){if(d<max_range){return d3.format('.0f')(d);}}); // Format the text as needed
        
        heat_svg.selectAll("color-line")
            .data(legendTicks)
            .enter()
            .append("line")
            .attr("x1", legend_x+10) // Adjust the X position for text
            .attr("y1", function(d,i){return legend_y+15*i;}) // Adjust the Y position for text
            .attr("x2",legend_x+25)
            .attr('y2',function(d,i){return legend_y+15*i;})
            .attr('stroke',function(d){if(d<max_range){return 'black';}});
        
        heat_svg
            .append('text')
            .text('# people at risk ')
            .attr('font-size','10px')
            .attr('x',legend_x+30)
            .attr('y',legend_y-25)
            .attr('text-anchor','middle');

        heat_svg
            .append('text')
            .text('per 100K people')
            .attr('font-size','10px')
            .attr('x',legend_x+30)
            .attr('y',legend_y-11)
            .attr('text-anchor','middle');
           
    })
}

function drawBarChart(hoveredCluster) {

    var subgroups = []
    for (var c in hoveredCluster) {
        if (hoveredCluster[c] != 4) {
            subgroups[c] = hoveredCluster[c].toString()
        }
    }
    subgroups = ["total"].concat(subgroups)
    subgroups = subgroups.filter(Boolean);
    // console.log(subgroups);
    d3.select('#barChart').select("svg").remove();

    d3.json('../data/mental_states/factor_corr.json').then(data => {

        var bar_svg = d3.select('#barChart')
            .append('svg')
            .attr("width", bar_width + bar_margin.left + bar_margin.right)
            .attr("height", bar_height + bar_margin.top+bar_margin.bottom*0.5)
            .append("g")
            .attr("transform", `translate(${bar_margin.left*1.5},${bar_margin.top})`);

        // var subgroups = ["1", "2", "3","total"]
        var groups = data.map(d => d.name)

        var x = d3.scaleBand()
            .domain(groups)
            .range([0, bar_width*0.97])
            .padding([0.1])
            
        bar_svg.append("g")
            .attr("transform", `translate(0, ${(bar_height-bar_margin.bottom*0.5) / 2})`)
            .call(d3.axisBottom(x).tickValues([]));

        bar_svg.selectAll("vline")
            .data(groups.slice(1))
            .enter()
            .append("line")
            .attr("x1", d => x(d)-2.5)
            .attr("y1", 0)
            .attr("x2", d => x(d) - 2.5)
            .attr("y2", bar_height-bar_margin.bottom*0.5)
            .attr("stroke", "#ccc");

        bar_svg.selectAll("vlabel")
            .data(groups)
            .enter()
            .append("foreignObject")
            .attr("width", x.bandwidth() - 5)
            .attr("height", 50)
            .attr("x", d => x(d))
            .attr("y", bar_height-bar_margin.bottom*0.5)
            .append("xhtml:div")
            .attr("style", "font-size: 9.2px;")
            .attr("class", "text-wrap")
            .html(d => d);

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([-1, 1])
            .range([bar_height-bar_margin.bottom*0.5, 0]);
        bar_svg.append("g")
            .call(d3.axisLeft(y));

        // Another scale for subgroup position?
        var xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .padding([0.05])

        // color palette = one color per subgroup
        var bar_color_scale = d3.scaleOrdinal(d3.schemePaired).domain(["4", "1", "2", "3", "total"]);

        // create a tooltip
        var tooltip = d3.select("#barChart")
            .append("div")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("font-size", "11px")
            .style('text-align', 'left');

        // Show the bars
        bar_groups = bar_svg.append("g")
            .selectAll("g")
            .data(data)
            .join("g")
            .attr("transform", d => `translate(${x(d.name)}, 0)`)
        bar_groups.selectAll("rect")
            .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
            .join("rect")
            .attr("x", d => xSubgroup(d.key))
            .attr("y", d => y(Math.max(0, d.value)))
            .attr("width", xSubgroup.bandwidth())
            .attr("height", d => Math.abs(y(d.value) - y(0)))
            .attr("fill", d => bar_color_scale(d.key))
            .on("mouseover", function (event, d) {
                tooltip
                    .style("opacity", 1)
                    .html("cluster: " + d.key + '</br>correlation: ' + d3.format('.1')(d.value))
            })
            .on("mousemove", function (event, d) {
                tooltip
                    .style("top", (event.pageY - 50) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                tooltip
                    .style("opacity", 0)
            });


        var legend = bar_svg.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(25,-20)');

        var legendItems = legend.selectAll('.legend-item')
            .data(subgroups)
            .enter()
            .append('g')
            .attr('transform', function (d, i) { return 'translate(' + (i * 80) + ',0)'; });

        legendItems.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .style('fill', bar_color_scale);

        legendItems.append('text')
            .attr('x', 18)
            .attr('y', 7.5)
            .attr('dy', '.35em')
            .text(function (d) { if (d == 'total') { return 'total'; } else { return 'cluster ' + d; } })
            .attr('font-size', '12px');

        bar_svg.append('text')
            .text('Correlation Between Prevalence of Mental Health Issues')
            .attr('x', bar_width / 2.1 - 20)
            .attr('y', bar_margin.top - 145)
            .attr("text-anchor", "middle")
            .attr('font-size', '13px')
            .style('text-anchor', 'middle')
            // .style('font-size', '1em')
            .style('font-weight', 600);

        bar_svg.append('text')
            .text('and Other Factors Across Clusters')
            .attr('x', bar_width / 2.1 - 20)
            .attr('y', bar_margin.top - 125)
            .attr("text-anchor", "middle")
            .attr('font-size', '13px')
            .style('text-anchor', 'middle')
            // .style('font-size', '1em')
            .style('font-weight', 600);

            
    })
}

