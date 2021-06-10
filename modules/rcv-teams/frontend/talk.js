const teamsContainer = document.querySelectorAll('.team')
const blueTag = document.querySelector('#blue-tag')
const redTag = document.querySelector('#red-tag')
const blueName = document.querySelector('#blue-name')
const redName = document.querySelector('#red-name')

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
    teamsContainer.forEach(t => {
      t.style.display = 'none'
    })
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
  teamsContainer.forEach(t => {
    t.style.display = 'flex'
  })

  blueTag.innerHTML = teams.blueTeam.tag
  blueName.innerHTML = teams.blueTeam.name

  redTag.innerHTML = teams.redTeam.tag
  redName.innerHTML = teams.redTeam.name

  redTag.classList.remove('outline')
  redName.classList.remove('outline')
  blueTag.classList.remove('outline')
  blueName.classList.remove('outline')
  if (teams.blueTeam.score == 0 && teams.redTeam.score == 0) return

  if (bestOf > 1) {
    if (teams.blueTeam.score > bestOf/2) {
      redTag.classList.add('outline')
      redName.classList.add('outline')
    } else if (teams.redTeam.score > bestOf/2) {
      blueTag.classList.add('outline')
      blueName.classList.add('outline')
    }
  } else {
    if (teams.blueTeam.score > teams.redTeam.score) {
      redTag.classList.add('outline')
      redName.classList.add('outline')
    } else if (teams.redTeam.score > teams.blueTeam.score) {
      blueTag.classList.add('outline')
      blueName.classList.add('outline')
    }
  }
}