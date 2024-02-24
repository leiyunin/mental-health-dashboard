
var map_chart = document.getElementById('map');
var map_width_chart = map_chart.clientWidth;
var map_height_chart = map_chart.clientHeight;



var promises = [];
    
    promises.push(d3.json("../data/mental_resource/counties-10m.json"));
    promises.push(d3.json("../data/mental_resource/All_bubble.json"));
    promises.push(d3.csv("../data/mental_resource/id_state_pop.csv"));
    promises.push(d3.csv("../data/mental_resource/id_county_pop.csv"));
    promises.push(d3.json("../data/mental_resource/stateAbbre.json"));

    
    Promise.all(promises).then(function (values) {  //use Promise.all to load map and data
      var us = values[0];
      var data1 = values[1];
      var pop = values[2];
      var cou_pop = values[3];
      var stateAbbreviations = values[4];

      format = d3.format(',.0f')
    
      var feature = topojson.feature(us, us.objects.states);
      
      //states = new Map(us.objects.states.geometries.map(d => [d.id, d.properties]));
      var tooltip1 = d3.select("#tooltip");
      //create a map to use to map values to marks
     var data = new Map(data1.slice(1).map(([Site_Count, state, county]) => [state + county, +Site_Count]))
     var stateSiteCounts = new Map();

data1.slice(1).forEach(([Site_Count, state, county]) => {
    // Convert Site_Count to a number
    Site_Count = +Site_Count;

    // Check if the state already exists in the map
    if (stateSiteCounts.has(state)) {
        // If it exists, add the current Site_Count to the existing count
        stateSiteCounts.set(state, stateSiteCounts.get(state) + Site_Count);
    } else {
        // If it doesn't exist, add the state with the current Site_Count
        stateSiteCounts.set(state, Site_Count);
    }
});

//console.log(stateSiteCounts); 
      //states = new Map(us.objects.states.geometries.map(d => [d.id, d.properties]));
      //scaleSqrt is used to size the circles by area, as opposed to radius. Note quantile scale. 
      radius = d3.scaleSqrt([0, d3.quantile([...data.values()].sort(d3.ascending), 0.985)], [0, 5]);
      pop = Object.assign(new Map(pop.map((d) => [d.id, +d.population])));
      pop.title = "Population (in millions)";
      cou_pop = Object.assign(new Map(cou_pop.map((d) => [d.id, +d.population])));
      cou_pop.title = "Population";
//console.log(da)
      var stateResourceData = new Map();
      data1.forEach(([siteCount, state, county]) => {
          if (!stateResourceData.has(state)) {
              stateResourceData.set(state, 0);
          }
          stateResourceData.set(state, stateResourceData.get(state) + parseInt(siteCount));
      });

    //console.log(pop)
    // color scale for state
    var color = d3.scaleQuantile()
    .domain(pop.values())
    .range(d3.schemeBlues[9]); 

// color scale for county
var color2 = d3.scaleQuantile()
.domain(cou_pop.values())
.range(d3.schemeBlues[9]);

var path = d3.geoPath()
        .projection(d3.geoAlbersUsa()
            .fitSize([map_width_chart*0.9, map_height_chart], feature));

    var svg = d3.select('#map').append('svg')
        .attr('width', map_width_chart+100)
        .attr('height', map_height_chart)
        .style('fill','white')
    
    // Assuming colorScale is your quantile scale for population data


// Create legend container
var legend = svg.append("g")
.attr("class", "legend")
.attr("transform", "translate(10, 50)"); // Replace x and y with your desired position

// Add legend items
var legendItemWidth = 30;  // Width of the rectangle
var legendItemHeight = 7;
var legendSpacing = 0; // Increased for horizontal spacing
var colorScale = d3.scaleQuantile()
    .domain([d3.min(pop.values()), d3.max(pop.values())]) // Assuming 'data' is your dataset
    .range(d3.schemeBlues[9]);

var legendItems = colorScale.range().map((color, i) => {
    // Get the domain value for the color, if available
    var domainValue = colorScale.invertExtent(color)[0];
    return {
        color: color,
        text: domainValue !== undefined ? `${Math.round(domainValue)}` : '...'
        
    };
});

// Rest of your legend code...

//console.log(d3.max(pop.values()))
//console.log(legendItems)
// Calculate the width of each legend item (including spacing)
var totalItemWidth = legendItemWidth + legendSpacing;
function formatNumber(num) {
    return num ? Math.round(num / 1000000) : 0;
}

// Append colored rectangles and text labels
legend.selectAll(".legend-rect")
.data(legendItems)
.enter().append("rect")
.attr("class", "legend-rect")
.attr("x", (d, i) => i * totalItemWidth)
.attr("y", map_height_chart*0.75)
.attr("width", legendItemWidth)
.attr("height", legendItemHeight)
.attr("fill", d => d.color)
.attr("visibility", "visible");

legend.selectAll(".legend-text")
    .data(legendItems)
    .enter().append("text")
    .attr("class", "legend-text")
    .attr("x", (d, i) => i * totalItemWidth + legendItemWidth ) // Center the text under the rectangle
    .attr("y", legendItemHeight + map_height_chart*0.75 +7) // Position below the line and rectangle
    .text(d => Math.round(formatNumber(d.text)))
    .attr("fill", "black")
    .attr("font-size", 10)
    .attr("text-anchor", "middle") // Center align text
    .attr("alignment-baseline", "hanging")
    .attr("visibility", "visible");
legend.selectAll(".legend-line")
    .data(legendItems)
    .enter().append("line")
    .attr("class", "legend-line")
    .attr("x1", (d, i) => i * totalItemWidth + legendItemWidth)
    .attr("y1", map_height_chart*0.75)
    .attr("x2", (d, i) => i * totalItemWidth + legendItemWidth)
    .attr("y2", legendItemHeight+map_height_chart*0.75+5)
    .attr("stroke", "black")
    .attr("stroke-width", 0.8)
    .attr("visibility", "visible");

legend.append("text")
    .attr("class", "legend-title")
    .attr("x", 0) // Positioning the title at the beginning of the legend
    .attr("y", map_height_chart*0.75-10) // Adjust the y-position to place it above the legend items
    .text(pop.title)
    .attr("fill", "black") // Optional: set the text color
    .style("font-size", "12px") // Optional: set the font size
    .style("font-weight", "bold"); // Optional: set the font weight

////// county ledgend map////////////////
var colorScale2 = d3.scaleQuantile()
    .domain([d3.min(cou_pop.values()), d3.max(cou_pop.values())]) // Assuming 'data' is your dataset
    .range(d3.schemeBlues[9]);

var legendItems2 = colorScale2.range().map((color, i) => {
    // Get the domain value for the color, if available
    var domainValue = colorScale2.invertExtent(color)[0];
    //console.log(domainValue)
    return {
        color: color,
        text: domainValue !== undefined ? `${Math.round(domainValue)}` : '...'
    };
});


// Calculate the width of each legend item (including spacing)
var totalItemWidth = legendItemWidth + legendSpacing;
function formatNumber(num) {
    if (num) {
        return (num / 1000000).toFixed(1);
    } 
}

// Append colored rectangles and text labels
legend.selectAll(".legend-rect1")
.data(legendItems2)
.enter().append("rect")
.attr("class", "legend-rect1")
.attr("x", (d, i) => i * totalItemWidth)
.attr("y", map_height_chart*0.75)
.attr("width", legendItemWidth)
.attr("height", legendItemHeight)
.attr("fill", d => d.color)
.attr("visibility", "hidden");

legend.selectAll(".legend-text1")
    .data(legendItems2)
    .enter().append("text")
    .attr("class", "legend-text1")
    .attr("x", (d, i) => i * totalItemWidth + legendItemWidth ) // Center the text under the rectangle
    .attr("y", legendItemHeight + map_height_chart*0.75 +7) // Position below the line and rectangle
    .text(d => Math.round(formatNumber(d.text)))
    .attr("fill", "black")
    .attr("font-size", 10)
    .attr("text-anchor", "middle") // Center align text
    .attr("alignment-baseline", "hanging")
    .attr("visibility", "hidden");
legend.selectAll(".legend-line1")
    .data(legendItems2)
    .enter().append("line")
    .attr("class", "legend-line1")
    .attr("x1", (d, i) => i * totalItemWidth + legendItemWidth)
    .attr("y1", map_height_chart*0.75)
    .attr("x2", (d, i) => i * totalItemWidth + legendItemWidth)
    .attr("y2", legendItemHeight+map_height_chart*0.75+5)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("visibility", "hidden");

///// Radius ledgend/////////
//radius = d3.scaleSqrt([0, d3.quantile([...data.values()].sort(d3.ascending), 0.985)], [0, 8]);
let radius_legend_x = map_width_chart*0.95
        let radius_legend_y = map_height_chart*0.55

        var radius_legend = svg.selectAll('radius-legend')
            .data([100,500,2000])
            .enter()
            

        radius_legend.append('circle')
        .attr('class', 'radius_legend')
            .attr('cx',radius_legend_x)
            .attr('cy',d=>radius_legend_y-radius(d))
            .attr('r',d=>radius(d))
            .attr('fill','none')
            .attr('stroke','black')
            .attr("visibility", "visible")

        radius_legend.append('line')
        .attr('class', 'radius_legend')
            .attr('x1', function(d){ return radius_legend_x + radius(d) } )
            .attr('x2', radius_legend_x+65)
            .attr('y1', function(d){ return radius_legend_y - radius(d) } )
            .attr('y2', function(d){ return radius_legend_y - radius(d) } )
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))
            .attr("visibility", "visible")

        radius_legend.append('text')
        .attr('class', 'radius_legend')
            .attr('x',radius_legend_x+65)
            .attr('y',d=>radius_legend_y-radius(d))
            .text(d=>d)
            .style('font-size','12px')
            .attr('alignment-baseline','middle')
            .attr('fill','black')
            .attr("visibility", "visible")
            //.attr('stroke', 'black')
        radius_legend.append('text')
            .attr('x', radius_legend_x - 85)
            .attr('y', radius_legend_y + 10) // Adjust this value as needed
            .text("Number of Mental Health Resources") // Modify the text as needed
            .style('font-size', '11px')
            .attr('alignment-baseline', 'hanging')
            .attr('fill','black'); 

///// county ledgend/////////
radius1 = d3.scaleSqrt([0, d3.quantile([...data.values()].sort(d3.ascending), 0.985)], [0, 6]);
var radius_legend1 = svg.selectAll('radius-legend1')
            .data([10,150,500])
            .enter()
            

        radius_legend1.append('circle')
        .attr('class', 'radius_legend1')
            .attr('cx',radius_legend_x)
            .attr('cy',d=>radius_legend_y-radius1(d))
            .attr('r',d=>radius1(d))
            .attr('fill','none')
            .attr('stroke','black')
            .attr("visibility", "hidden")

        radius_legend1.append('line')
        .attr('class', 'radius_legend1')
            .attr('x1', function(d){ return radius_legend_x + radius1(d) } )
            .attr('x2', radius_legend_x+65)
            .attr('y1', function(d){ return radius_legend_y - radius1(d) } )
            .attr('y2', function(d){ return radius_legend_y - radius1(d) } )
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))
            .attr("visibility", "hidden")

        radius_legend1.append('text')
        .attr('class', 'radius_legend1')
            .attr('x',radius_legend_x+65)
            .attr('y',d=>radius_legend_y-radius1(d))
            .text(d=>d/10)
            .style('font-size','12px')
            .attr('alignment-baseline','middle')
            .attr('fill','black')
            .attr("visibility", "hidden")
            //.attr('stroke', 'black')
            var mapTitle = svg.append("text")
            .attr("x", map_width_chart / 2) // Adjust 'width' to be the width of your SVG container
            .attr("y", map_height_chart*0.15) // Adjust this value to place the title appropriately
            .attr("text-anchor", "middle")
            .style("fill","black")
            .style("font-size", "1.6em") // Adjust font size as needed
            .style("font-weight", "bold")
            .text("Mental Health Resource Distribution ");
            var mapTitle = svg.append("text")
            .attr("x", map_width_chart / 2) // Adjust 'width' to be the width of your SVG container
            .attr("y", map_height_chart*0.2) // Adjust this value to place the title appropriately
            .attr("text-anchor", "middle")
            .style("fill","black")
            .style("font-size", "1.6em") // Adjust font size as needed
            .style("font-weight", "bold")
            .text("& Population Density");
// Optionally, adjust the legend group position if needed       
        var validFeatures = topojson.feature(us, us.objects.counties).features
        .filter(d => {
            var centroid = path.centroid(d);
            return !isNaN(centroid[0]) && !isNaN(centroid[1]);
        });     
      
      //path = d3.geoPath()
// Create groups for each state
var stateGroups = svg.selectAll(".state-group")
  .data(topojson.feature(us, us.objects.states).features)
  .enter().append("g")
  .attr("class", "state-group");
      stateGroups.each(function(stateData) {
        //console.log(stateData.id)
        var group = d3.select(this);
      
        // Add state path
        group.append("path")
          .attr("d", path(stateData))
          .attr("class", "state")
          .attr("fill", d => color(pop.get(stateData.id)))
          .attr("stroke", "#ccc") // Initial state border color
          .attr("stroke-width", 1)
          .on("mouseover", function(event, d) {
            tooltip1
                .style("opacity", 1);
            tooltip1.html(`${d.properties.name}: <br/>Resource: ${format(stateSiteCounts.get(d.id)) || 0} <br/>Population: ${format(pop.get(d.id))}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip1.style("opacity", 0);
        })
      ;
          //.on("click", clicked);

          //var totalResources = stateResourceData.get(stateData.id) || 0;
          


      // Add hidden county pop
      group.selectAll(".county")
      .data(validFeatures.filter(county => county.id.startsWith(stateData.id)))
      .enter().append("path")
      .attr("d", path)
      .attr("class", "county")
      .attr("fill", d => color2(cou_pop.get(d.id)))
      .attr("stroke", "white")
      .attr("stroke-width", 0.2)
      .attr("visibility", "hidden")
      .on("mouseover", function(event, d) {
        tooltip1
            .style("opacity", 1);
        tooltip1.html(`${d.properties.name}: <br/>Resource: ${format(data.get(d.id)) || 0} <br/>Population: ${format(cou_pop.get(d.id))}`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
        tooltip1.style("opacity", 0);
    })
      ;
      
      //.text(d => `${d.properties.name}, ${states.get(d.id.slice(0, 2)).name} ${format(cou_pop.get(d.id))}`);
      
        // Add circles
        group.selectAll("circle")
          .data(validFeatures.filter(county => county.id.startsWith(stateData.id)))
          .enter().append("circle")
          .attr("transform", d => `translate(${path.centroid(d)})`)
          .attr("r", d => radius(data.get(d.id)))
          .attr("fill", "#69b3a2")
          .attr("fill-opacity", 0.5)
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.2)
          .attr("class", "county-circle")
          .attr("visibility", "hidden")
          .on("mouseover", function(event, d) {
            tooltip1
                .style("opacity", 1);
            tooltip1.html(`${d.properties.name}: <br/>Resource: ${format(data.get(d.id)) || 0} <br/>Population: ${format(cou_pop.get(d.id))}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip1.style("opacity", 0);
        });
          
      });
      // Draw a bubble on the state
      var validFeatures1 = topojson.feature(us, us.objects.states).features
        .filter(d => {
            var centroid1 = path.centroid(d);
            return !isNaN(centroid1[0]) && !isNaN(centroid1[1]);
        });  
svg.selectAll(".state-circle")
  .data(validFeatures1)
  .enter().append("circle")
  .attr("transform", d => `translate(${path.centroid(d)})`)
  .attr("r", d => radius(stateResourceData.get(d.id) || 0))
  .attr("class", "state-circle")
  .attr("fill", "#69b3a2")
  .attr("fill-opacity", 0.5)
  .attr("stroke", "#fff")
  .attr("stroke-width", 0.5)
  .on("mouseover", function(event, d) {
    tooltip1
        .style("opacity", 1);
    tooltip1.html(`${d.properties.name}: <br/>Resource: ${stateResourceData.get(d.id) || 0} <br/>Population: ${format(pop.get(d.id))}`)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
})
.on("mouseout", function(d) {
    tooltip1.style("opacity", 0);
});

  //var centroid = path.centroid();
          
  // Add state abbreviation text
      svg.selectAll(".state-label")
      .data(validFeatures1)
      .enter().append("text")
          .attr("transform", d => `translate(${path.centroid(d)})`)
          .attr("dy", ".35em")
          .attr("class", "state-label")
          .style("text-anchor", "middle")
          .style("font-size", "10px")
          .style("fill", "black")
          .text(d => stateAbbreviations[d.id])
          //.on("click", clicked);
  
         

// Define the click event handler
function updateMap(selectedState_map) {
    // Define a transition duration
    //var duration = 1000;
    //var stateGroup = d3.select(this.parentNode);
    //var title = "Mental Health Resource Distribution \n& Population Density by County";
    //mapTitle.text(title)
    var stateGroup = svg.selectAll(".state-group").filter(d => d.id === selectedState_map.id);
    
    // Get the bounds of the clicked state and compute a zoom scale
    var width = map_width_chart; // SVG width
  var height = map_height_chart; // SVG height
  // Determine the centroid of the state
  var stateCentroid = path.centroid(selectedState_map);
  // Set a scale factor for enlargement
  var scaleFactor = 5; // Adjust as needed
  var smallStates = ['10', '11', '33','36','50','69'];
  if (selectedState_map.id === '06' || selectedState_map.id === '48') { // Assuming '22' is the state ID
    scaleFactor = 3;
}
if (smallStates.includes(selectedState_map.id)) {
    scaleFactor = 7; 
}
  // Calculate the new centroid position after scaling
  var scaledCentroidX = stateCentroid[0] * scaleFactor;
  var scaledCentroidY = stateCentroid[1] * scaleFactor;

  // Determine the translation needed to move the scaled centroid to the red circle's center
  var translateX = width/2 - scaledCentroidX;
  var translateY = height/2 - scaledCentroidY;

  //console.log(bounds)
  svg.selectAll(".state-circle").attr("visibility", "hidden");
  svg.selectAll(".state-label").attr("visibility", "hidden");
svg.selectAll(".radius_legend").attr("visibility", "hidden");
svg.selectAll(".radius_legend1").attr("visibility", "visible");
svg.selectAll(".legend-rect").attr("visibility", "hidden");
svg.selectAll(".legend-text").attr("visibility", "hidden");
svg.selectAll(".legend-line").attr("visibility", "hidden");
svg.selectAll(".legend-rect1").attr("visibility", "visible");
svg.selectAll(".legend-text1").attr("visibility", "visible");
svg.selectAll(".legend-line1").attr("visibility", "visible");
  stateGroup.transition().duration(500)
        .attr("transform", `translate(${translateX}, ${translateY}) scale(${scaleFactor})`)
        .on("end", () => {
            
            stateGroup.selectAll(".county")
                .attr("visibility", "visible")
                .attr("fill", d => color2(cou_pop.get(d.id))); // Ensure this line is correct
            stateGroup.select(".state").attr("stroke-width", 0);
            svg.selectAll(".county-circle")
                      .attr("visibility", "visible");
    
        });

    svg.selectAll(".state-group").classed("hidden", function(d) { return d.id !== selectedState_map.id; });
  }
  function resetMap() {
    svg.selectAll(".state-group")
        .transition().duration(500)
        .attr("transform", "")
        .on("end", function() { 
            //var title = "Mental Health Resource Distribution & Population Density by States";
            //mapTitle.text(title)
            d3.select('#state-selector').property('value', '');
            // After transition ends, remove hidden class from all state groups
            d3.selectAll(".state-group").classed("hidden", false);
            // Hide all counties
            d3.selectAll(".county").attr("visibility", "hidden");
            d3.selectAll(".county-circle").attr("visibility", "hidden");
            svg.selectAll(".radius_legend").attr("visibility", "visible");
            svg.selectAll(".radius_legend1").attr("visibility", "hidden");
            svg.selectAll(".legend-rect1").attr("visibility", "hidden");
svg.selectAll(".legend-text1").attr("visibility", "hidden");
svg.selectAll(".legend-line1").attr("visibility", "hidden");
svg.selectAll(".legend-rect").attr("visibility", "visible");
svg.selectAll(".legend-text").attr("visibility", "visible");
svg.selectAll(".legend-line").attr("visibility", "visible");
            d3.selectAll(".state-circle")
               .attr("visibility", "visible");
            d3.selectAll(".state-label")
               .attr("visibility", "visible");
        });

    // Reset state border stroke width
    svg.selectAll(".state")
        .attr("stroke-width", 1);

    

    console.log("Map reset completed");
}
var dropdown_map = d3.select('#state-selector');
// Sort the state data alphabetically by state abbreviations
var sortedStateData = topojson.feature(us, us.objects.states).features
    .filter(d => stateAbbreviations[d.id]) // Filter out empty or undefined state abbreviations
    .sort((a, b) => {
        // Compare state abbreviations alphabetically
        var nameA = stateAbbreviations[a.id].toUpperCase(); // Ignore upper and lowercase
        var nameB = stateAbbreviations[b.id].toUpperCase(); // Ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0; // names must be equal
    });
  
    dropdown_map.selectAll('option')
      .data(sortedStateData)
      .enter().append('option')
      .attr('value', d => d.id)
      .text(d => stateAbbreviations[d.id]); // Assuming stateAbbreviations is your state name map
    
    // Dropdown Event Handler
dropdown_map.on('change', function(event) {
    var selectedStateId_map = event.target.value;
    //console.log(selectedStateId_map)
    var selectedState_map = topojson.feature(us, us.objects.states).features.find(d => d.id === selectedStateId_map);
    updateMap(selectedState_map);
  });

document.getElementById('resetButton').addEventListener('click', function() {
    resetMap();
    
});



    });