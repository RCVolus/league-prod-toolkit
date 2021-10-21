const damageGraphDiv = document.querySelector('#damageGraph')
const blueTeam = damageGraphDiv.querySelector('.team.blue')
const redTeam = damageGraphDiv.querySelector('.team.red')

function displayDamageGraph (participants) {
  const participantsArray = Object.values(participants)
  const dmgArray = participantsArray.map(p => p.stats.damage)
  const dmgMax = Math.max.apply(null,dmgArray)

  for (const participant of participantsArray) {
    const champImg = createChampImg(participant.champion)
    const dmgBar = createDamageBar(participant.stats.damage, dmgMax)

    const container = document.createElement('div')
    container.classList.add('container')

    container.append(champImg, dmgBar)

    if (participant.teamId === 100) {
      blueTeam.appendChild(container)
    } else {
      redTeam.appendChild(container)
    }
  }
}

function createDamageBar (dmg, dmgMax) {
  const ratio = Math.round((dmg / dmgMax) * 100)

  const dmgContainer = document.createElement('div')
  dmgContainer.classList.add('dmgContainer')

  const dmgBar = document.createElement('div')
  dmgBar.classList.add('dmgBar')
  dmgBar.style.setProperty("--bar-width", `calc(${ratio}% - 3.5rem)`)

  const dmgText = document.createElement('h3')
  dmgText.innerHTML = calcK(dmg)

  dmgContainer.appendChild(dmgBar)
  dmgContainer.appendChild(dmgText)

  return dmgContainer
}

function createChampImg (champId) {
  const currentChampUri = champUrl(champId)

  const img = document.createElement('img')
  img.classList.add('champImg')
  img.src = currentChampUri

  return img
}