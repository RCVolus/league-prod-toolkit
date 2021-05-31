var championsData = []
var gameData = {}
var participants = []
var staticURL = "http://localhost:3000"

async function getGameData () {
  // TODO Change data source here
  const gameReq = await fetch('/api/events/shortcut/request/state-league/request')

  return (await gameReq.json()).state.webMatch
}

async function getConstants () {
  const constantsRes = await fetch('/api/events/shortcut/request/static-league/request-constants')
  const constantsJson = await constantsRes.json()
  const constants = constantsJson.constants
  staticURL = constants.staticURL
  championsData = constants.champions
}

const itemUrl = id => {
  return `${staticURL}/img/item/${id}.png`
}
const champUrl = id => {
  const champ = championsData.find(c => c.key == id)
  return `${staticURL}/img/champion/square/${champ.id}.png`
}
const spellUrl = id => {
  return `${staticURL}/img/summoner-spell/${id}.png`
}

// Team Blue
const blueTeamKDA = document.querySelector('#blueTeam .stats .kda')
const blueTeamSecondStat = document.querySelector('#blueTeam .stats .secondStat')
const blueTeamCampions = document.querySelector('#blueTeam .campions')
const blueTeamSpells = document.querySelector('#blueTeam .spells')
const blueTeamData = document.querySelector('#blueTeam .data')
const blueTeamDmg = document.querySelector('#blueTeam .dmg')

// Team Red
const redTeamKDA = document.querySelector('#redTeam .stats .kda')
const redTeamSecondStat = document.querySelector('#redTeam .stats .secondStat')
const redTeamCampions = document.querySelector('#redTeam .campions')
const redTeamSpells = document.querySelector('#redTeam .spells')
const redTeamData = document.querySelector('#redTeam .data')
const redTeamDmg = document.querySelector('#redTeam .dmg')

var blueTeamStats = {
  kills: 0,
  deaths: 0,
  assists: 0,
  gold: 0,
  dmg: 0
}
var redTeamStats = {
  kills: 0,
  deaths: 0,
  assists: 0,
  gold: 0,
  dmg: 0
}

function displayChamps () {
  console.log(gameData)
  for (const participant of gameData.participants) {
    const img = document.createElement('img')
    img.src = champUrl(participant.championId)
    if (participant.teamId == 100) {
      blueTeamCampions.appendChild(img)
    } else {
      redTeamCampions.appendChild(img)
    }
  }
}

function displaySpells () {
  for (const participant of gameData.participants) {
    const firstSpell = document.createElement('img')
    firstSpell.src = spellUrl(participant.spell1Id)

    const secondSpell = document.createElement('img')
    secondSpell.src = spellUrl(participant.spell2Id)

    if (participant.teamId == 100) {
      blueTeamSpells.appendChild(firstSpell)
      blueTeamSpells.appendChild(secondSpell)
    } else {
      redTeamSpells.appendChild(firstSpell)
      redTeamSpells.appendChild(secondSpell)
    }
  }
}

function renderItems () {
  for (const participant of gameData.participants) {
    // const participantInfo = participants.find(p => p.participantId == participant.participantId)

    const data = document.createElement('div')
    data.classList.add('dataContainer')

    // first row
    const name = document.createElement('h3')
    name.classList.add('name')
    name.innerHTML = participant.summonerName

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
    const items = [
      participant.stats.item0,
      participant.stats.item1,
      participant.stats.item2,
      participant.stats.item3,
      participant.stats.item4,
      participant.stats.item5,
      participant.stats.item6,
    ]

    // other stats
    const cs = participant.stats.totalMinionsKilled
    const gold = participant.stats.goldEarned

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

    if (participant.teamId == 100) {
      // teamStats
      blueTeamStats.kills += kills
      blueTeamStats.deaths += deaths
      blueTeamStats.assists += assists
      blueTeamStats.gold += gold
      
      firstRow.appendChild(name)
      firstRow.appendChild(kda)

      data.appendChild(firstRow)

      // item row
      for (const item of items) {
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
      // teamStats
      redTeamStats.kills += kills
      redTeamStats.deaths += deaths
      redTeamStats.assists += assists
      redTeamStats.gold += gold

      firstRow.appendChild(kda)
      firstRow.appendChild(name)

      data.appendChild(firstRow)

      data.appendChild(goldDiv)
      data.appendChild(csDiv)

      // item row
      for (const item of items.reverse()) {
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

  blueTeamKDA.innerHTML = `${blueTeamStats.kills} / ${blueTeamStats.deaths} / ${blueTeamStats.assists}`
  redTeamKDA.innerHTML = `${redTeamStats.kills} / ${redTeamStats.deaths} / ${redTeamStats.assists}`

  blueTeamSecondStat.innerHTML = calcK(blueTeamStats.gold)
  redTeamSecondStat.innerHTML = calcK(redTeamStats.gold)

  showItems()
}

function showItems() {
  blueTeamData.style.display = 'block'
  blueTeamDmg.style.display = 'none'
  redTeamData.style.display = 'block'
  redTeamDmg.style.display = 'none'
}
function showDmg() {
  blueTeamData.style.display = 'none'
  blueTeamDmg.style.display = 'block'
  redTeamData.style.display = 'none'
  redTeamDmg.style.display = 'block'
}

function renderDmg () {
  const dmgArray = gameData.participants.map(p => p.stats.totalDamageDealtToChampions)
  const dmgMax = Math.max.apply(null,dmgArray)

  for (const participant of gameData.participants) {
    const dmg = participant.stats.totalDamageDealtToChampions
    const ratio = Math.round((dmg / dmgMax) * 100)

    const dmgContainer = document.createElement('div')
    dmgContainer.classList.add('dmgContainer')

    const dmgBar = document.createElement('div')
    dmgBar.classList.add('dmgBar')
    dmgBar.style.setProperty("--bar-width", `calc(${ratio}% - 6rem)`)

    const dmgText = document.createElement('h3')
    dmgText.innerHTML = calcK(dmg)

    if (participant.teamId == 100) {
      blueTeamStats.dmg += dmg

      dmgContainer.appendChild(dmgBar)
      dmgContainer.appendChild(dmgText)

      blueTeamDmg.appendChild(dmgContainer)
    } else {
      redTeamStats.dmg += dmg

      dmgContainer.appendChild(dmgText)
      dmgContainer.appendChild(dmgBar)

      redTeamDmg.appendChild(dmgContainer)
    }
  }

  blueTeamSecondStat.innerHTML = calcK(blueTeamStats.dmg)
  redTeamSecondStat.innerHTML = calcK(redTeamStats.dmg)
}

async function start () {
  await getConstants()
  gameData = await getGameData()
  participants = gameData.participantIdentities
  displayChamps()
  displaySpells()
  renderItems()
  renderDmg()
}
start()

function calcK (amount) {
  switch (true) {
    case amount > 1000:
      return `${Math.floor(amount / 1000)} k`
    default:
      return amount
  }
}

let previousState = 'ITEMS'

const tick = async () => {
  const data = await this.LPTE.request({
    meta: {
      namespace: 'rcv-tent',
      type: 'request',
      version: 1
    }
  });

  if (previousState == data.state) return
  previousState = data.state

  if (data.state === "ITEMS") {
    showItems()
  } else if (data.state === "DAMAGE") {
    showDmg()
  }
}

tick();
setInterval(tick, 1000);