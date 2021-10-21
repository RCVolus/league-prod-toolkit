function initGfx (data, static) {
  if (!data.matchInfo._available || !data.preGame._available) return

  document.querySelector('#Blue').innerHTML = ''
  document.querySelector('#Red').innerHTML = ''

  initMap(data.matchInfo.map, static)

  for (const team of data.preGame.teams) {
    for (let i = 0; i < team.Players.length; i++) {
      const player = team.Players[i]
      const participant = data.matchInfo.participants.find(p => {
        return player.Subject === p.Subject
      })
      addPlayer(i, participant, player, team.TeamID)
    }
  }
}

const agentImgUrl = (CharacterID) => {
  return `/serve/valorant-static/agent-drawing/${CharacterID}.png`
}

const template = document.querySelector('#agent-template')
function addPlayer (index, participant, player, team) {
  const playerDiv = template.content.cloneNode(true)
  playerDiv.querySelector('.agent').dataset.subject = player.Subject
  playerDiv.querySelector('.agent').style.backgroundImage = `url(/pages/op-valorant-pregame/gfx/img/agent-tiles/${team}-${index+1}.png)`

  playerDiv.querySelector('.agent-name').innerHTML = participant.GameName

  playerDiv.querySelector('.agent-img').src = player.CharacterID == "" ? "" : agentImgUrl(player.CharacterID)

  document.querySelector(`#${team}`).appendChild(playerDiv);
}

const mapDiv = document.body
const mapIcon = document.querySelector('#map-icon')
const mapName = document.querySelector('#map-name')
function initMap (map, static) {
  const currentMap = static.mapData.find(m => {
    return m.mapUrl === map
  })

  mapDiv.style.backgroundImage = `url(/serve/valorant-static/map-splash/${currentMap.uuid}.png)`
  mapName.innerHTML = currentMap.displayName

  mapIcon.src = `/serve/valorant-static/map-rcv/${currentMap.uuid}.png`
}

function displayData (state) {
  if (!state.preGame._available) return

  for (const team of state.preGame.teams) {
    for (const player of team.Players) {
      const playerDiv = document.querySelector(`[data-subject='${player.Subject}']`)
      playerDiv.querySelector('.agent-img').src = player.CharacterID == "" ? "" : agentImgUrl(player.CharacterID)
    }
  }
}

LPTE.onready(async () => {
  const staticRes = await LPTE.request({
    meta: {
      namespace: 'valorant-static',
      type: 'request-constants',
      version: 1
    }
  });

  const static = staticRes.constants

  const res = await LPTE.request({
    meta: {
      namespace: 'valorant-state',
      type: 'request',
      version: 1
    }
  });

  const data = res.state

  initGfx(data, static)

  LPTE.on('valorant-state-pre-game', 'create', (e) => {
    initGfx(e.state, static)
  });

  LPTE.on('valorant-state-pre-game', 'update', (e) => {
    displayData(e.state)
  });
})