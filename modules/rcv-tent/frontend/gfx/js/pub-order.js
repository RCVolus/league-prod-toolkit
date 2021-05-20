async function getPIBData () {
  // TODO Change data source here
  const gameReq = await fetch('/api/events/shortcut/request/rcv-pickban/request')
  return await gameReq.json()
}

const blueTeam = document.querySelector('#blueTeam .picks')
const blueBan = document.querySelector('#blueBan')

const redTeam = document.querySelector('#redTeam .picks')
const redBan = document.querySelector('#redBan')

const basePath = 'http://' + document.location.hostname + ':8999';

async function displayPUBOrder () {
  const pubData = await getPIBData();
  const data = pubData.state.data

  // Bans
  for (const ban of data.blueTeam.bans) {
    const img = document.createElement('img')
    img.src = basePath + ban.champion.squareImg

    blueBan.appendChild(img)
  }

  for (const ban of data.redTeam.bans) {
    const img = document.createElement('img')
    img.src = basePath + ban.champion.squareImg

    redBan.appendChild(img)
  }

  // Picks
  for (const pick of data.blueTeam.picks) {
    const img = document.createElement('img')
    img.src = basePath + pick.champion.squareImg

    blueTeam.appendChild(img)
  }

  for (const pick of data.redTeam.picks) {
    const img = document.createElement('img')
    img.src = basePath + pick.champion.squareImg

    redTeam.appendChild(img)
  }
}

displayPUBOrder()