const tagContainer = document.querySelector('#tag-container')
const blueTag = document.querySelector('#blue-tag')
const redTag = document.querySelector('#red-tag')

const pointContainer = document.querySelector('#point-container')
const blueScore = document.querySelector('#blue-score')
const redScore = document.querySelector('#red-score')

const tick = async () => {
  const data = await this.LPTE.request({
    meta: {
      namespace: 'rcv-teams',
      type: 'request-current',
      version: 1
    }
  });

  if (data.state === "READY") {
    displayTeams(data.teams, data.bestOf)
  } else {
    tagContainer.style.display = 'none'
    pointContainer.style.display = 'none'
  }
}

const update = (data) => {
  if (data.state === "READY") {
    displayTeams(data.teams, data.bestOf)
  } else {
    tagContainer.style.display = 'none'
    pointContainer.style.display = 'none'
  }
}

setTimeout(() => {
  tick()
  window.LPTE.on('rcv-teams', 'update', tick);
}, 1000)

function displayTeams(teams, bestOf) {
  tagContainer.style.display = 'flex'
  pointContainer.style.display = 'flex'

  if (bestOf > 1) {
    pointContainer.style.display = 'flex'
  } else {
    pointContainer.style.display = 'none'
  }

  blueTag.innerHTML = teams.blueTeam.tag
  redTag.innerHTML = teams.redTeam.tag
  blueScore.innerHTML = teams.blueTeam.score
  redScore.innerHTML = teams.redTeam.score
}