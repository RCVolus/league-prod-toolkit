const namespace = 'league-end-of-game';

let previousState = 'ITEMS'
let staticURL = '/serve/static-league'
let champions = []

const itemUrl = id => {
  return `${staticURL}/img/item/${id}.png`
}
const champUrl = championId => {
  const champ = champions.find(c => {
    return c.key === championId.toString()
  })

  if (champ === undefined) return ''

  return `${staticURL}/img/champion/tiles/${champ.id}_0.jpg`
}
const spellUrl = id => {
  return `${staticURL}/img/summoner-spell/${id}.png`
}

// Team Blue
const blueTeamKDA = document.querySelector('#blueTeam .stats .kda')
const blueTeamSecondStatDmg = document.querySelector('#blueTeam .stats .secondStatDmg')
const blueTeamSecondStatGold = document.querySelector('#blueTeam .stats .secondStatGold')
const blueTeamCampions = document.querySelector('#blueTeam .campions')
const blueTeamSpells = document.querySelector('#blueTeam .spells')
const blueTeamData = document.querySelector('#blueTeam .data')
const blueTeamDmg = document.querySelector('#blueTeam .dmg')

// Team Red
const redTeamKDA = document.querySelector('#redTeam .stats .kda')
const redTeamSecondStatDmg = document.querySelector('#redTeam .stats .secondStatDmg')
const redTeamSecondStatGold = document.querySelector('#redTeam .stats .secondStatGold')
const redTeamCampions = document.querySelector('#redTeam .campions')
const redTeamSpells = document.querySelector('#redTeam .spells')
const redTeamData = document.querySelector('#redTeam .data')
const redTeamDmg = document.querySelector('#redTeam .dmg')

function displayChamps (participants) {
  for (const participant of Object.values(participants)) {
    const img = document.createElement('img')
    img.src = champUrl(participant.champion)
    if (participant.teamId === 100) {
      blueTeamCampions.appendChild(img)
    } else {
      redTeamCampions.appendChild(img)
    }
  }
}

function displaySpells (participants) {
  for (const participant of Object.values(participants)) {
    const firstSpell = document.createElement('img')
    firstSpell.src = spellUrl(participant.summonerSpell1)

    const secondSpell = document.createElement('img')
    secondSpell.src = spellUrl(participant.summonerSpell2)

    if (participant.teamId === 100) {
      blueTeamSpells.appendChild(firstSpell)
      blueTeamSpells.appendChild(secondSpell)
    } else {
      redTeamSpells.appendChild(firstSpell)
      redTeamSpells.appendChild(secondSpell)
    }
  }
}

function renderItems (participants, teams) {
  for (const participant of Object.values(participants)) {
    const data = document.createElement('div')
    data.classList.add('dataContainer')

    // first row
    const name = document.createElement('h3')
    name.classList.add('name')
    name.innerHTML = participant.name

    const kills = participant.stats.kills
    const deaths = participant.stats.deaths
    const assists = participant.stats.assists
    const kda = document.createElement('h3')
    kda.classList.add('kda')
    kda.innerHTML = `${kills} / ${deaths} / ${assists}`

    const firstRow = document.createElement('div')
    firstRow.classList.add('firstRow')

    // item row
    const itemRow = document.createElement('div')
    itemRow.classList.add('itemRow')

    // other stats
    const cs = participant.stats.cs
    const gold = participant.stats.gold

    const csDiv = document.createElement('div')
    csDiv.classList.add('info')
    const csHeading = document.createElement('h5')
    csHeading.innerHTML = "CS"
    const csText = document.createElement('h4')
    csText.innerHTML = cs
    csDiv.appendChild(csHeading)
    csDiv.appendChild(csText)

    const goldDiv = document.createElement('div')
    goldDiv.classList.add('info')
    const goldHeading = document.createElement('h5')
    goldHeading.innerHTML = "Gold"
    const goldText = document.createElement('h4')
    goldText.innerHTML = calcK(gold)
    goldDiv.appendChild(goldHeading)
    goldDiv.appendChild(goldText)

    if (participant.teamId === 100) {
      firstRow.appendChild(name)
      firstRow.appendChild(kda)

      data.appendChild(firstRow)

      // item row
      for (const item of participant.items) {
        if (item > 0) {
          const itemImg = document.createElement('img')
          itemImg.src = itemUrl(item)
          itemRow.appendChild(itemImg)
        } else {
          const emptyImg = document.createElement('div')
          emptyImg.classList.add("emptyImg")
          itemRow.appendChild(emptyImg)
        }
      }
      data.appendChild(itemRow)

      data.appendChild(csDiv)
      data.appendChild(goldDiv)

      blueTeamData.appendChild(data)
    } else {
      firstRow.appendChild(kda)
      firstRow.appendChild(name)

      data.appendChild(firstRow)

      data.appendChild(goldDiv)
      data.appendChild(csDiv)

      // item row
      for (const item of participant.items.reverse()) {
        if (item > 0) {
          const itemImg = document.createElement('img')
          itemImg.src = itemUrl(item)
          itemRow.appendChild(itemImg)
        } else {
          const emptyImg = document.createElement('div')
          emptyImg.classList.add("emptyImg")
          itemRow.appendChild(emptyImg)
        }
      }
      data.appendChild(itemRow)

      redTeamData.appendChild(data)
    }
  }

  blueTeamKDA.innerHTML = `${teams[100].stats.kills} / ${teams[100].stats.deaths} / ${teams[100].stats.assists}`
  redTeamKDA.innerHTML = `${teams[200].stats.kills} / ${teams[200].stats.deaths} / ${teams[200].stats.assists}`

  blueTeamSecondStatGold.innerHTML = calcK(teams[100].stats.gold)
  redTeamSecondStatGold.innerHTML = calcK(teams[200].stats.gold)

  showItems()
}

function showItems() {
  blueTeamData.style.display = 'block'
  blueTeamDmg.style.display = 'none'

  redTeamData.style.display = 'block'
  redTeamDmg.style.display = 'none'

  blueTeamSecondStatGold.style.display = 'block'
  blueTeamSecondStatDmg.style.display = 'none'

  redTeamSecondStatGold.style.display = 'block'
  redTeamSecondStatDmg.style.display = 'none'
}
function showDmg() {
  blueTeamData.style.display = 'none'
  blueTeamDmg.style.display = 'block'

  redTeamData.style.display = 'none'
  redTeamDmg.style.display = 'block'

  blueTeamSecondStatGold.style.display = 'none'
  blueTeamSecondStatDmg.style.display = 'block'

  redTeamSecondStatGold.style.display = 'none'
  redTeamSecondStatDmg.style.display = 'block'
}

function renderDmg (participants, teams) {
  const participantsArray = Object.values(participants)
  const dmgArray = participantsArray.map(p => p.stats.damage)
  const dmgMax = Math.max.apply(null,dmgArray)

  for (const participant of participantsArray) {
    const dmg = participant.stats.damage
    const ratio = Math.round((dmg / dmgMax) * 100)

    const dmgContainer = document.createElement('div')
    dmgContainer.classList.add('dmgContainer')

    const dmgBar = document.createElement('div')
    dmgBar.classList.add('dmgBar')
    dmgBar.style.setProperty("--bar-width", `calc(${ratio}% - 5rem)`)

    const dmgText = document.createElement('h3')
    dmgText.innerHTML = calcK(dmg)

    if (participant.teamId == 100) {
      dmgContainer.appendChild(dmgBar)
      dmgContainer.appendChild(dmgText)

      blueTeamDmg.appendChild(dmgContainer)
    } else {
      dmgContainer.appendChild(dmgText)
      dmgContainer.appendChild(dmgBar)

      redTeamDmg.appendChild(dmgContainer)
    }
  }

  blueTeamSecondStatDmg.innerHTML = calcK(teams[100].stats.damage)
  redTeamSecondStatDmg.innerHTML = calcK(teams[100].stats.damage)
}

async function start (emdOfGameData) {
  const state = emdOfGameData.state

  const participants = state.participants
  const teams = state.teams

  displayChamps(participants)
  displaySpells(participants)
  renderItems(participants, teams)
  renderDmg(participants, teams)
}

function calcK (amount) {
  switch (true) {
    case amount > 1000:
      return `${(amount / 1000).toFixed(1)} K`
    default:
      return amount
  }
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
  start(emdOfGameData)
  
  LPTE.on(namespace, 'update', start)

  LPTE.on(namespace, 'end-of-game', (e) => {
    if (previousState == e.state) return
    previousState = e.state

    if (e.state === "ITEMS") {
      showItems()
    } else if (e.state === "DAMAGE") {
      showDmg()
    }
  })
})