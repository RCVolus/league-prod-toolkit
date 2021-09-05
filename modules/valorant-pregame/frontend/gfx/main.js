// TODO Implement Real static data

function initGfx (data, static) {
  console.log(data)
  if (!data.matchInfo._available || !data.preGame._available) return

  document.querySelector('#Blue').innerHTML = ''
  document.querySelector('#Red').innerHTML = ''

  initMap(data.matchInfo.map)

  for (const team of data.preGame.teams) {
    for (const player of team.Players) {
      const participant = data.matchInfo.participants.find(p => {
        return player.Subject === p.Subject
      })
      addPlayer(participant, player, team.TeamID)
    }
  }
}

const agentImgUrl = (CharacterID) => {
  return `/serve/valorant-static/agent-bust/${CharacterID}.png`
  // return `https://media.valorant-api.com/agents/${CharacterID}/bustportrait.png`
}

const template = document.querySelector('#agent-template')
function addPlayer (participant, player, team) {
  const playerDiv = template.content.cloneNode(true)
  playerDiv.querySelector('.agent').dataset.subject = player.Subject

  playerDiv.querySelector('.agent-name').innerHTML = participant.GameName
  playerDiv.querySelector('.agent-img').src = player.CharacterID == "" ? "" : agentImgUrl(player.CharacterID)

  if (player.CharacterSelectionState === "locked") {
    playerDiv.querySelector('.agent').classList.remove('hover')
  }

  document.querySelector(`#${team}`).appendChild(playerDiv);
}

const mapDiv = document.querySelector('#map')
const mapName = document.querySelector('#map-name')
function initMap (map) {
  // TODO Add real map data

  const mapData = {
    displayName: 'Bind',
    splash: "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png"
  }

  mapDiv.style.backgroundImage = `url(${mapData.splash})`
  mapName.innerHTML = mapData.displayName
}

function displayData (state, static) {
  if (!state.preGame._available) return

  for (const team of state.preGame.teams) {
    for (const player of team.Players) {
      const playerDiv = document.querySelector(`[data-subject='${player.Subject}']`)
      playerDiv.querySelector('.agent-img').src = player.CharacterID == "" ? "" : agentImgUrl(player.CharacterID)
      if (player.CharacterSelectionState === "locked") {
        playerDiv.classList.remove('hover')
      }
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

  LPTE.on('valorant-state-pregame', 'create', (e) => {
    initGfx(e.state, static)
  });

  LPTE.on('valorant-state-pregame', 'update', (e) => {
    displayData(e.state, static)
  });
})