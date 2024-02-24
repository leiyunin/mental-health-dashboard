var bar_chart = document.getElementById('bar-chart');
var bar_width_chart = bar_chart.clientWidth;
var bar_height_chart = bar_chart.clientHeight;

var promises = [];

promises.push(d3.json("../data/mental_resource/counties-10m.json"));
promises.push(d3.json("../data/mental_resource/All_bubble.json"));
promises.push(d3.csv("../data/mental_resource/id_state_pop.csv"));
promises.push(d3.csv("../data/mental_resource/id_county_pop.csv"));
promises.push(d3.json("../data/mental_resource/stateAbbre.json"));
promises.push(d3.json("../data/mental_resource/Abbr_complete.json"));


Promise.all(promises).then(function (values) {  //use Promise.all to load map and data
    var us_bar = values[0];
    var data1_bar = values[1];
    var pop_bar = values[2];
    var cou_pop_bar = values[3];
    var stateAbbreviations_bar = values[4];
    var complete_state = values[5];

    //create a map to use to map values to marks
    data = new Map(data1_bar.slice(1).map(([Site_Count, state, county]) => [state + county, +Site_Count]))
    var countyNamesMap = new Map();

    topojson.feature(us_bar, us_bar.objects.counties).features.forEach(feature => {

        var fullCountyId = feature.id;
        var countyName = feature.properties.name;


        countyNamesMap.set(fullCountyId, countyName);
    });
    var dataWithName = new Map();

    data.forEach((siteCount, countyCode) => {
        var countyName = countyNamesMap.get(countyCode);
        if (countyName) {
            dataWithName.set(countyName, siteCount);
        }
    });

    //console.log(stateAbbreviations_bar)

    var tooltip = d3.select("#tooltip"); 
    pop_bar = Object.assign(new Map(pop_bar.map((d) => [d.id, +d.population])));
    pop_bar.title = "Population";
    cou_pop_bar = new Map(cou_pop_bar.map(d => [d.id, { state: d.state, population: +d.population }]));
    var countyIdMap = new Map();
    topojson.feature(us_bar, us_bar.objects.counties).features.forEach(feature => {
        var countyId = feature.id;
        var countyName = feature.properties.name;
        countyIdMap.set(countyName, countyId);
    });
    var reverseStateAbbreviations = new Map();
Object.entries(stateAbbreviations_bar).forEach(([id, abbr]) => {
    reverseStateAbbreviations.set(abbr, id);
});

    //cou_pop_bar.title = "Population";
    //console.log(data)
    var stateResourceData = new Map();
    data1_bar.forEach(([siteCount, state, county]) => {
        if (!stateResourceData.has(state)) {
            stateResourceData.set(state, 0);
        }
        stateResourceData.set(state, stateResourceData.get(state) + parseInt(siteCount));
    });

    var margin = { top: 30, right: 20, bottom: 70, left: 80 },
        width_bar = bar_width_chart + 30 - margin.left - margin.right,
        height_bar = bar_height_chart + 50 - margin.top - margin.bottom;
    //console.log(stateResourceData)
    var svg_bar = d3.select("#bar-chart").append("svg")
        .attr("width", width_bar + margin.left + margin.right)
        .attr("height", height_bar + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Convert stateResourceData to an array of objects
    var stateResourceArray = Array.from(stateResourceData, ([stateId, resource]) => {
        return {
            stateId: stateId,
            stateAbbr: stateAbbreviations_bar[stateId],
            resource: resource
        };
    });
    stateResourceArray = stateResourceArray.filter(d => stateAbbreviations_bar[d.stateId]);
    stateResourceArray.sort((a, b) => b.resource - a.resource);

    // X scale
    var x = d3.scaleLinear()
        .domain([0, d3.max(stateResourceArray, d => d.resource)])
        .range([0, width_bar]);

    // Y scale
    var y = d3.scaleBand()
        .range([0, height_bar])
        .domain(stateResourceArray.map(d => d.stateAbbr))
        .padding(.3);

    // Append axes
    svg_bar.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height_bar + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg_bar.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

// Append X-axis title
svg_bar.append("text")
    .attr("x", width_bar / 2) // Position in the middle of the X-axis
    .attr("y", height_bar + margin.bottom - 30) // Position below the X-axis
    .style("text-anchor", "middle") // Center the text alignment
    .text("Resource Ratio per million People"); // The text label for the X-axis

// Append a title text element to the SVG
//var chartTitle = svg_bar.append("text")
  //  .attr("x", width_bar /2) // Center the title
    //.attr("y", -15) // Position it above the chart
   // .style("text-anchor", "middle") // Center align the text
    //.style("font-size", "1em")
    //.style("font-weight", "bold"); // Set the font size
    //.text("Resource Distribution"); // Default title



    // Assuming stateResourceData is a Map with state IDs as keys and resource values as values
    // And assuming stateAbbreviations is a Map with state IDs as keys and abbreviations as values

    var dropdown_bar = d3.select("#state-selector-1");
    var dropdown_bar2 = d3.select("#state-selector-2");
    // Event listener for the state selector
    var sortedStateData_bar = topojson.feature(us_bar, us_bar.objects.states).features
        .filter(d => stateAbbreviations_bar[d.id]) // Filter out empty or undefined state abbreviations
        .sort((a, b) => {
            // Compare state abbreviations alphabetically
            var nameA = stateAbbreviations_bar[a.id].toUpperCase(); // Ignore upper and lowercase
            var nameB = stateAbbreviations_bar[b.id].toUpperCase(); // Ignore upper and lowercase
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0; // names must be equal
        });

    dropdown_bar.selectAll('option')
        .data(sortedStateData_bar)
        .enter().append('option')
        .attr('value', d => d.id)
        .text(d => stateAbbreviations_bar[d.id]); // Assuming stateAbbreviations is your state name map
    dropdown_bar.on("change", function (event) {
        var selectedStateId = event.target.value;
        updateBarChart(selectedStateId);
    });
    dropdown_bar2.selectAll('option')
        .data(sortedStateData_bar)
        .enter().append('option')
        .attr('value', d => d.id)
        .text(d => stateAbbreviations_bar[d.id]); // Assuming stateAbbreviations is your state name map
    dropdown_bar2.on("change", function (event) {
        var selectedStateId = event.target.value;
        updateBarChart(selectedStateId);
    });
    // Event listener for State Selector 1
    d3.select("#state-selector-1").on("change", function () {
        var selectedStateId = d3.select(this).property("value");
        //console.log("Selected State 1 ID22:", selectedStateId);
        updateCountyOptions(selectedStateId, '#county-selector-1');
        //console.log("Selected county 1 ID22:", selectedStateId);
        updateBarChart(selectedStateId); // Assuming this function handles the bar chart update
    });
    d3.select('#county-selector-1').on("change", function (event) {
        var selectedCountyId = event.target.value;
        updateBarChart(selectedCountyId);
    });
    // Initial population of state options and disabling county selector
    d3.select('#county-selector-1').property('disabled', true);
    d3.select("#state-selector-2").on("change", function () {
        var selectedStateId = d3.select(this).property("value");
        updateCountyOptions(selectedStateId, '#county-selector-2');
        updateBarChart(selectedStateId); // Assuming this function handles the bar chart update
    });
    d3.select('#county-selector-2').on("change", function (event) {
        var selectedCountyId = event.target.value;
        updateBarChart(selectedCountyId);
    });
    // Initial population of state options and disabling county selector
    d3.select('#county-selector-2').property('disabled', true);

    function updateBarChart() {
        var selectedStateId1 = d3.select("#state-selector-1").property("value");
        var selectedStateId2 = d3.select("#state-selector-2").property("value");
        var selectedCountyId1 = d3.select("#county-selector-1").property("value");
        var selectedCountyId2 = d3.select("#county-selector-2").property("value");
        var updatedData = [];
        //var title = 'State-wise Mental Health Resource Density';
        //console.log("Selected State 1: ", selectedStateId1);
        //console.log("Selected State 2: ", selectedStateId2);
        //console.log("Selected County 1: ", selectedCountyId1);
        // console.log("Selected County 2: ", selectedCountyId2);
        if (selectedStateId1) {
            if (selectedStateId2) {
                if (selectedCountyId1) {
                    if (selectedCountyId2) {
                        // s1 s2 c1 c2
                        updatedData = [];
                        //title = "Resources Density Comparison of Counties";

                        // Process each selected county ID
                        [selectedCountyId1, selectedCountyId2].forEach(countyId => {
                            if (countyId) {
                                // Assuming 'data' is a Map with countyId as key
                                var siteCount = data.get(countyId) || 0;
                                var countyName = countyNamesMap.get(countyId);

                                // If county name exists, add the data to updatedData
                                if (countyName) {
                                    updatedData.push({ county: countyName, resource: siteCount });
                                }
                            }
                        });

                        //y.domain(updatedData.map(d => d.county))
                    } else {
                        // s1 s2 c1
                        
                        updatedData = [];
                        var siteCount = data.get(selectedCountyId1) || 0;
                        var countyName = countyNamesMap.get(selectedCountyId1);
                        if (countyName) {
                            updatedData.push({ county: countyName, resource: siteCount });
                        }
                        //title = "Resources Density of County ";
                    }
                    //y.domain(updatedData.map(d => d.county))
                } else {
                    // state 1 and state 2
                    //title = "Resources Density Comparison of States";
                    updatedData = [];
                    [selectedStateId1, selectedStateId2].forEach(stateId => {
                        var resource = stateResourceData.get(stateId) || 0;
                        var stateAbbr = stateAbbreviations_bar[stateId];
                        if (stateAbbr) {
                            updatedData.push({ stateAbbr: stateAbbr, resource: resource });

                        }
                    });
                    //console.log(updatedData)
                    //y.domain(updatedData.map(d => d.stateAbbr));
                }
            } else if (selectedCountyId1) {
                // s1 c1 
                //title = "Resource Density of County";
                //updatedData = [];
                        var siteCount = data.get(selectedCountyId1) || 0;
                        var countyName = countyNamesMap.get(selectedCountyId1);
                        if (countyName) {
                            updatedData.push({ county: countyName, resource: siteCount });
                        }

            }
            else {
                // only state 1
                //title = "County-wise Mental Health Resource Density";
                updatedData = Array.from(data)
                    .filter(([key, _]) => key.startsWith(selectedStateId1))
                    .map(([key, siteCount]) => {
                        var countyName = countyNamesMap.get(key);
                        return { county: countyName, resource: siteCount };
                    })
                    .filter(d => d.county);
                    
            }
        } else {
            // Use default data set (all states)
            updatedData = Array.from(stateResourceData, ([stateId, resource]) => ({
                stateId: stateId,
                stateAbbr: stateAbbreviations_bar[stateId],
                resource: resource
            })).filter(d => d.stateAbbr);
            //updatedData.sort((a, b) => b.resource - a.resource);
            //y.domain(updatedData.map(d => d.stateAbbr));
        }

        updatedData = updatedData.map(function (d) {
            let population;
            let resourcesPerThousand;
        
            if (d.stateId) {
                population = pop_bar.get(d.stateId);
                resourcesPerThousand = (d.resource / population) * 1000000;
            } else if (d.county) {
                let countyId = countyIdMap.get(d.county);
                if (countyId) {
                    let countyData = cou_pop_bar.get(countyId);
                    if (countyData) {
                        population = countyData.population;
                        resourcesPerThousand = (d.resource / population) * 1000000;
                    }
                }
            } else if (d.stateAbbr) {
                let stateId = reverseStateAbbreviations.get(d.stateAbbr);
                if (stateId) {
                    population = pop_bar.get(stateId);
                    resourcesPerThousand = (d.resource / population) * 1000000;
                }
            }
            
            return {
                ...d,
                population: population,
                resourcePerPop: resourcesPerThousand
            };
        });
        updatedData.sort((a, b) => b.resourcePerPop - a.resourcePerPop);
        //console.log(complete_state['AL'])
        //chartTitle.text(title);
        // Update scales
        x.domain([0, d3.max(updatedData, d => d.resourcePerPop)]);
        //x.domain([0, d3.max(updatedData, d => d.resource)]);
        y.domain(updatedData.map(d => d.stateAbbr || d.county));
        //updatedData.sort((a, b) => b.resource - a.resource);
        // Bind the updated data to the bars
        var bars = svg_bar.selectAll("rect")
            .data(updatedData, d => d.stateId || d.county);

        // Exit selection: remove old bars
        bars.exit().transition().duration(750)
            .attr("width", 0)
            .remove();

        // Enter selection: new bars
        var newBar = bars.enter().append("rect")
            .attr("x", x(0))
            .attr("y", d => y(d.stateAbbr || d.county))
            .attr("width", 0)
            .attr("fill", "#69b3a2")
            
        bars.merge(newBar) // Update + Enter selection
            .transition().duration(750)
            .attr("y", d => y(d.stateAbbr || d.county))
            .attr("height", function (d) {return y.bandwidth(); })
            .attr("width", d => x(d.resourcePerPop))
        bars.merge(newBar)
        .on("mouseover", function (event, d) {
            let tooltipContent = `<strong>${complete_state[d.stateAbbr] || d.county}</strong><br>`;
            let resourcesPerThousand;
            let population;
                if (d.stateId) {
                    population = pop_bar.get(d.stateId);
                    resourcesPerThousand = (d.resource / population) * 1000000;
                } else if (d.county) {
                    let countyId = countyIdMap.get(d.county);
                    if (countyId) {
                        let countyData = cou_pop_bar.get(countyId);
                        if (countyData) {
                            population = countyData.population;
                            resourcesPerThousand = (d.resource / population) * 1000000;
                            
                        }
                    }
                } else if (d.stateAbbr) {
                    let stateId = reverseStateAbbreviations.get(d.stateAbbr);
                    if (stateId) {
                        population = pop_bar.get(stateId);
                        resourcesPerThousand = (d.resource / population) * 1000000;
                        
                    }
                }
                tooltipContent += `Resources: <strong>${d.resource}</strong><br>`;
                tooltipContent += `Population: <strong>${population}</strong><br>`;
                tooltipContent += `Resources per 1 million People: <strong>${resourcesPerThousand.toFixed(2)}</strong>`;

                tooltip.html(tooltipContent)
            .style("opacity", 1)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
        tooltip.style("opacity", 0);
    });

        // Update selection: update existing bars
        // bars.transition().duration(750)
        //     .attr("y", d => y(d.stateAbbr || d.county))
        //     .attr("width", d => x(d.resource));
        // Update axes
        svg_bar.select(".x-axis")
            .transition().duration(750)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        svg_bar.select(".y-axis")
            .transition().duration(750)
            .call(d3.axisLeft(y));
    }

    // Initially draw the bar chart with all data
    updateBarChart();

    ///////////// County Selector ////////////// 

    // Function to update county options based on selected state
    function updateCountyOptions(selectedStateId, countySelectorId) {
        var countySelector = d3.select(countySelectorId);
        countySelector.html(""); // Clear existing options

        if (selectedStateId) {
            var counties = topojson.feature(us_bar, us_bar.objects.counties).features
                .filter(d => d.id.startsWith(selectedStateId))
                .map(d => ({ id: d.id, name: d.properties.name }));

            // Add default option
            countySelector.append('option')
                .attr('value', '')
                .text('Select a County');

            // Add new options
            counties.forEach(county => {
                countySelector.append('option')
                    .attr('value', county.id)
                    .text(county.name);
            });

            countySelector.property('disabled', false); // Enable the selector
        } else {
            countySelector.property('disabled', true); // Disable the selector if no state is selected
        }
    }



});