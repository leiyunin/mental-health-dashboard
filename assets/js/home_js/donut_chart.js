// Set color scheme


    const color = d3.scaleOrdinal(d3.range(7).map(t => d3.interpolateRgb('#2e59c6', '#193373')(t / 6)));

      // Set data format
      var currencyformat = d3.format("$,.0f");
      var numberformat = d3.format(",.0f");
      var percentformat = d3.format(".1%");
  
      d3.csv('../data/home/donut_data.csv', d => {
          d.Percentage = +d.Percentage;
          return d;
      }).then(data => {
          data.forEach((d, index) => {

              // var containerWidth = document.querySelector('.line_chart').clientWidth;
              // var svg = d3.select('.line_chart').append('svg')
              //   .attr('font-family', 'Inter')
              //   .attr('width', containerWidth)  // 根据容器宽度设置SVG宽度
              //   .attr('height', containerWidth) // 使用相同的高度以保持等比例缩放
              //   .attr('viewBox', `0 0 ${containerWidth} ${containerWidth}`); // 设置viewBox属性
              var svg = d3.select('#donut_chart').append('svg')
                  .attr('font-family', 'Inter')
                  .attr('width', 155)
                  .attr('height', 155);
  
              var width = +svg.attr('width'),
                  height = +svg.attr('height'),
                  radius = Math.min(width, height) / 2,
                  g = svg.append('g')
                      .attr('transform', 'translate(' + width / 2 + ',' + height / 2  + ')');
  
              var pie = d3.pie()
                  .sort(null)
                  .sortValues(d3.descending);
  
              var path = d3.arc()
                  .outerRadius(radius)
                  .innerRadius(radius - 36);
  
              var label = d3.arc()
                  .outerRadius(radius - 36)
                  .innerRadius(radius);
  
              var arc = g.selectAll('.arc')
                  .data(pie([d.Percentage, 1 - d.Percentage]))
                  .enter()
                  .append('g')
                  .attr('class', 'arc');
  
              arc.append('path')
                  .attr('d', path)
                  .attr('fill', (d, i) => i === 0 ? color(index) : '#eeeeee');
  
              arc.append('text')
                  .attr('transform', d => 'translate(' + label.centroid(d) + ')')
                  .text(d => d.data <= 0 ? '' : percentformat(d.data))
                  .style('font-family', 'Inter')
                  .style('font-weight', '400')
                  .style('fill', (d, i) => i === 0 ? '#ffffff' : '#505050')
                  .attr('text-anchor', 'middle');
  
              svg.append('text')
                  .attr('transform', `translate(${width / 2}, ${height / 2.2})`)
                  .attr('text-anchor', 'middle')
                  .style('font-family', 'Inter')
                  .style('font-weight', 700)
                  .style('font-size', '0.95em')
                  .style('fill', color(index))
                  .text(d.Race)
  
              svg.append('text')
                  .attr('transform', `translate(${width / 2}, ${height / 1.6})`)
                  .attr('text-anchor', 'middle')
                  .style('font-family', 'Bebas Neue')
                  .style('font-size', '1.8em')
                  .style('font-weight', 700)
                  .style('fill', color(index))
                  .text(percentformat(d.Percentage));
  
          });
      });