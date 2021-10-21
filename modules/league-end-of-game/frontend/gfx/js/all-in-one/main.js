const namespace = 'league-end-of-game';
let staticURL = '/serve/static-league'
let champions = []

const champUrl = championId => {
  const champ = champions.find(c => {
    return c.key === championId.toString()
  })

  if (champ === undefined) return ''

  return `${staticURL}/img/champion/tiles/${champ.id}_0.jpg`
}

function calcK (amount) {
  switch (true) {
    case amount > 1000:
      return `${(amount / 1000).toFixed(1)} K`
    default:
      return amount
  }
}

function displayData (emdOfGameData) {
  const state = emdOfGameData.state

  if (state.status !== "GAME_LOADED") return

  const teams = state.teams
  displayTeamStats(teams)

  const frames = state.goldFrames
  displayGoldGraph(frames)

  const participants = state.participants
  displayDamageGraph(participants)
}

LPTE.onready(async () => {
  const constantsRes = await LPTE.request({
    meta: {
      namespace: 'static-league',
      type: 'request-constants',
      version: 1
    }
  })
  const constants = constantsRes.constants
  champions = constants.champions

  const emdOfGameData = await LPTE.request({
    meta: {
      namespace,
      type: 'request',
      version: 1
    }
  })
  displayData(emdOfGameData)
  
  LPTE.on(namespace, 'update', displayData)
})