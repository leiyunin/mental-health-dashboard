// Set color scheme
var color_palette = ['#2a418f','#7bb1ea'];
// Set data format

  d3.csv("../data/home/donut_data.csv").then(function (data) {
    console.log(data)
  // Combine data for Female and Male
  const combinedData = [];
  data.forEach(d => {
      combinedData.push({ Gender: "Female", Country: d.Country, CountryID: d.CountryID, Year: d.Year, GNIPerCapita: d.FemaleGNIPerCapita });
      combinedData.push({ Gender: "Male", Country: d.Country, CountryID: d.CountryID, Year: d.Year, GNIPerCapita: d.MaleGNIPerCapita });
  });

  var svg = d3.select('#bar_chart').append('svg')
  .attr('width', 500)
  .attr('height', 300)
  .attr('viewBox', `0 0 500 300`)
  .attr('font-family', 'Inter')
  .attr("font-size", "14px");

  var height = svg.attr("height");
  var width = svg.attr("width");
  var margin = {top: 0, right: 0, bottom: 0, left: 60}


  var  xM = d3.scaleLinear()
.domain([0, d3.max(combinedData, d => d.GNIPerCapita)])
.rangeRound([width / 2, margin.left])

var xF = d3.scaleLinear()
.domain(xM.domain())
.rangeRound([width / 2, width - margin.right])

var y = d3.scaleBand()
.domain(combinedData.map(d => d.Country))
.rangeRound([height - margin.bottom, margin.top])
.padding(0.1)

var xAxis = g => g
.attr("transform", `translate(0,${height - margin.bottom})`)
.call(g => g.append("g").call(d3.axisBottom(xM).ticks(width / 80, "s")))
.call(g => g.append("g").call(d3.axisBottom(xF).ticks(width / 80, "s")))
.call(g => g.selectAll(".domain").remove())
.call(g => g.selectAll(".tick:first-of-type").remove())
.call(g => g.selectAll(".tick text")
.attr("font-family", "Inter")
.attr("font-weight", "400")
.attr("font-size", "12px"))


var yAxis = g => g
.attr("transform", `translate(${xM(0)},0)`)
.call(d3.axisLeft(y).tickSizeOuter(0))
.call(g => g.selectAll(".tick text")
.attr("fill", "white")
.attr("font-family", "Inter")
.attr("font-weight", "700")
.attr("font-size", "12px"))


svg.append("g")
.selectAll("rect")
.data(combinedData)
.join("rect")
.attr("fill", d => color_palette[d.Gender === "Male" ? 1 : 0])
.attr("x", d => d.Gender === "Male" ? xM(d.GNIPerCapita) : xF(0))
.attr("y", d => y(d.Country))
.attr("width", d => d.Gender === "Male" ? xM(0) - xM(d.GNIPerCapita) : xF(d.GNIPerCapita) - xF(0))
.attr("height", y.bandwidth());

svg.append("g")
.attr("fill", "white")
.selectAll("text")
.data(combinedData)
.join("text")
.attr("text-anchor", d => d.Gender === "Male" ? "start" : "end")
.attr("x", d => d.Gender === "Male" ? xM(d.GNIPerCapita) - 56 : xF(d.GNIPerCapita) + 56)
.attr("fill", d => color_palette[d.Gender === "Male" ? 1 : 0])
.attr("font-weight", "400")
.attr("y", d => y(d.Country) + y.bandwidth() / 2 - 10)
.attr("dy", "1.2em")
.text(d => d3.format("0,.0f")(d.GNIPerCapita));

svg.append("text")
.attr("text-anchor", "end")
.attr("fill", "#202020")
.attr("dy", "12px")
.attr("x", xM(0) - 45)
.attr("y", y(combinedData[0].Country) + y.bandwidth() / 2 + 10)
.text("Youth")
.attr("font-size", "12px");

svg.append("text")
.attr("text-anchor", "start")
.attr("fill", "#202020")
.attr("dy", "12px")
.attr("x", xF(0) + 2)
.attr("y", y(combinedData[0].Country) + y.bandwidth() / 2 + 10)
.text("Adults")
.attr("font-size", "12px");

svg.append("g")
.call(xAxis);

svg.append("g")
.call(yAxis);

    });