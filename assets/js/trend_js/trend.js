// 画折线图
function line(id, data, timelines, line_items, color) {
  // 初始化svg的属性
  let x_dimension = "Week";
  const div = d3.select(`#${id}`);
  const width = div.node().getBoundingClientRect().width;
  const height = div.node().getBoundingClientRect().height*0.9;
  const margin = { left: 50, right: 130, top: 60, bottom: 40 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const svg = div
    .selectAll("svg")
    .data([0])
    .join("svg")
    .attr("width", width)
    .attr("height", height)
    .style("font-family", "Inter");
  svg.selectAll("*").remove();

  // area to draw
  const ChartArea = svg
    .append("g")
    .attr("id", "chartarea")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  // x轴和y轴标签和坐标轴
  const AxisYLeft = ChartArea.append("g");
  const AxisX = ChartArea.append("g").attr(
    "transform",
    `translate(0,${innerH})`
  );

  ChartArea.selectAll(".x_label")
    .data([0])
    .join("text")
    .attr("class", "x_label")
    .attr("transform", `translate(${innerW / 2},${innerH + 30})`)
    .text(x_dimension);
  // y1 label
  ChartArea.selectAll(".y_label")
    .data([0])
    .join("text")
    .attr("class", "y_label")
    .attr("transform", ` translate(10,0) rotate(90)`)
    .text("Value");
// tips
  //提示框的方法
  const tips_show = (e, d, html) => {
    d3.select(".d3-tip")
      .style("display", "block")
      .style("position", "absolute")
      .style("top", `${e.pageY + 10}px`)
      .style("left", `${e.pageX + 10}px`)
      .html(html);
  };
  
  const tips_hide = () => {
    d3.select(".d3-tip").style("display", "none");
  };
  // 在初始化函数的顶部定义一个虚线元素
  const verticalLine = ChartArea.append("line")
    .attr("class", "myline")
    .style("display", "none") // 初始时隐藏虚线
    .attr("stroke", "gray")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", 3);

  // 修改鼠标悬停事件处理函数
  const show_line = (e, d) => {
    verticalLine
      .style("display", "block")
      .attr("x1", x(new Date(d[x_dimension])))
      .attr("x2", x(new Date(d[x_dimension])))
      .attr("y1", 0)
      .attr("y2", innerH);
    tips_show(e, d, html); // 显示提示框
  };

  // 修改鼠标移出事件处理函数
  const hide_line = () => {
    verticalLine.style("display", "none"); // 隐藏虚线
    tips_hide(); // 隐藏提示框
  };


  // 比例尺x y  和颜色
  const x_values = d3.extent(data, (d) => new Date(d[x_dimension]));
  const x = d3.scaleUtc().domain(x_values).range([0, innerW]);
  const y = d3.scaleLinear().domain([0, 100]).range([innerH, 0]);

  let types = [...new Set(timelines.map((d) => d.type))];
  let type_color = d3.scaleOrdinal().domain(types).range(d3.schemeAccent);
  //    axis
  AxisX.call(d3.axisBottom(x));
  AxisYLeft.call(d3.axisLeft(y));

  /*
  // 添加水平网格线 但不好看
  const yAxisGrid = d3.axisLeft(y)
  .tickSize(-innerW) // 横跨整个图表宽度的刻度线
  .tickFormat('')   // 不显示刻度线的文本

  ChartArea.append('g')
  .attr('class', 'grid')
  .call(yAxisGrid)
  .selectAll('.tick line')
  .attr('stroke', 'grey')  // 设置网格线颜色为灰色
  .attr('stroke-opacity', 0.2); // 设置网格线透明度为50%
  */

 // 创建一个包含所有折线的元素
const linesGroup = ChartArea.append("g");

// 循环系列画线
line_items.forEach((item) => {
  // 折线生成器
  const linegenerator = d3.line()
    .x((d) => x(new Date(d[x_dimension])))
    .y((d) => y(+d[item]));

    // 创建折线路径
    const linePath = linesGroup.append("path")
        .datum(data)
        .attr("d", linegenerator)
        .attr("fill", "none")
        .attr("stroke", color(item))
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.6) // 设置透明度为0.5
        .attr("stroke-dasharray", function () {
            const length = this.getTotalLength();
            return length + " " + length;
        })
        .attr("stroke-dashoffset", function () {
            return this.getTotalLength();
        });

  // 添加出现的动画效果
  linePath.transition()
    .duration(1000) // 动画持续时间（毫秒）
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

  // 画折线圆点
  let circles = ChartArea.selectAll(`.circle-${item}`).data(data).join("circle");

  circles
    .attr("cx", (d) => x(new Date(d[x_dimension])))
    .attr("cy", (d) => y(+d[item]))
    .attr("r", 12) // 可以调整圆点大小
    .attr("fill", color(item))
    .attr("class", `circle-${item}`)
    .attr("opacity", 0); // 设置不透明度，使圆点可见

  // 圆点的事件
  circles
  .on("mouseenter", (e, d) => {
    // 创建包含关键词和值的数组
    let keyValuePairs = line_items.map(item => ({ key: item, value: d[item] }));

    // 按照值从大到小排序
    keyValuePairs.sort((a, b) => b.value - a.value);

    // 构建工具提示的 HTML 字符串
    let html = `<div>${x_dimension}: ${d[x_dimension]}</div>`;
    keyValuePairs.forEach(pair => {
      let colorString = color(pair.key); // 获取对应的颜色
      html += `<div>${pair.key}: <span style="color: ${colorString}; font-weight: bold;">${pair.value}</span></div>`;
    });
    tips_show(e, d, html);
    show_line(e, d);
  })
  .on("mouseout", () => {
    tips_hide();
    hide_line();
  });

});


  // 创建折线图图例容器
const legend = svg.append('g')
.attr('class', 'legend')
.attr('transform', `translate(${innerW + margin.right / 2 -10}, ${margin.top})`);

// 添加图例条目
line_items.forEach((item, index) => {
  const legendItem = legend.append('g')
          .attr('transform', `translate(0, ${index * 20})`); // 调整这里的 20 以更改图例条目之间的间距

// 添加图例颜色块或符号
legendItem.append('rect')
.attr('width', 15)
.attr('height', 3)
.attr('y', 5) // 调整位置以使其居中
.attr('fill', color(item))
.attr('opacity', 0.5); // 使用与线条相同的颜色

// 添加图例文本
legendItem.append('text')
.attr('x', 25) // 根据需要调整文本的位置
.attr('y', 10) // 对齐文本与符号
.text(item) // 显示数据系列的名称
.style('font-size',"15px")
.style('font-family', 'Inter');
});

  //  画时间轴的区域
  let timelines_G = ChartArea.append("g").attr(
    "transform",
    `translate(0,${innerH + margin.bottom / 2})`
  );

  let timelines_G_legend = ChartArea.append("g").attr(
    "transform",
    `translate(10,${innerH + margin.bottom / 2 })`
  );

  timelines_G_legend
  .append("text")
  .attr("x", -30) 
  .attr("y", 15) 
  .text("Event Type:")
  .style('font-family', 'Inter');

  // add legend color
  let legend_circles = timelines_G_legend
    .selectAll("circles")
    .data(types)
    .join("circle");
    
  let legend_text = timelines_G_legend
    .selectAll("texts")
    .data(types)
    .join("text");

  legend_text
    .attr("x", (d, i) => i * 97 + 80)
    .attr("y", 16)
    .text((d) => d);
  legend_circles
    .attr("cx", (d, i) => i * 97 + 70)
    .attr("cy", 10)
    .attr("r", 9)
    .attr("fill", (d) => type_color(d))
    .attr("stroke", "#606060") // 设置描边为深灰色
    .attr("stroke-width", 2); // 可以调整描边宽度


  // ...之前的图例代码...

  // 添加图例符号
  let legend_symbols = timelines_G_legend
  .selectAll(".legendSymbol")
  .data(types)
  .join("text")
  .attr("x", (d, i) => i * 98 + 75) // 调整位置
  .attr("y", 16)
  .attr("text-anchor", "end") // 文本右对齐
  .attr("font-size", "18px") // 设置字体大小
  .attr("fill", "white") // 设置文本颜色为白色
  .text((d) => {
      if (d === "Policy") {
          return "★"; // 实心星星
      } else if (d === "Action") {
          return "⚑"; // 旗帜
      } else if (d === "Advocacy") {
          return "♥    "; // 实心心形
      }
      return ""; // 如果没有匹配的类型，则不显示符号
  });

  
  // 画事件时间轴的圆点
  // 判断是否是重复的时间
  const get_repeat_times = (date) => {
    let value = timelines.find((d) => {
      if (d3.timeDay.count(new Date(d.time), date) === 0) {
        d.found = true;
      }
    });

    return arr.length;
  };
  let time_circles = timelines_G
    .selectAll("mycircle")
    .data(timelines)
    .join("circle");

    time_circles
    .attr("cx", (d) => x(new Date(d.time)))
    .attr("cy", (d) => -20)
    .attr("r", 9)
    .attr("stroke", "#606060")
    .attr("stroke-width", 2)
    .attr("fill", (d) => type_color(d.type));

    // 添加文本标签
  let time_labels = timelines_G
  .selectAll(".myLabel")
  .data(timelines)
  .join("text")
  .attr("x", (d) => x(new Date(d.time)))
  .attr("y", (d) => -15) // 调整y坐标以使文本居中
  .attr("text-anchor", "middle") // 使文本居中对齐
  .attr("font-size", "16px") // 设置字体大小
  .attr("fill", "white") // 设置文本颜色为白色
  .text((d) => {
      if (d.type === "Policy") {
          return "★"; // 实心星星
      } else if (d.type === "Action") {
          return "⚑"; // 旗帜
      } else if (d.type === "Advocacy") {
          return "♥"; // 实心心形
      }
      return ""; // 如果没有匹配的类型，则不显示符号
  })
  .style("cursor", "pointer") // 同样设置为手形光标
  .style('font-family', 'Inter');

  // 圆点的鼠标点击事件
  function handleClick(e, d) {
    if (d.clicked) {
      tips_hide();
    } else {
      let html = ` 
        <p class="popup-paragraph">Time: ${d.time} </p>
        <p class="popup-paragraph">Content: ${d.event} </p>
        <p class="popup-paragraph">Link: <a href="${d.link}" target="_blank">${d.link} </a></p>
      `;
      tips_show(e, d, html);
      get_background_color(d, type_color);
    }
    d.clicked = !d.clicked;
  }
  
  // 绑定点击事件到圆点
  time_circles.on("click", handleClick);
  
  // 绑定相同的点击事件到文本标签
  time_labels.on("click", handleClick);

  // 画两条线标志疫情开始和结束
  let dates = [new Date("2020-1-20"), new Date("2023-5-11")];
  dates.forEach((d, i) => {
    ChartArea.append("line")
      .attr("x1", x(d))
      .attr("x2", x(d))
      .attr("y1", 0)
      .attr("y2", innerH)
      .attr("stroke", "gray")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", 3);
    ChartArea.append("text")
      .attr("x", x(d))
      .attr("y", innerH-20 )
      .text(i === 0 ? "start of COVID19" : "end of COVID19")
      .attr("font-size", 12);
  });
}

// 添加筛选器的函数
function add_filter({ div, optionsList, changeEvent, top, right, label }) {
  div.style("position", "relative");
  div.attr("class", "form-group row");
  let select_div = div.append("div");
  select_div
    .style("position", "absolute")
    .style("top", top + "px")
    .style("right", right + "px");
  select_div.append("label").html(label);
  let select = select_div.append("select");
  // multiple="multiple" class="select"
  select.attr("multiple", "multiple").attr("size", 2).attr("class", "select");
  let options = select.selectAll("option").data(optionsList).join("option");
  options
    .attr("value", (d) => d)
    .html((d) => d)
    .attr("class", (d) => d);
  // select_div.on("change", changeEvent);

  let select_value = [];
  // https://multiple-select.wenzhixin.net.cn/docs/en/events#oncheckall
  $("select").multipleSelect({
    onClick: function (view) {
      if (view.selected) {
        select_value.push(view.text);
      } else {
        select_value = new Set(select_value);
        select_value.delete(view.text);
        select_value = [...select_value];
      }
      changeEvent(select_value);
    },
    onCheckAll: function (view) {
      select_value = optionsList;
      changeEvent(select_value);
    },
    onUncheckAll: function () {
      select_value = [];
      changeEvent(select_value);
    },
  });
    // 设置默认选中项为 "anxiety"
    $('select').multipleSelect('setSelects', ['anxiety', 'depression', 'medication']);
    select_value = ['anxiety', 'depression', 'medication']; // 更新select_value数组
    changeEvent(select_value); // 调用changeEvent以更新图表
    
  return select_div;
}
// 添加日期控件的函数
function add_input({
  div,
  type,
  changeEvent,
  top,
  right,
  label,
  value,
  min,
  max,
}) {
  div.style("position", "relative");
  let input_div = div.append("div");
  input_div
    .style("position", "absolute")
    .style("top", top + "px")
    .style("right", right + "px");
  input_div.append("label").html(label);
  let input_ctrl = input_div
    .append("input")
    .attr("type", type)
    .attr("value", value)
    .attr("max", max)
    .attr("min", min);
  input_ctrl.on("change", changeEvent);
  return input_div;
}

// 画柱状图
function drawBarChart(data, selectedKeywords, divId, timeRanges,color) {
  // data 是原始数据，selectedKeywords 是用户选择的关键词数组
  // timeRanges 是一个包含时间范围的数组，例如：[['2020-01-01', '2020-01-30'], ['2020-01-31', '2023-05-23'], ...]
  const parentDiv = d3.select(`#${divId}`);
  parentDiv.selectAll(".bar-chart-container").remove();

  const width = parentDiv.node().getBoundingClientRect().width / timeRanges.length -50; // 将父级 DIV 的宽度平均分配给每个柱状图
  const height = 160; // 设置柱状图的高度
  const margin = { top: 20, right: 10, bottom: 50, left: 40 };

  // 标题数组
  const titles = ["Before COVID-19", "During COVID-19", "After COVID-19"];
  
  // 为每个时间范围创建一个子 DIV 和 SVG 容器
  timeRanges.forEach((range, index) => {
    const barDiv = parentDiv.append("div")
                           .attr("class", "bar-chart-container")
                           .style("width", `${width}px`)
                           .style("display", "inline-block"); // 使子 DIV 并排显示
                           
    const svg = barDiv.append("svg")
                      .attr("width", width)
                      .attr("height", height)
                      .append("g")
                      .attr("transform", `translate(${margin.left}, ${margin.top})`);

   /*检查
    // 打印原始数据的一部分以检查格式
    console.log("Sample Data:", data.slice(0, 5));
    // 假设您的时间范围是这样的
    let timeRange = ['2018/11/25', '2019/1/6']; // 根据需要调整
    // 打印出过滤条件
    console.log("Filtering from:", timeRange[0], "to:", timeRange[1]);
  */
    // 过滤数据
    const filteredData = data.filter(d => new Date(d.Week) >= new Date(range[0]) && new Date(d.Week) <= new Date(range[1]));
    //console.log("Data:", data);
    //console.log("Filtered Data:", filteredData);

    // 计算每个关键词的总量或平均值
    let keywordValues = selectedKeywords.map(keyword => {
      return {
        keyword: keyword,
        value: d3.mean(filteredData, d => +d[keyword]) // 或使用 d3.mean，取决于您的数据性质
      };
    });
    //console.log("Keyword Values:", keywordValues);

    // 定义 X 轴和 Y 轴比例尺
    const x = d3.scaleBand()
                .range([0, width - margin.left - margin.right])
                .padding(0.1)
                .domain(selectedKeywords);
    const y = d3.scaleLinear()
                .range([height - margin.top - margin.bottom, 0])
                .domain([0, 100]);
                //.domain([0, d3.max(keywordValues, d => d.value)]);

     // 添加标题
    svg.append("text")
     .attr("x", width / 2 -30)
     .attr("y", margin.top / 2 -10)
     .attr("text-anchor", "middle")
     .text(titles[index]);
// 绘制柱状图
svg.selectAll(".bar")
   .data(keywordValues)
   .enter().append("rect")
   .attr("class", "bar")
   .attr("x", d => x(d.keyword))
   .attr("width", x.bandwidth())
   .attr('opacity', 0.6)
   .attr("y", height - margin.top - margin.bottom) // 初始位置在底部
   .attr("height", 0) // 初始高度为0
   .attr("fill", d => {
        const fillColor = color(d.keyword);
        return fillColor;
   })
   .on('mouseenter', function (e, d) {
        // 显示提示信息
        d3.select('.d3-tip')
          .style('display', 'block')
          .style('left', `${e.pageX}px`)
          .style('top', `${e.pageY}px`)
          .style('background-color', 'white')
          .style('border', 'none')
          .html(`Average value: ${d.value.toFixed(2)}`);
   })
   .on('mouseout', function () {
        // 隐藏提示信息
        d3.select('.d3-tip').style('display', 'none');
   })
   .transition() // 添加动画效果
   .duration(1000) // 动画持续时间（毫秒）
   .attr("y", d => y(d.value)) // 最终位置
   .attr("height", d => height - margin.top - margin.bottom - y(d.value)); // 最终高度

   
    // 计算柱状图的种类数量
    const numCategories = keywordValues.length;

    if (numCategories > 5) {
      // 如果柱子的数量大于5个，旋转x轴标签
      svg.append("g")
         .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
         .call(d3.axisBottom(x))
         .selectAll("text")
         .style("text-anchor", "end")
         .style("font-size","9px")
         .attr("dx", "-.8em")
         .attr("dy", ".15em")
         .attr("transform", "rotate(-45)");
    } else {
      // 如果柱子的数量不多于5个，执行其他操作
      svg.append("g")
         .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
         .call(d3.axisBottom(x));
    }

    // 添加 X 轴和 Y 轴
    svg.append("g")
       .call(d3.axisLeft(y).tickValues([0, 20, 40, 60, 80, 100]));
    svg.append("text")
       .attr("class", "y_label")
       .attr("transform", `translate(${margin.left / 2 - 15},${height / 2 - 80}) rotate(90)`) // 旋转并调整位置
       .style("text-anchor", "middle")
       .style("font-size","11px")
       .text("Average"); // Y 轴标题文本
      
  });

  

}

// 初始化函数
async function init() {
  // 获取数据
  let line_data = await d3.csv("../data/mental_trend/line_chart.csv");
  let time_data = await d3.csv("../data/mental_trend/timeline.csv");

  //   初始化 相关的变量值
  let line_items = [
    "anxiety",
    "counseling",
    "depression",
    "medication",
    "meditation",
    "mental health",
    "panic",
    "therapist",
    "trauma",
    "stress",
  ];
  d3.select("body")
    .append("div")
    .style("display", "none")
    .attr("position", "absolute")
    .attr("class", "d3-tip");
 
    // 颜色比例尺，改折线和柱状图颜色在这里改
    const colors = [
      "#002FA7", // 克莱因蓝
      "#3498db", // 鲜艳的蓝色
      "#2ecc71", // 明亮的绿色
      "#f1c40f", // 鲜艳的黄色
      "#9b59b6", // 淡紫色
      "#e67e22", // 橙褐色
      "#fd79a8", // 柔和的粉红色
      "#34495e", // 深蓝/灰色
      "#5ca08e", // 青绿色
      "#7f8c8d", // 暗灰色
  ];
  
  

  const color = d3.scaleOrdinal().domain(line_items).range(colors);
  let from_date = d3.min(line_data, (d) => new Date(d.Week));
  let to_date = d3.max(line_data, (d) => new Date(d.Week));
  time_data = time_data.filter(
    (d) => new Date(d.time) >= from_date && new Date(d.time) <= to_date
  );
  let filtered_list = ["anxiety"];
  let filter_data = [...line_data];
  //   调用画线函数
  type_selected(["anxiety"]);
  //添加筛选器和日期输入
  add_filter({
    div: d3.select("#line"),
    optionsList: line_items,
    changeEvent: type_selected,
    top: 20,
    right: 600,
    label: "Select keywords:",
    //selected: "anxiety" // 添加这一行来设置默认值
  })
  .select("label") // 选择筛选器的标签元素
  .style("font-family", "Inter");

  add_input({
    div: d3.select("#line"),
    type: "date",
    changeEvent: from_date_change,
    top: 20,
    right: 300,
    label: "From:",
    value: d3.timeFormat("%Y-%m-%d")(from_date),
    min: d3.timeFormat("%Y-%m-%d")(d3.min(line_data, (d) => new Date(d.Week))),
    max: d3.timeFormat("%Y-%m-%d")(d3.max(line_data, (d) => new Date(d.Week))),
  })
  .select("label") // 选择筛选器的标签元素
  .style("font-family", "Inter");
  add_input({
    div: d3.select("#line"),
    type: "date",
    changeEvent: to_date_change,
    top: 20,
    right: 150,
    label: "To:",
    value: d3.timeFormat("%Y-%m-%d")(to_date),
    min: d3.timeFormat("%Y-%m-%d")(d3.min(line_data, (d) => new Date(d.Week))),
    max: d3.timeFormat("%Y-%m-%d")(d3.max(line_data, (d) => new Date(d.Week))),
  })
  .select("label") // 选择筛选器的标签元素
  .style("font-family", "Inter");

  // 添加日期和多选框的变化事件,重画折线
  function type_selected(seleted_items) {
    line("line", filter_data, time_data, seleted_items, color);

    drawBarChart(filter_data, seleted_items, "barChartDiv", [
      [d3.timeFormat("%Y-%m-%d")(from_date), '2020/1/19'],
      ['2020/1/20', '2023/5/11'],
      ['2023/5/12', d3.timeFormat("%Y-%m-%d")(to_date)]
    ],color);
  }

  function from_date_change(e) {
    from_date = new Date(e.target.value);
    filter_data = line_data.filter(
      (d) => new Date(d.Week) >= from_date && new Date(d.Week) <= to_date
    );
    let filtered_time_data = time_data.filter(
      (d) => new Date(d.time) >= from_date && new Date(d.time) <= to_date
    );
    filtered_list = get_selected_keywords(); // 获取选中的关键词
    type_selected(filtered_list); // 更新折线图
    line("line", filter_data, filtered_time_data, filtered_list, color);
    //console.log("Updated filter_data after from_date change:", filtered_time_data);
  }
  function to_date_change(e) {
    to_date = new Date(e.target.value);
    filter_data = line_data.filter(
      (d) => new Date(d.Week) >= from_date && new Date(d.Week) <= to_date
    );
    let filtered_time_data = time_data.filter(
      (d) => new Date(d.time) >= from_date && new Date(d.time) <= to_date
    );
    //console.log("current filter_data:", filter_data);
    filtered_list = get_selected_keywords(); // 获取选中的关键词
    type_selected(filtered_list); // 更新折线图
    line("line", filter_data, filtered_time_data, filtered_list, color);
    }  
    // 添加一个函数来获取选中的关键词
    function get_selected_keywords() {
    return $('select').multipleSelect('getSelects');
  }

  //添加重置按钮
  function resetCharts() {
    // 假设初始数据是 line_data 和 time_data
    // 重置过滤器和输入（这里假设您有方法来获取初始过滤器和日期范围）
    let initialFilter = ["anxiety", "depression", "medication"]; // 初始筛选关键词，根据您的应用进行调整
    let initialFromDate = d3.timeFormat("%Y-%m-%d")(d3.min(line_data, d => new Date(d.Week)));
    let initialToDate = d3.timeFormat("%Y-%m-%d")(d3.max(line_data, d => new Date(d.Week)));
    console.log('Resetting charts...');

    // 更新时间输入控件的显示
    d3.select("#fromDateInput").property("value", initialFromDate);
    d3.select("#toDateInput").property("value", initialToDate);

    // 更新关键词筛选框的显示
    $('select').multipleSelect('setSelects', initialFilter);

    // 重新绘制图表
    line("line", line_data, time_data, initialFilter, color);
    drawBarChart(line_data, initialFilter, "barChartDiv", [
      [initialFromDate, '2020/1/19'],
      ['2020/1/20', '2023/5/11'],
      ['2023/5/12', initialToDate]
    ], color);
  }

  // 一旦初始化逻辑完成，设置重置按钮的事件监听器
  document.getElementById('resetButton').addEventListener('click', resetCharts);
}



// 启动函数
init();
function getTransparentColorWithOpacity(color, opacity) {
  let parsedColor = d3.color(color);
  if (!parsedColor) return color;
  return `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${opacity})`;
}

/*
//时间轴提示框背景颜色不透明但更浅
function getLighterColor(color, intensity = 0.1) {
  let d3Color = d3.color(color);
  let hslColor = d3.hsl(d3Color); // 转换为 HSL 颜色空间
  hslColor.l += (1 - hslColor.l) * intensity; // 增加亮度
  if (!parsedColor) return color;
  return hslColor.toString(); // 转换回字符串格式
}
*/

function get_background_color(d, type_color) {
  if (type_color) {
    d3.select(".d3-tip")
      //.style("background-color",d => getLighterColor(type_color(d.type)))
      .style("background-color",getTransparentColorWithOpacity(type_color(d.type), 0.9))
      .style("width", "300px")
      .style("border", `2px solid ${type_color(d.type)}`)
      .style("border-opacity", 1)
      .style("word-break", "break-all");
  } else {
    d3.select(".d3-tip")
      .style("background-color", "#fff")
      .style("width", "300px")
      .style("border", `2px solid #fff`)
      .style("word-break", "break-all");
  }
}
