const blueTeam = document.querySelector('#blueTeam .picks')
const blueBan = document.querySelector('#blueBan')

const redTeam = document.querySelector('#redTeam .picks')
const redBan = document.querySelector('#redBan')

async function displayPUBOrder (data) {
  if (!data) {
    return
  }

  // Reset
  blueTeam.innerHTML = ''
  redTeam.innerHtml = ''
  blueBan.innerHTML = ''
  redBan.innerHTML = ''

  // Bans
  for (const ban of data.blueTeam.bans) {
    const img = document.createElement('img')
    img.src = ban.champion.squareImg

    blueBan.appendChild(img)
  }

  for (const ban of data.redTeam.bans) {
    const img = document.createElement('img')
    img.src = ban.champion.squareImg

    redBan.appendChild(img)
  }

  // Picks
  for (const pick of data.blueTeam.picks) {
    const img = document.createElement('img')
    img.src = pick.champion.squareImg

    blueTeam.appendChild(img)
  }

  for (const pick of data.redTeam.picks) {
    const img = document.createElement('img')
    img.src = pick.champion.squareImg

    redTeam.appendChild(img)
  }
}

LPTE.onready(async () => {
  const leagueState = await LPTE.request({
    meta: {
      namespace: 'state-league',
      type: 'request',
      version: 1
    }
  })
  displayPUBOrder(leagueState.state.lcu.champselect.order)
  console.log(leagueState)

  LPTE.on('state-league', 'champselect-update', e => {
    console.log(e)
    displayPUBOrder(e.order)
  })
})

displayPUBOrder()
