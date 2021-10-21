const goldGraphCTX = document.getElementById('goldGraphCTX').getContext('2d');
const blue = getComputedStyle(document.body).getPropertyValue('--blue-team')
const red = getComputedStyle(document.body).getPropertyValue('--red-team')
const white = 'rgba(250,250,250,1)'
const whiteTransparent = 'rgba(242,234,213,0.1)'

function displayGoldGraph (frames) {
  const keys = Object.keys(frames)
  const values = Object.values(frames)

  var chart = new Chart(goldGraphCTX, {
    type: 'NegativeTransparentLine',
    data: {
      labels: keys,
      datasets: [{
        yAxisID : 'y-axis-0',
        strokeColor: white,
        pointColor: white,
        pointStrokeColor: white,
        data: values,
      }]
    },
    options: {
        scales: {
          yAxes: [{
            ticks: {
              autoskip: true,
              autoSkipPadding: 50,
              fontSize: 16,
              fontColor: white,
              callback: function(value, index, values) {
                return value.toFixed(0).replace(/-/g,'');
              }
            },
            gridLines: {
              color: whiteTransparent
            },
          }],
          xAxes: [{
            ticks: {
              autoskip: true,
              autoSkipPadding: 25,
              fontSize: 16,
              fontColor: white,
              callback: function(value, index, values) {
                return milliSecsToMinutesAndSeconds(value)
              }
            },
            gridLines: {
              color: whiteTransparent
            },
          }], 
        },
        legend:
        {
            display: false,
        },
    }
  });
} 

// Add new type of chart to chart.js
Chart.defaults.NegativeTransparentLine = Chart.helpers.clone(Chart.defaults.line);
Chart.controllers.NegativeTransparentLine = Chart.controllers.line.extend({
  update: function () {
    // get the min and max values
    var min = Math.min.apply(null, this.chart.data.datasets[0].data);
    var max = Math.max.apply(null, this.chart.data.datasets[0].data);
    var yScale = this.getScaleForId(this.getDataset().yAxisID);

    // figure out the pixels for these and the value 0
    var top = yScale.getPixelForValue(max);
    var zero = yScale.getPixelForValue(0);
    var bottom = yScale.getPixelForValue(min);

    // build a gradient that switches color at the 0 point
    var ctx = this.chart.chart.ctx;
    var gradient = ctx.createLinearGradient(0, top, 0, bottom);
    var ratio = Math.min((zero - top) / (bottom - top), 1);
    if(ratio < 0){
        
        ratio = 0;
        gradient.addColorStop(1, red);
    }else if(ratio == 1){
        gradient.addColorStop(1, blue);
    }else{
        gradient.addColorStop(0, blue);
        gradient.addColorStop(ratio, blue);
        gradient.addColorStop(ratio, red);
        gradient.addColorStop(1, red);
    }
    this.chart.data.datasets[0].backgroundColor = gradient;

    return Chart.controllers.line.prototype.update.apply(this, arguments);
  }
});

// Helper to calc milliseconds to minutes and seconds
function milliSecsToMinutesAndSeconds(milliSecs) {
  var minutes = Math.floor(milliSecs / 60000);
  var seconds = ((milliSecs % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}