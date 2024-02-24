var dom = document.getElementById('heat_map');
  var myChart = echarts.init(dom, null, {
    renderer: 'svg',
    useDirtyRect: false
  });
  var app = {};
  
  var option;
  fetch('../data/home/trend_data.json')
    .then((res) => res.json())
    .then((jsonData) => {// 分别获取 "month"、"keyword" 和 "value"
    const months = [...new Set(jsonData.map(item => item.month))];
  const keywords = [...new Set(jsonData.map(item => item.keywords))];
  
      const data = jsonData.map((item) => {
        return [months.indexOf(item.month), keywords.indexOf(item.keywords), item.value || '-'];
      });
  
      // 在这里可以使用映射好的 data 数组
      console.log(data);
  
  
  option = {
    textStyle:{
      fontFamily: 'Inter',
      fontSize: 16,
      fontStyle: 'normal',
      fontWeight: 500},
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '60%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: months,
      splitArea: {
        show: true
      },
      axisLabel: {
          textStyle:{
          fontSize: 16
      }},
      axisTick:{
        show: false
      },
      splitLine:{
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: keywords,
      splitArea: {
        show: true
      },
      axisLabel: {
          textStyle:{
          fontSize: 16,
          color: '#202020'
      }},
      axisTick:{
        show: false
      },
      splitLine:{
        show: true
      }
    },
    visualMap: {
      min: 10,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      // bottom: '5%',
      bottom: 0,
      inRange: {
        //  color: ["#1984c5", "#22a7f0", "#63bff0", "#a7d5ed", "#e2e2e2", "#e1a692", "#de6e56", "#e14b31", "#c23728"]
         color: ['#1c5fc6', '#5776cf', '#7c8ed7', '#9da7df', '#bcc1e7', '#d9dbef', '#f6f6f6', '#f9d5cc', '#f7b4a4', '#f2927d', '#e97057', '#dd4a32', '#ce0b0b']



      }
    },
    series: [
      {
        name: 'Search Trend',
        type: 'heatmap',
        data: data,
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  
  if (option && typeof option === 'object') {
    myChart.setOption(option);
  }
  
  window.addEventListener('resize', myChart.resize);
  });
