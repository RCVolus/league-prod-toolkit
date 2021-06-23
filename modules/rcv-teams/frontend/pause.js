const container = document.querySelector('#container')

const tick = async () => {
  const res = await window.LPTE.request({
    meta: {
      type: 'request-matches-of-the-day',
      namespace: 'rcv-teams',
      version: 1
    },
  });

  displayMatches(res.matches.data)
}

window.LPTE.onready(() => {
  tick()
  window.LPTE.on('rcv-teams', 'set', tick)
  window.LPTE.on('rcv-teams', 'clear-matches', tick)
})

function displayMatches(matches) {
  container.innerHTML = ''
  for (const match of matches) {
    if (parseInt(match.bestOf) === 1) displaySingle(match)
    else displayBestOF(match)
  }
}

function displaySingle(match) {
  const matchDiv = document.createElement('div')
  matchDiv.classList.add('match')

  const blueTeam = match.teams.blueTeam
  const redTeam = match.teams.redTeam

  // blue tag
  const blueTag = document.createElement('h2')
  blueTag.classList.add('tag')
  blueTag.classList.add('blue')
  if (parseInt(blueTeam.score) < parseInt(redTeam.score)) {
    blueTag.classList.add('outline')
  }
  blueTag.innerText = blueTeam.tag

  // blue tag
  const redTag = document.createElement('h2')
  redTag.classList.add('tag')
  redTag.classList.add('red')
  if (parseInt(blueTeam.score) > parseInt(redTeam.score)) {
    redTag.classList.add('outline')
  }
  redTag.innerText = redTeam.tag

  // vs
  const vs = document.createElement('h1')
  vs.classList.add('vs')
  vs.innerText = "vs"

  matchDiv.appendChild(blueTag)
  matchDiv.appendChild(vs)
  matchDiv.appendChild(redTag)

  container.appendChild(matchDiv)
}

function displayBestOF(match) {
  console.log(match)

  const matchDiv = document.createElement('div')
  matchDiv.classList.add('match')

  const blueTeam = match.teams.blueTeam
  const redTeam = match.teams.redTeam

  // blue Team
  const blueTeamDiv = document.createElement('div')
  blueTeamDiv.classList.add('team')

  const blueTag = document.createElement('h2')
  blueTag.classList.add('tag')
  blueTag.classList.add('blue')
  if (parseInt(redTeam.score) > parseInt(match.bestOf) / 2) {
    blueTag.classList.add('outline')
  }
  blueTag.innerText = blueTeam.tag

  const blueShards = displayShards(parseInt(blueTeam.score))
  blueShards.classList.add('blue')
  if (parseInt(redTeam.score) > parseInt(match.bestOf) / 2) {
    blueShards.classList.add('outline')
  }
  blueTeamDiv.appendChild(blueTag)
  blueTeamDiv.appendChild(blueShards)

  // blue team
  const redTeamDiv = document.createElement('div')
  redTeamDiv.classList.add('team')

  const redTag = document.createElement('h2')
  redTag.classList.add('tag')
  redTag.classList.add('red')
  if (parseInt(blueTeam.score) > parseInt(match.bestOf) / 2) {
    redTag.classList.add('outline')
  }
  redTag.innerText = redTeam.tag

  const redShards = displayShards(parseInt(redTeam.score))
  redShards.classList.add('red')
  if (parseInt(blueTeam.score) > parseInt(match.bestOf) / 2) {
    redShards.classList.add('outline')
  }
  redTeamDiv.appendChild(redTag)
  redTeamDiv.appendChild(redShards)

  // vs
  const vs = document.createElement('h1')
  vs.classList.add('vs')
  vs.innerText = "vs"

  matchDiv.appendChild(blueTeamDiv)
  matchDiv.appendChild(vs)
  matchDiv.appendChild(redTeamDiv)

  container.appendChild(matchDiv)
}

function displayShards(points) {
  const shardsDiv = document.createElement('div')
  shardsDiv.classList.add('shards')

  for (const i of [1,2,3]) {
    const shard = document.createElement('div')
    shard.classList.add('shard')
    if (points > 0) {
      shard.classList.add('full')
      points--
    }
    shardsDiv.appendChild(shard)
  }

  return shardsDiv
}