const red = 'rgba(255,82,51,1)'
const blue = 'rgba(0,183,224,1'
const dark = '#293756'

// use data to create chart
async function getData () {
  // TODO Change data source here
  const dataReq = await fetch('/api/events/shortcut/request/state-league/request')
  const data = await dataReq.json()

  const gameData = data.state.webMatch
  const timelineData = data.state.timeline

  const participants = gameData.participants
  const blueTeam = participants
  .map(p => {
    if (p.teamId == 100) return p.participantId
  })
  .filter(p => p !== undefined)

  const frames = timelineData.frames
  const goldPerFrame = frames.map(frame => {
    var blue = 0
    var red = 0

    for (const participant of Object.values(frame.participantFrames)) {
      const team = blueTeam.includes(participant.participantId) ? 100 : 200

      if (team == 100) blue += participant.totalGold;
      else if (team == 200) red += participant.totalGold;
    }

    const timestamp = frame.timestamp
    return {timestamp, value: blue - red}
  })

  return {keys: goldPerFrame.map(f => f.timestamp), values: goldPerFrame.map(f => f.value)}
}

async function displayGoldGraph () {
  const {keys, values} = await getData();
  var ctx = document.getElementById('goldGraph').getContext('2d');
  var chart = new Chart(ctx, {
    type: 'NegativeTransparentLine',
    data: {
      labels: keys,
      datasets: [{
        yAxisID : 'y-axis-0',
        strokeColor: dark,
        pointColor: dark,
        pointStrokeColor: dark,
        data: values,
      }]
    },
    options: {
        scales: {
          yAxes: [{
            ticks: {
              autoskip: true,
              autoSkipPadding: 50,
              fontSize: 20,
              fontColor: dark,
              callback: function(value, index, values) {
                return value.toFixed(0).replace(/-/g,'');
              }
            }
          }],
          xAxes: [{
            ticks: {
              autoskip: true,
              autoSkipPadding: 50,
              fontSize: 20,
              fontColor: dark,
              callback: function(value, index, values) {
                return millisToMinutesAndSeconds(value)
              }
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

displayGoldGraph()

// Helper to calc milliseconds to minutes and seconds
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
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