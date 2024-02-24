var network_promises = [];
network_promises.push(d3.json("../data/mental_states/us.json"));
network_promises.push(d3.json("../data/mental_states/network_data.json"));
network_promises.push(d3.json("../data/mental_states/state_prevalence.json"));

var network_chart = document.getElementById('networkChart');
var network_width_chart = network_chart.clientWidth;
var network_height_chart = network_chart.clientHeight;

var cluster_id = [4, 1, 2, 3];
var cluster_color_scale = d3.scaleOrdinal(d3.schemePaired).domain(cluster_id);

var hoveredCluster = [];
var hoverdCountry = 'mean';
var infoState = 'close'
// var insightState = 'close'
updateNetworkChart(MODE)

// function insight_mode() {
//     if (insightState === 'close') {
//         if (infoState === 'open') {
//             d3.select('#networkChart').selectAll('.help-info').remove();
//             document.getElementById('help').innerText = 'help';
//             document.getElementById('help').classList.remove('active');
//             infoState = 'close';
//         }

//         insightState = 'open';
//         document.getElementById('insight').classList.add('active');
//         document.getElementById('insight').innerText = 'close';


//     }else if (insightState === 'open'){
//         document.getElementById('insight').classList.remove('active');
//         insightState = 'close';
//         document.getElementById('insight').innerText = 'insight';
//         d3.select('#networkChart').selectAll('.help-info').remove();
//     }
// }

function info_mode() {
    if (infoState === 'close') {
        // if (insightState === 'open'){
        //     document.getElementById('insight').classList.remove('active');
        //     insightState = 'close';
        //     document.getElementById('insight').innerText = 'insight';
        //     d3.select('#networkChart').selectAll('.help-info').remove();
        // }
        infoState = 'open'
        document.getElementById('help').innerText = 'close help';
        document.getElementById('help').classList.add('active');

        var info = d3.select('#networkChart').select('svg')
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
            .style('text-align', 'left');

        // Adding HTML content inside the div
        if (MODE === 'state_mode') {
            div.html('<strong>To use this dashboard:</strong><br>1. Hover over each state\'s bubble to view state-level statistics.</br>2. Click on bubble to lock in and display state-level information.</br>3. Double-click the map to reset all the charts.</br>4. All charts are equipped with hover tooltips for detailed information display.');
        } else {
            div.html('<strong>To use this dashboard:</strong><br>1. Hover over each state\'s bubble to view its cluster-level statistics.</br>2. Click on bubbles to lock in and display cluster-level information. Clusters can be simultaneously selected for comparison.</br>3. Double-click map to reset all the charts.</br>4. All charts are equipped with hover tooltips for detailed information display.');
        }
    } else if (infoState === 'open') {
        d3.select('#networkChart').selectAll('.help-info').remove();
        document.getElementById('help').innerText = 'help';
        document.getElementById('help').classList.remove('active');
        infoState = 'close';
    }


}
function updateNetworkChart(MODE) {

    Promise.all(network_promises).then(function (values) {
        var us = values[0];
        var nodes = values[1].nodes;
        var links = values[1].links;
        var prevalence = values[2];

        var radius = d3.scaleSqrt([15, 30], [network_height_chart * 0.007, network_height_chart * 0.035]);
        var relation = d3.scaleLinear([0, 16], [4, 0.5])

        d3.select('#networkChart').select('svg').remove();
        d3.select('#networkChart').select('div').remove();

        var svg = d3.select('#networkChart').append("svg")
            .attr("width", network_width_chart + 100)
            .attr("height", network_height_chart)
            .attr('font-family', 'Inter');

        var projection = d3.geoAlbersUsa()
            .fitSize([network_width_chart * 0.9, network_height_chart], us);

        var path = d3.geoPath().projection(projection);

        svg.selectAll('.states')
            .data(us.features)
            .enter()
            .append('path')
            .attr('fill', 'white')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 2)
            .attr('d', path);

        var tooltip = d3.select("#networkChart")
            .append("div")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("font-size", "12px")
            .style('text-align', 'left');

        if (MODE == 'cluster_mode') {
            var clicked_event = false;
            var hoveredCluster = [];
            var state_links = svg.selectAll('.state_links')
                .data(links)
                .enter()
                .append('line')
                .attr('class', 'state_links')
                .attr('stroke', d => d3.color(cluster_color_scale(d.cluster)).darker())
                .attr('stroke-width', d => relation(d.relationship))
                .attr('x1', d => projection(d.source_coordinates)[0])
                .attr('y1', d => projection(d.source_coordinates)[1])
                .attr('x2', d => projection(d.source_coordinates)[0])
                .attr('y2', d => projection(d.source_coordinates)[1])
                .attr('opacity', 0)
                .transition()
                .duration(800)
                .attr('x2', d => projection(d.target_coordinates)[0])
                .attr('y2', d => projection(d.target_coordinates)[1])
                .attr('opacity', 0.8)

            var info = d3.select('#networkChart').select('svg')
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
                .attr('height', 110)
                .style('overflow-y', 'auto');;

            var div = foreignObject.append('xhtml:div')
                .style('text-align', 'left');

            div.html('<strong>Get some insights:</strong> This dashboard classifies U.S. states into four clusters based on six mental health risks: depression, psychosis, PTSD, suicide, cognitive disability, and disorder. </br>' +
                '<strong>Cluster 1</strong>: \'Cognitive Disability Highlight Cluster\', has severe cognitive disability risks. </br>' +
                '<strong>Cluster 2</strong>: \'Low Risk Cluster\', is characterized by relatively lower risks across all mental health dimensions. </br>' +
                '<strong>Cluster 3</strong>: \'Moderate Risk Cluster\', encompass the majority of U.S. states. </br>' +
                '<strong>Cluster 4</strong>: \'Potential High Risk Cluster\', currently only includes Alaska, hence lacks correlation data.'
            );

            var state_nodes = svg.selectAll('.state_nodes')
                .data(nodes)
                .enter()
                .append('circle')
                .attr('cx', d => projection(d.coordinates)[0])
                .attr('cy', d => projection(d.coordinates)[1])
                .attr('r', d => radius(d.prevalence_percent))
                .attr('fill', d => cluster_color_scale(d.hcluster))
                .attr('opacity', 1)
                .attr('stroke', d => d3.color(cluster_color_scale(d.hcluster)).darker(1))

            svg.selectAll('.nodes_label')
                .data(nodes)
                .enter()
                .append('text')
                .attr('x', d => projection(d.coordinates)[0])
                .attr('y', d => projection(d.coordinates)[1] + 2)
                .attr('fill', 'white')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr('font-size', d => radius(d.prevalence_percent) - 3)
                .attr('opacity', 1)
                .text(d => d.abbrv)

            state_nodes
                .on('mouseover', function (event, d) {
                    if (!clicked_event) {
                        var hoveredCluster = d3.select(this).datum().hcluster;
                        state_nodes.attr('fill', function (e) {
                            return e.hcluster === hoveredCluster ? cluster_color_scale(e.hcluster) : '#B8B8B8';
                        });
                        state_nodes.attr('opacity', function (e) {
                            return e.hcluster === hoveredCluster ? 1 : 0.3;
                        });

                        d3.selectAll('.state_links').transition().duration(0)
                            .attr('stroke', function (e) {
                                return e.cluster === hoveredCluster ? d3.color(cluster_color_scale(e.cluster)).darker() : '#B8B8B8';
                            })
                            .attr('opacity', function (e) {
                                return e.cluster === hoveredCluster ? 1 : 0.3;
                            });
                        clicked_event = false;
                    };

                    tooltip
                        .style("opacity", 1)
                        .html('<strong>cluster ' + d.hcluster + ':</strong></br>number of cluster members: <strong>' +
                            d.cluster_mem_number + '</strong></br>cluster-representative state: <strong>' +
                            d.representative + '</strong></br>cluster average prevalence: <strong>' +
                            d3.format('.4')(d.mean_pervalence) + '%</strong>');

                })
                .on('mouseout', function (d) {
                    if (!clicked_event) {
                        state_nodes.attr('fill', d => cluster_color_scale(d.hcluster))
                        state_nodes.attr('opacity', 1)
                        d3.selectAll('.state_links').transition().duration(0)
                            .attr('stroke', d => d3.color(cluster_color_scale(d.cluster)).darker())
                            .attr('opacity', 0.8);
                        clicked_event = false;
                    };
                    tooltip
                        .style("opacity", 0)
                })
                .on('mousemove', function (event, d) {
                    tooltip
                        .style("top", (event.pageY - 50) + "px")
                        .style("left", (event.pageX + 10) + "px");
                })
                .on('click', function (d) {
                    if (clicked_event) {
                        if (!hoveredCluster.includes(d3.select(this).datum().hcluster)) {
                            hoveredCluster.push(d3.select(this).datum().hcluster);
                            state_nodes.attr('fill', function (e) {
                                return hoveredCluster.includes(e.hcluster) ? cluster_color_scale(e.hcluster) : '#B8B8B8';
                            });
                            state_nodes.attr('opacity', function (e) {
                                return hoveredCluster.includes(e.hcluster) ? 1 : 0.3;
                            });

                            d3.selectAll('.state_links').transition().duration(0)
                                .attr('stroke', function (e) {
                                    return hoveredCluster.includes(e.cluster) ? d3.color(cluster_color_scale(e.cluster)).darker() : '#B8B8B8';
                                })
                                .attr('opacity', function (e) {
                                    return hoveredCluster.includes(e.cluster) ? 1 : 0.3;
                                });
                            drawRadarChart(hoveredCluster);
                            drawBarChart(hoveredCluster);
                            clicked_event = true;
                        }
                    } else {
                        hoveredCluster.push(d3.select(this).datum().hcluster);
                        state_nodes.attr('fill', function (e) {
                            return hoveredCluster.includes(e.hcluster) ? cluster_color_scale(e.hcluster) : '#B8B8B8';
                        });
                        state_nodes.attr('opacity', function (e) {
                            return hoveredCluster.includes(e.hcluster) ? 1 : 0.3;
                        });

                        d3.selectAll('.state_links').transition().duration(0)
                            .attr('stroke', function (e) {
                                return hoveredCluster.includes(e.cluster) ? d3.color(cluster_color_scale(e.cluster)).darker() : '#B8B8B8';
                            })
                            .attr('opacity', function (e) {
                                return hoveredCluster.includes(e.cluster) ? 1 : 0.3;
                            });
                        // console.log(hoveredCluster);
                        drawRadarChart(hoveredCluster);
                        drawBarChart(hoveredCluster);
                        clicked_event = true;
                    }

                })
            svg.on('dblclick', function (d) {
                clicked_event = false;
                if (!clicked_event) {
                    state_nodes.attr('fill', d => cluster_color_scale(d.hcluster))
                    state_nodes.attr('opacity', 1)
                    d3.selectAll('.state_links').transition().duration(0)
                        .attr('stroke', d => d3.color(cluster_color_scale(d.cluster)).darker())
                        .attr('opacity', 1)
                    hoveredCluster = [];
                    drawRadarChart(hoveredCluster);
                    drawBarChart(hoveredCluster);
                };
            });
            svg.append('text')
                .text('Cluster Analysis Based on')
                .attr('x', network_width_chart / 2)
                .style('text-anchor', 'middle')
                .style('text-anchor', 'middle')
                .style('font-size', '1.6em')
                .style('font-weight', 600)
                .attr('y', network_height_chart * 0.15)

            svg.append('text')
                .text('Mental Health Risk Patterns by State')
                .attr('x', network_width_chart / 2)
                .style('text-anchor', 'middle')
                .style('text-anchor', 'middle')
                .style('font-size', '1.6em')
                .style('font-weight', 600)
                .attr('y', network_height_chart * 0.2)



            let line_legend_x = network_width_chart * 0.94
            let line_legend_y = network_height_chart * 0.7
            var line_legend = svg.selectAll('line-legend')
                .data([1, 8, 16])
                .enter()

            line_legend.append('line')
                .attr('x1', line_legend_x - 50)
                .attr('x2', line_legend_x - 20)
                .attr('y1', function (d, i) { return line_legend_y + i * 15 })
                .attr('y2', function (d, i) { return line_legend_y + i * 15 })
                .attr('stroke', 'black')
                .style('stroke-width', d => relation(d))

            line_legend.append('text')
                .attr('x', line_legend_x - 15)
                .attr('y', function (d, i) { return line_legend_y + i * 15 })
                .text(function (d, i) { if (i == 2) { return 'low strength'; } else if (i == 1) { return 'medium strength'; } else if (i == 0) { return 'high strength'; } })
                .attr('font-size', '12px')
                .attr('alignment-baseline', 'middle')

            svg.append('text')
                .attr('x', line_legend_x - 65)
                .attr('y', line_legend_y - 18)
                .text('similarity from cluster center')
                .attr('font-size', '12px')
                .attr('alignment-baseline', 'middle')

            let color_legend_x = network_width_chart * 0.2
            let color_legend_y = network_height_chart * 0.25
            var color_legend = svg.selectAll('color-legend')
                .data([1, 2, 3, 4])
                .enter()
            color_legend.append('rect')
                .attr('x', function (d, i) { return color_legend_x + i * 80; })
                .attr('y', function (d, i) { return color_legend_y; })
                .attr('width', 10)
                .attr('height', 10)
                .attr('fill', d => cluster_color_scale(d))

            color_legend.append('text')
                .attr('x', function (d, i) { return color_legend_x + i * 80 + 13; })
                .attr('y', function (d, i) { return color_legend_y + 5; })
                .attr('width', 10)
                .attr('height', 10)
                .text(d => 'cluster' + d)
                .attr('font-size', '12px')
                .attr('alignment-baseline', 'middle')

        } else {
            var state_nodes = svg.selectAll('.state_nodes')
                .data(nodes)
                .enter()
                .append('circle')
                .attr('cx', d => projection(d.coordinates)[0])
                .attr('cy', d => projection(d.coordinates)[1])
                .attr('r', d => radius(d.prevalence_percent))
                .attr('fill', '#2e59c6')
                .attr('opacity', 1)
                .attr('stroke', '#16547E')

            svg.selectAll('.nodes_label')
                .data(nodes)
                .enter()
                .append('text')
                .attr('x', d => projection(d.coordinates)[0])
                .attr('y', d => projection(d.coordinates)[1] + 2)
                .attr('fill', 'white')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr('font-size', d => radius(d.prevalence_percent) - 3)
                .attr('opacity', 1)
                .text(d => d.abbrv)

            state_nodes
                .on('mouseover', function (event, d) {
                    let pdata = prevalence.filter(row => d.state === row.state)[0]
                    if (!clicked_event) {
                        state_nodes.attr('fill', "#B8B8B8")
                        d3.select(this).attr('fill', '#2e59c6')
                        tooltip
                            .style("opacity", 1)
                            .html('<strong>' + pdata.state + '</strong></br>' +
                                'prevalence of any mental health issue: <strong>' + d3.format('.3')(pdata.prevalence_percent) + '%</strong></br>' +
                                'depression risk: <strong>' + d3.format('.3')(pdata.depression) + '</strong> per 100K people</br>' +
                                'suicide risk: <strong>' + d3.format('.3')(pdata.suicide) + '</strong> per 100K people</br>' +
                                'ptsd risk: <strong>' + d3.format('.3')(pdata.ptsd) + '</strong> per 100K people</br>' +
                                'psychosis risk: <strong>' + d3.format('.3')(pdata.psychosis) + '</strong> per 100K people</br>'
                            );
                    }
                })
                .on('mousemove', function (event, d) {
                    if (!clicked_event) {
                        tooltip
                            .style("top", (event.pageY - 50) + "px")
                            .style("left", (event.pageX + 10) + "px");
                    }
                })
                .on('mouseout', function (d) {
                    if (!clicked_event) {
                        state_nodes.attr('fill', '#2e59c6')
                        tooltip.style("opacity", 0)
                    }

                })
                .on('click', function (event, d) {
                    state_nodes.attr('fill', "#B8B8B8")
                    d3.select(this).attr('fill', '#2e59c6')
                    hoverdCountry = d3.select(this).datum().state;
                    drawLineChart(hoverdCountry);
                    drawHeatMap(hoverdCountry);
                    clicked_event = true;

                    let pdata = prevalence.filter(row => d.state === row.state)[0]
                    tooltip
                        .style("opacity", 1)
                        .html('<strong>' + pdata.state + '</strong></br>' +
                            'prevalence of any mental health issue: <strong>' + d3.format('.3')(pdata.prevalence_percent) + '%</strong></br>' +
                            'depression risk: <strong>' + d3.format('.3')(pdata.depression) + '</strong> per 100K people</br>' +
                            'suicide risk: <strong>' + d3.format('.3')(pdata.suicide) + '</strong> per 100K people</br>' +
                            'ptsd risk: <strong>' + d3.format('.3')(pdata.ptsd) + '</strong> per 100K people</br>' +
                            'psychosis risk: <strong>' + d3.format('.3')(pdata.psychosis) + '</strong> per 100K people</br>'
                        )
                        .style("top", (event.pageY - 30) + "px")
                        .style("left", (event.pageX + 10) + "px");
                })

            svg.on('dblclick', function (d) {
                clicked_event = false;
                if (!clicked_event) {
                    state_nodes.attr('fill', '#2e59c6')
                    state_nodes.attr('opacity', 1)
                    tooltip.style("opacity", 0)
                    hoverdCountry = 'mean';
                    drawLineChart(hoverdCountry);
                    drawHeatMap(hoverdCountry);
                };
            });
            svg.append('text')
                .text('Prevalence of Mental Health Issues')
                .attr('x', network_width_chart / 2)
                .style('text-anchor', 'middle')
                .style('font-size', '1.6em')
                .style('font-weight', 600)
                .attr('y', network_height_chart * 0.15)

            svg.append('text')
                .text('Among U.S. Residents in 2023')
                .attr('x', network_width_chart / 2)
                .style('text-anchor', 'middle')
                .style('font-size', '1.6em')
                .style('font-weight', 600)
                .attr('y', network_height_chart * 0.2)


        }

        let radius_legend_x = network_width_chart * 0.95
        let radius_legend_y = network_height_chart * 0.55

        var radius_legend = svg.selectAll('radius-legend')
            .data([15, 20, 30])
            .enter()

        radius_legend.append('circle')
            .attr('cx', radius_legend_x)
            .attr('cy', d => radius_legend_y - radius(d))
            .attr('r', d => radius(d))
            .attr('fill', 'none')
            .attr('stroke', 'black')

        radius_legend.append('line')
            .attr('x1', function (d) { return radius_legend_x + radius(d) })
            .attr('x2', radius_legend_x + 65)
            .attr('y1', function (d) { return radius_legend_y - radius(d) })
            .attr('y2', function (d) { return radius_legend_y - radius(d) })
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        radius_legend.append('text')
            .attr('x', radius_legend_x + 65)
            .attr('y', d => radius_legend_y - radius(d))
            .text(d => d + '%')
            .style('font-size', '12px')
            .attr('alignment-baseline', 'middle')

        svg.append('text')
            .attr('x', radius_legend_x - radius(10))
            .attr('y', radius_legend_y + radius(20))
            .text('prevalence of')
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')

        svg.append('text')
            .attr('x', radius_legend_x - radius(10))
            .attr('y', radius_legend_y + radius(20) + 15)
            .text('any mental health issue')
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')

    });
}

