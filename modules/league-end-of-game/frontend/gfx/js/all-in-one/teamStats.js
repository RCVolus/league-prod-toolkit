// TeamStat Div`s
const teamStats = document.querySelector('#teamStats')
const kdaDiv = teamStats.querySelector('#kda')
const goldDiv = teamStats.querySelector('#gold')
const towerDiv = teamStats.querySelector('#tower')
const inhibitorsDiv = teamStats.querySelector('#inhibitors')
const drakesDiv = teamStats.querySelector('#drakes')
const eldersDiv = teamStats.querySelector('#elders')
const baronsDiv = teamStats.querySelector('#barons')
const bansDiv = teamStats.querySelector('#bans')

function displayTeamStats (teams) {
  // KDA
  const blueTeamKDA = `${teams[100].stats.kills} / ${teams[100].stats.deaths} / ${teams[100].stats.assists}`
  kdaDiv.querySelector('.stat.blue').innerHTML = blueTeamKDA

  const redTeamKDA = `${teams[200].stats.kills} / ${teams[200].stats.deaths} / ${teams[200].stats.assists}`
  kdaDiv.querySelector('.stat.red').innerHTML = redTeamKDA

  // Gold
  const blueTeamGold = calcK(teams[100].stats.gold)
  goldDiv.querySelector('.stat.blue').innerHTML = blueTeamGold

  const redTeamGold = calcK(teams[200].stats.gold)
  goldDiv.querySelector('.stat.red').innerHTML = redTeamGold

  // Tower
  towerDiv.querySelector('.stat.blue').innerHTML = teams[100].stats.towers
  towerDiv.querySelector('.stat.red').innerHTML = teams[200].stats.towers

  // Inhibitors
  inhibitorsDiv.querySelector('.stat.blue').innerHTML = teams[100].stats.inhibitors
  inhibitorsDiv.querySelector('.stat.red').innerHTML = teams[200].stats.inhibitors

  // Drakes
  displayDrakes(teams)

  // Elders
  eldersDiv.querySelector('.stat.blue').innerHTML = teams[100].stats.elders
  eldersDiv.querySelector('.stat.red').innerHTML = teams[200].stats.elders

  // Barons
  baronsDiv.querySelector('.stat.blue').innerHTML = teams[100].stats.barons
  baronsDiv.querySelector('.stat.red').innerHTML = teams[200].stats.barons

  // Bans
  displayBans(teams)
}

function displayDrakes (teams) {
  const blueDrakes = teams[100].dragons
  const redDrakes = teams[200].dragons

  for (i = 0; i < blueDrakes.length; i++) {
    const drake = blueDrakes[blueDrakes.length - 1 - i].split('_')[0].toLowerCase()
    const drakeImg = drakesDiv.querySelector('.stat.blue').children[i]

    drakeImg.src = `${staticURL}/img/drakes/${drake}.png`
  }

  for (i = 0; i < redDrakes.length; i++) {
    const drake = redDrakes[i].split('_')[0].toLowerCase()
    const drakeImg = drakesDiv.querySelector('.stat.red').children[i]

    drakeImg.src = `${staticURL}/img/drakes/${drake}.png`
  }
}

function displayBans (teams) {
  const blueBans = teams[100].bans
  const redBans = teams[200].bans

  for (i = 0; i < blueBans.length; i++) {
    const ban = blueBans[i]
    const banImg = bansDiv.querySelector('.stat.blue').children[i]

    banImg.src = champUrl(ban)
  }

  for (i = 0; i < redBans.length; i++) {
    const ban = redBans[i]
    const banImg = bansDiv.querySelector('.stat.red').children[i]

    banImg.src = champUrl(ban)
  }
}