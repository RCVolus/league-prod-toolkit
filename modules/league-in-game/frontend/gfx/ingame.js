const namespace = 'league-in-game';
const blueTeam = document.querySelector('#blue')
const redTeam = document.querySelector('#red')

function getPlayerId(id) {
  if (id > 4) return id - 5
  else return id
}

function levelUpdate (e) {
  console.log(e)
  const playerId = getPlayerId(e.player)

  const team = e.team === "ORDER" ? blueTeam : redTeam
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

  const team = e.team === "ORDER" ? blueTeam : redTeam
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

LPTE.onready(async () => {
  LPTE.on(namespace, 'levelUpdate', levelUpdate);
  LPTE.on(namespace, 'itemUpdate', itemUpdate);
})