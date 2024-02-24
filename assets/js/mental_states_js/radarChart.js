var radar_chart = document.getElementById('radarChart');
var width_radar = radar_chart.clientWidth;
var height_radar = radar_chart.clientHeight;

var radar_margin = { top: 100, right: 100, bottom: 50, left: 30 },
	width = Math.min(700, width_radar - 10) - radar_margin.left - radar_margin.right,
	height = Math.min(width, height_radar - radar_margin.top - radar_margin.bottom - 20);

updateRadarChart(MODE);
function updateRadarChart(MODE) {
	// console.log(MODE)
	if (MODE == 'cluster_mode') {
		drawRadarChart(hoveredCluster);
	} else if (MODE == 'state_mode') {
		drawLineChart(hoverdCountry);
	}

}
function drawLineChart(hoverdCountry) {
	d3.json('../data/mental_states/age_year.json').then(data => {
		var line_color = d3.scaleOrdinal(d3.schemePaired)
			.domain(['adults', 'youth']).range(['#1f78b4', '#a6cee3'])

		d3.select('#radarChart').selectAll("svg").remove();

		var country_data = data[hoverdCountry]
		var sumstat = d3.group(country_data, d => d.issue)

		var line_svg = d3.select('#radarChart')
			.selectAll('.uniqueChart')
			.data(sumstat)
			.enter()
			.append('svg')
			.attr("class", "uniqueChart")
			.attr("width", width_radar-5)
			.attr("height", (height + radar_margin.bottom + 30) / 4)
			.attr("transform", `translate(${radar_margin.left}, ${radar_margin.top-20} )`)

		var x = d3.scaleLinear()
			.domain([d3.min(country_data, function (d) { return d.year; }) - 0.1,
			d3.max(country_data, function (d) { return d.year; })])
			.range([0, width - radar_margin.right*0.4]);

		line_svg.append("g")
			.attr("transform", `translate(40, ${(height + radar_margin.bottom + 30) / 4 - 20} )`)
			.call(d3.axisBottom(x).ticks(4).tickFormat(d3.format('')))
			.style('font-size','12px');

		var y = d3.scaleLinear()
			.domain([d3.max(country_data, function (d) { return +d.value; }) + 20, 0])
			.range([0, (height + radar_margin.bottom + 30) / 4 - 40])

		line_svg.append('g')
			.attr("transform", `translate(40, 20 )`)
			.call(d3.axisLeft(y).ticks(3));

		line_svg.append("text")
			.attr("class", function (d, i) { return "ylabel-" + i })
			.attr('font-size', '12px')
			.attr("transform", "rotate(-90)")
			.attr("x", -30)
			.attr("y", 10)
			.style("text-anchor", "middle");

		let ini = 0
		line_svg.each(function (d) {
			d3.select('.ylabel-' + ini)
				.text(d[0]);
			ini = ini + 1
		})
		// console.log(height*0.05)
		line_svg.selectAll(".line")
			.data(function (d) {
				return [d[1].filter(function (e) { return e.label === "adults"; }), d[1].filter(function (e) { return e.label === "youth"; })];
			})
			.enter()
			.append("path")
			.attr("transform", `translate(39, ${(height + radar_margin.bottom + 30) / 4 - height*0.25})`)
			.attr("fill", "none")
			.attr("stroke", function (_, i) { return line_color(line_color.domain()[i]); })
			.attr("stroke-width", 1.9)
			.attr("d", function (d) {
				return d3.line()
					.x(function (e) { return x(e.year); })
					.y(function (e) { return y(+e.value); })
					(d);
			});

		dots = line_svg.selectAll(".dot")
			.data(d => d.flat())
			.enter()
			.append("rect")
			.attr("class", "dot")
			.attr("transform", `translate(37.5, ${(height + radar_margin.bottom + 30) / 4 - height*0.25})`)
			.attr("x", function (d) { if (typeof d==='string'){return 0;} else{return  x(d.year)-1;} })
			.attr("y", function (d) { if (typeof d === 'string') { return 0; } else { return y(+d.value) - 4; } })
			.attr("width", function (d) { if (typeof d === 'string') { return 0; } else { return 8; } })
			.attr('height', function (d) { if (typeof d === 'string') { return 0; } else { return 8; } })
			.style("fill", function (d) { return line_color(d.label); });


		dots.on("mouseover", function (d, i) {
			newX = parseFloat(d3.select(this).attr('x')) + 41;
			newY = parseFloat(d3.select(this).attr('y'));
			tooltip_line
				.attr('x1', newX)
				.attr('y2', 0)
				.attr('x2', newX)
				.attr('y2', height * 0.255)
				.attr('fill', 'none')
				.style('stroke', line_color(i.label))
				.style('stroke-width', '1px')
				.transition().duration(200)
				.style('opacity', 1);

			tooltip_rect
				.attr('x', newX + 10)
				.attr('y', newY)
				.attr('width', 120)
				.attr('height', 40)
				.attr('fill', 'white')
				.attr('rx', '5px')
				.attr('ry', '5px')
				.style('stroke', line_color(i.label))
				.style('stroke-width', '1.5px')
				.transition().duration(200)
				.style('opacity', 1);

			let ini = 0
			line_svg.each(function (d) {
				d3.select('.tooltip_content1-' + ini)
					.attr('x', newX + 15)
					.attr('y', newY + 15)
					.text(d[0] + ' risk in '+i.label+': ')
					.attr('font-size', '10px')
					.transition().duration(200)
					.style('opacity', 1);

				d3.select('.tooltip_content2-' + ini)
					.attr('x', newX + 15)
					.attr('y', newY + 30)
					.text(d3.format('.3')(country_data.filter(row => (row.label == i.label) & (row.year == i.year))[ini].value) + ' per 100K people')
					.attr('font-size', '10px')
					.transition().duration(200)
					.style('opacity', 1);
				ini = ini + 1
			})

		})
			.on("mouseout", function () {
				tooltip_line.transition().duration(0)
					.style("opacity", 0);
				tooltip_rect.transition().duration(0)
					.style("opacity", 0);
				tooltip_content1.transition().duration(0)
					.style("opacity", 0);
				tooltip_content2.transition().duration(0)
					.style("opacity", 0);
			});

		// set up the small tooltip for when you hover over a circle
		var tooltip_line = line_svg.append("line")
			.attr("class", "tooltip_line")
			.style("opacity", 0);

		var tooltip_rect = line_svg.append("rect")
			.attr("class", "tooltip_rect")
			.style("opacity", 0);

		var tooltip_content1 = line_svg.append("text")
			.attr("class", function (d, i) { return "tooltip_content1-" + i })
			.style("opacity", 0);

		var tooltip_content2 = line_svg.append("text")
			.attr("class", function (d, i) { return "tooltip_content2-" + i })
			.style("opacity", 0);

		
		var title = d3.select('#radarChart').append("svg")
			.attr('width',width_radar*0.95)
			.attr('height','150px')
			.attr("transform", `translate(0, ${height_radar * -0.8})`)
		title.append('text')
			.text(function(){if (hoverdCountry=='mean'){return 'Temporal Trends in Mental Health Risk';}else{return hoverdCountry+': Temporal Trends in Mental Health Risk';}})
			.attr('x',width_radar*0.5)
			.attr('y',50)
			.attr('font-size','13px')
			.style('text-anchor', 'middle')
            .style('font-weight', 600)
			.attr('text-anchor','middle');
		title.append('text')
			.text('across Age Groups from 2020 to 2023')
			.attr('x',width_radar*0.5)
			.attr('y',70)
			.attr('font-size','13px')
			.style('text-anchor', 'middle')
            .style('font-weight', 600)
			.attr('text-anchor','middle');

		var legend = d3.select('#radarChart').select('svg').append("g");

		// Add rectangles to the legend
		legend.selectAll("rect")
			.data(['adults', 'youth'])
			.enter()
			.append("rect")
			.attr("x", width_radar*0.78)
			.attr("y", function (d, i) { return 30+(i * 20); })
			.attr("width", 10)
			.attr("height", 10)
			.style("fill", d => line_color(d));

		// Add text to the legend
		legend.selectAll(".text")
			.data(['adults', 'youth'])
			.enter()
			.append("text")
			.attr("x", width_radar*0.82)
			.attr("y", function (d, i) { return 35+(i * 20); })
			.text(function (d) { return d; })
			.attr('font-size', '12px')
			.attr('alignment-baseline','middle');

	})
}


function drawRadarChart(hoveredCluster) {
	d3.json('../data/mental_states/radar_data.json').then(data => {
		// cluster4 > cluster3> cluster1> mean > cluster2>
		var radar_color_scale = d3.scaleOrdinal(d3.schemePaired).domain(["4", "1", "2", "3", "mean"]);
		var show_clusters = ["mean"].concat(hoveredCluster)
		drawData = updateChart(data, show_clusters)
		var colors = []
		for (var c in show_clusters) {
			show_clusters[c] = show_clusters[c].toString()
			colors.push(radar_color_scale(show_clusters[c].toString()))
		}
		var show_color = d3.scaleOrdinal().range(colors).domain(show_clusters);
		
		d3.scaleOrdinal(d3.schemeCategory10)
		var radarChartOptions = {
			w: width,
			h: height,
			margin: radar_margin,
			maxValue: 60,
			levels: 3,
			roundStrokes: true,
			color: show_color,
			cluster: show_clusters,
		};

		RadarChart(".radarChart", drawData, radarChartOptions);
	})
}
function updateChart(data, cluster) {
	var newData = [];
	for (var i in cluster) {
		if (cluster[i] == 'mean') {
			newData = newData.concat([data.mean]);
		} else {
			newData = newData.concat([data[cluster[i]]]);
		}
	}
	return newData
}
function RadarChart(id, data, options) {
	// configuration
	var cfg = {
		w: 600,				//Width of the circle
		h: 600,				//Height of the circle
		margin: { top: 20, right: 20, bottom: 20, left: 20 }, //The margins of the SVG
		levels: 3,				//How many levels or inner circles should there be drawn
		maxValue: 0, 			//What is the value that the biggest circle will represent
		labelFactor: 1.2, 	//How much farther than the radius of the outer circle should the labels be placed
		wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
		opacityArea: 0.1, 	//The opacity of the area of the blob
		dotRadius: 4, 			//The size of the colored circles of each blog
		opacityCircles: 0.1, 	//The opacity of the circles of each blob
		strokeWidth: 2, 		//The width of the stroke around each blob
		roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
		color: d3.scaleOrdinal(d3.schemeCategory10),	//Color function
		cluster: []
	};

	if ('undefined' !== typeof options) {
		for (var i in options) {
			if ('undefined' !== typeof options[i]) { cfg[i] = options[i]; }
		}
	}

	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function (i) { return d3.max(i.map(function (o) { return o.value; })) }));

	var allAxis = (data[0].map(function (i, j) { if (i.axis == 'cognitive_disability') { return 'cognitive disability'; } else { return i.axis; } })),
		total = allAxis.length,
		radius = Math.min(cfg.w / 2, cfg.h / 2),
		Format = d3.format('.3'),
		angleSlice = Math.PI * 2 / total;

	// radius
	var rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxValue]);

	// configure svg
	//Remove whatever chart with the same id/class was present before
	d3.select(id).selectAll("svg").remove();

	//Initiate the radar chart SVG
	var svg = d3.select(id).append("svg")
		.attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
		.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
		.attr("class", "radar" + id);
	var g = svg.append("g")
		.attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");


	svg.append('text')
		.text('Average Mental Health Risk Patterns Across Clusters')
		.attr('x', cfg.w / 2 + cfg.margin.left*2.5)
		.attr('text-anchor', 'middle')
		.attr('y', 40)
		.style('text-anchor', 'middle')
        // .style('font-size', '1em')
        .style('font-weight', 600)
		.attr('font-size', '13px')

	// svg.append('text')
	// 	.text('')
	// 	.attr('x', cfg.w / 2 + cfg.margin.left*2.5)
	// 	.attr('text-anchor', 'middle')
	// 	.attr('y', 60)
	// 	.style('text-anchor', 'middle')
    //     // .style('font-size', '1em')
    //     .style('font-weight', 600)
	// 	.attr('font-size', '13px')

		


	var legend = svg.append('g')
		.attr('class', 'legend')
		.attr('transform', 'translate(' + (cfg.w*1.1) + ',' + cfg.h / 2 + ')');

	var legendItems = legend.selectAll('.legend-item')
		.data(cfg.color.domain())
		.enter()
		.append('g')
		.attr('transform', function (d, i) { return 'translate(0, ' + (i * 20) + ')'; });

	legendItems.append('rect')
		.attr('width', 15)
		.attr('height', 15)
		.style('fill', cfg.color);

	legendItems.append('text')
		.attr('x', 18)
		.attr('y', 7.5)
		.attr('dy', '.35em')
		.text(function (d) { if (d == 'mean') { return 'total'; } else { return 'cluster ' + d; } })
		.attr('font-size', '12px');

	// Draw the Circular grid
	var axisGrid = g.append("g").attr("class", "axisWrapper");

	//Draw the background circles
	axisGrid.selectAll(".levels")
		.data(d3.range(1, (cfg.levels + 1)).reverse())
		.enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function (d, i) { return radius / cfg.levels * d; })
		.style("fill", "#ccc")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", cfg.opacityCircles)
		.style("filter", "url(#glow)");

	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
		.data(d3.range(1, (cfg.levels + 1)).reverse())
		.enter().append("text")
		.attr("class", "axisLabel")
		.attr("x", 4)
		.attr("y", function (d) { return -d * radius / cfg.levels; })
		.attr("dy", "0.4em")
		.style("font-size", "11px")
		.attr("fill", "#737373")
		.text(function (d, i) { return Format(maxValue * d / cfg.levels); });


	// draw axes
	// create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
	// append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function (d, i) { return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2); })
		.attr("y2", function (d, i) { return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

	// append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "11px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function (d, i) { return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); })
		.attr("y", function (d, i) { return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2); })
		.text(function (d) { return d })
		.call(wrap, cfg.wrapWidth);

	// radar chart blobs
	// the radial line function
	var radarLine = d3.lineRadial().curve(d3.curveBasisClosed)
		.curve(d3.curveCardinalClosed)
		.radius(function (d) { return rScale(d.value); })
		.angle(function (d, i) { return i * angleSlice; });

	if (cfg.roundStrokes) {
		radarLine.curve(d3.curveCardinalClosed);
	}

	//  create a wrapper for the blobs	
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper");

	// append the backgrounds	
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", function (d, i) { return radarLine(d); })
		.style("fill", function (d, i) { return cfg.color(i); })
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d, i) {
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1);
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);
		})
		.on('mouseout', function () {
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
		});

	//Create the outlines	
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function (d, i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function (d, i) { return cfg.color(i); })
		.style("fill", "none")
		.style("filter", "url(#glow)");

	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(function (d, i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function (d, i) { return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2); })
		.attr("cy", function (d, i) { return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); })
		.style("fill", function (d, i, j) { return cfg.color(j); })
		.style("fill-opacity", 0.8);


	// append invisible circles for tooltip
	// wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");

	// append a set of invisible circles on top for the mouseover pop-up



	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function (d, i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius * 1.5)
		.attr("cx", function (d, i) { return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2); })
		.attr("cy", function (d, i) { return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function (d, i) {
			newX = parseFloat(d3.select(this).attr('cx')) - 10;
			newY = parseFloat(d3.select(this).attr('cy')) - 10;

			tooltip_rect
				.attr('x', function () { if (i.axis == 'cognitive_disability') { return newX - 100; } else { if (i.axis == 'disorder' || i.axis == 'depression') { return newX - 120 } else { return newX + 25; } } })
				.attr('y', newY+20)
				.attr('width', function () { if (i.axis == 'cognitive_disability') { return 140; } else { return 120; } })
				.attr('height', 40)
				.attr('fill', 'white')
				.attr('rx', '5px')
				.attr('ry', '5px')
				.style('stroke', 'black')
				.style('stroke-width', '2px')
				.transition().duration(200)
				.style('opacity', 0.9);

			tooltip1
				.attr('x', function () { if (i.axis == 'cognitive_disability') { return newX - 95; } else { if (i.axis == 'disorder' || i.axis == 'depression') { return newX - 115 } else { return newX + 30; } } })
				.attr('y', newY + 35)
				.text(`${i.axis === 'cognitive_disability' ? 'cognitive disability risk' : i.axis + ' risk'}:`)
				.transition().duration(200)
				.style('opacity', 1)
				.style('font-size', '11px')
				.style('font-family', 'Inter');

			tooltip2
				.attr('x', function () { if (i.axis == 'cognitive_disability') { return newX - 95; } else { if (i.axis == 'disorder' || i.axis == 'depression') { return newX - 115 } else { return newX + 30; } } })
				.attr('y', newY + 50)
				.text(`${Format(i.value)}`+' per 100K people')
				.style('font-size', '11px')
				.transition().duration(200)
				.style('opacity', 1)
				.style('font-family', 'Inter');
		})
		.on("mouseout", function () {
			tooltip1.transition().duration(0)
				.style("opacity", 0);
			tooltip2.transition().duration(0)
				.style("opacity", 0);
			tooltip_rect.transition().duration(0)
				.style("opacity", 0);
		});

	// set up the small tooltip for when you hover over a circle
	var tooltip_rect = g.append("rect")
		.attr("class", "tooltip_rect")
		.style("opacity", 0);

	var tooltip1 = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);

	var tooltip2 = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);

	//Wraps SVG text	
	function wrap(text, width) {
		text.each(function () {
			var text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.4, // ems
				y = text.attr("y"),
				x = text.attr("x"),
				dy = parseFloat(text.attr("dy")),
				tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
				}
			}
		});
	}//wrap	

}//RadarChart