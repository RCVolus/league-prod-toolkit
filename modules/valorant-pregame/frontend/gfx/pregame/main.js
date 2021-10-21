function initGfx (data, static) {
  if (!data.matchInfo._available || !data.preGame._available) return

  document.querySelector('#Blue').innerHTML = ''
  document.querySelector('#Red').innerHTML = ''

  initMap(data.matchInfo.map, static)

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
  return `/serve/valorant-static/agent-drawing/${CharacterID}.png`
}

const template = document.querySelector('#agent-template')
function addPlayer (participant, player, team) {
  const playerDiv = template.content.cloneNode(true)
  playerDiv.querySelector('.agent').dataset.subject = player.Subject

  playerDiv.querySelector('.agent-name').innerHTML = participant.GameName

  playerDiv.querySelector('.agent-img').src = player.CharacterID == "" ? "" : agentImgUrl(player.CharacterID)

  if (player.CharacterSelectionState === "locked") {
    playerDiv.querySelector('.agent').classList.remove('hover')
  } else {
    playerDiv.querySelector('.agent').classList.add('hover')
  }

  document.querySelector(`#${team}`).appendChild(playerDiv);
}

const mapDiv = document.querySelector('#map')
const mapName = document.querySelector('#map-name')
function initMap (map, static) {
  const currentMap = static.mapData.find(m => {
    return m.mapUrl === map
  })

  const mapData = {
    displayName: currentMap.displayName,
    uuid: currentMap.uuid
  }

  mapDiv.style.backgroundImage = `url(/serve/valorant-static/map-splash/${mapData.uuid}.png)`
  mapName.innerHTML = mapData.displayName
}

function displayData (state) {
  if (!state.preGame._available) return

  for (const team of state.preGame.teams) {
    for (const player of team.Players) {
      const playerDiv = document.querySelector(`[data-subject='${player.Subject}']`)
      playerDiv.querySelector('.agent-img').src = player.CharacterID == "" ? "" : agentImgUrl(player.CharacterID)
      if (player.CharacterSelectionState === "locked") {
        playerDiv.classList.remove('hover')
      } else {
        playerDiv.classList.add('hover')
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

  LPTE.on('valorant-state-pre-game', 'create', (e) => {
    initGfx(e.state, static)
  });

  LPTE.on('valorant-state-pre-game', 'update', (e) => {
    displayData(e.state)
  });
})