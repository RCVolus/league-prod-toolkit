const version = '11.4.1'
var championsData = {}
var gameData = {}
var participants = []

async function getGameData () {
  // TODO Change data source here
  const gameReq = await fetch('/api/events/shortcut/request/state-league/request')
  return (await gameReq.json()).state.webMatch
}

async function getChampData () {
  const championsUrl = `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
  const championsReq = await fetch(championsUrl)
  const championsJson = await championsReq.json()
  return championsJson.data
}

const itemUrl = id => {
  return `http://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`
}
const champUrl = id => {
  const champ = Object.values(championsData).find(c => c.key == id)
  return `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.id}.png`
}
const spellUrl = id => {
  return `/pages/op-rcv-tent/gfx/img/spells/${id}-min.png`
}

const showDmg = location.href.split('?').length === 2 && location.href.split('?')[1] === 'damage';

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

function displayData () {
  for (const participant of gameData.participants) {
    // const participantInfo = participants.find(p => p.participantId == participant.participantId)

    const data = document.createElement('div')
    data.classList.add('dataContainer')

    // first row
    const name = document.createElement('h3')
    name.classList.add('name')
    name.innerHTML = participant.summonerName
    console.log(participant.summonerName)

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
}

function displayDmg () {
  blueTeamData.style.display = 'none'
  blueTeamDmg.style.display = 'block'
  redTeamData.style.display = 'none'
  redTeamDmg.style.display = 'block'

  const dmgArray = gameData.participants.map(p => p.stats.totalDamageDealtToChampions)
  const dmgMax = Math.max.apply(null,dmgArray)

  for (const participant of gameData.participants) {
    const dmg = participant.stats.totalDamageDealtToChampions
    const ratio = Math.round((dmg / dmgMax) * 100)

    const dmgContainer = document.createElement('div')
    dmgContainer.classList.add('dmgContainer')

    const dmgBar = document.createElement('div')
    dmgBar.classList.add('dmgBar')
    dmgBar.style.width = `calc(${ratio}% - 6rem)`

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
  gameData = await getGameData()
  championsData = await getChampData()
  participants = gameData.participantIdentities
  displayChamps()
  displaySpells()
  displayData()
  showDmg && displayDmg()
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