const namespace = 'league-in-game';
const blueTeam = document.querySelector('#blue')
const redTeam = document.querySelector('#red')

function getPlayerId(id) {
  if (id > 4) return id - 5
  else return id
}

function levelUpdate (e) {
  const playerId = getPlayerId(e.player)

  const team = e.team === 100 ? blueTeam : redTeam
  const playerDiv = team.children[playerId]

  const levelContainer = playerDiv.querySelector('.level')

  if (playerDiv.classList.contains('levelUp') || playerDiv.classList.contains('itemBuy')) {
    return setTimeout(() => {
      levelUpdate(e)
    }, 3000)
  }

  levelContainer.innerHTML = e.level
  playerDiv.classList.add('levelUp')
  setTimeout(() => {
    playerDiv.classList.remove('levelUp')
  }, 6000)
}

function itemUpdate (e) {
  const playerId = getPlayerId(e.player)

  const team = e.team === 100 ? blueTeam : redTeam
  const playerDiv = team.children[playerId]

  const levelContainer = playerDiv.querySelector('.item')

  if (playerDiv.classList.contains('levelUp') || playerDiv.classList.contains('itemBuy')) {
    return setTimeout(() => {
      itemUpdate(e)
    }, 3000)
  }

  levelContainer.src = `/serve/static-league/img/item/${e.item}.png`
  playerDiv.classList.add('itemBuy')
  setTimeout(() => {
    playerDiv.classList.remove('itemBuy')
  }, 6000)
}

const inhibDiv = document.querySelector('#inhibDiv')
const blueSide = inhibDiv.querySelector('#blueSide')
const redSide = inhibDiv.querySelector('#redSide')

function inhibUpdate (e) {
  const team = e.team === 100 ? blueSide : redSide
  const inhib = team.querySelector(`.${e.lane}`)
  inhib.style.setProperty('--percent', e.percent)
  inhib.querySelector('p').innerText = convertSecsToTime(e.respawnIn)
}

const turretDiv = document.querySelector('#turrets')
const blueTurrets = turretDiv.querySelector('#blueTurrets')
const redTurrets = turretDiv.querySelector('#redTurrets')

function towerUpdate (e) {
  const team = e.team === '100' ? redTurrets : blueTurrets
  const value = team.querySelector('.value')
  const newValue = (Number(value.innerText) || 0) + 1
  value.innerText = newValue
}

function setGameState (e) {
  const state = e.state

  for (const [teamId, team] of Object.entries(state.towers)) {
    for (const lane of Object.values(team)) {
      const teamDiv = teamId === '100' ? redTurrets : blueTurrets
      const value = teamDiv.querySelector('.value')
      let newValue = 0

      for (const alive of Object.values(lane)) {
        if (alive) continue

        newValue += 1
        value.textContent = newValue + 1
      }

      value.textContent = (Number(value.innerText) || 0)
    }
  }

  for (const [teamId, team] of Object.entries(state.inhibitors)) {
    for (const [lane, data] of Object.entries(team)) {
      const teamDiv = teamId === 100 ? blueSide : redSide
      const div = teamDiv.querySelector(`.${lane}`)

      if (data.alive) {
        div.style.setProperty('--percent', '0')
        div.querySelector('p').innerText = convertSecsToTime(0)
      } else {
        div.style.setProperty('--percent', data.percent)
        div.querySelector('p').innerText = convertSecsToTime(data.respawnIn)
      }
    }
  }

  if (state.showInhibitors !== null) {
    inhibDiv.classList.remove('hide')
    if (state.showInhibitors === 100) {
      blueSide.classList.remove('hide')
      redSide.classList.add('hide')
    } else {
      blueSide.classList.add('hide')
      redSide.classList.remove('hide')
    }
  } else {
    inhibDiv.classList.add('hide')
    blueSide.classList.add('hide')
    redSide.classList.add('hide')
  }
}

function convertSecsToTime (secs) {
  const minutes = Math.floor(secs / 60);
  const seconds = secs - minutes * 60;
  return `${('0' + minutes).slice(-2)}:${('0' + seconds).slice(-2)}`
}

LPTE.onready(async () => {
  LPTE.on(namespace, 'level-update', levelUpdate)
  LPTE.on(namespace, 'item-update', itemUpdate)
  LPTE.on(namespace, 'inhib-update', inhibUpdate)
  LPTE.on(namespace, 'tower-update', towerUpdate)
  LPTE.on(namespace, 'update', setGameState)

  LPTE.on(namespace, 'show-inhibs', (e) => {
    inhibDiv.classList.remove('hide')

    if (e.side === 100) {
      blueSide.classList.remove('hide')
      redSide.classList.add('hide')
    } else {
      blueSide.classList.add('hide')
      redSide.classList.remove('hide')
    }
  });

  LPTE.on(namespace, 'hide-inhibs', () => {
    inhibDiv.classList.add('hide')
    blueSide.classList.add('hide')
    redSide.classList.add('hide')
  });

  const res = await LPTE.request({
    meta: {
      namespace,
      type: 'request',
      version: 1
    }
  });

  setGameState(res)
})