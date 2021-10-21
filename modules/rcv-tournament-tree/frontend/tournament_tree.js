const dataDiv = document.querySelectorAll('[data-matchId]');

function displayData (data) {
  dataDiv.forEach(element => {
    const matchId = parseInt(element.dataset.matchid)
    const match = data.matches[matchId]

    const blueTeam = element.querySelector('.tt_team.blue')
    const redTeam = element.querySelector('.tt_team.red')
    blueTeam.querySelector('.tt_tag').innerHTML = match ? match.teams.blueTeam.tag : ''
    blueTeam.querySelector('.tt_name').innerHTML = match ? match.teams.blueTeam.name : ''
    resizeText(blueTeam.querySelector('.tt_name'))
    if (match ? match.teams.blueTeam.tag : false) {
      blueTeam.querySelector('.tt_score').innerHTML = match ? match.teams.blueTeam.score : ''
    }

    redTeam.querySelector('.tt_tag').innerHTML = match ? match.teams.redTeam.tag : ''
    redTeam.querySelector('.tt_name').innerHTML = match ? match.teams.redTeam.name : ''
    resizeText(redTeam.querySelector('.tt_name'))
    if (match ? match.teams.redTeam.tag : false) {
      redTeam.querySelector('.tt_score').innerHTML = match ? match.teams.redTeam.score : ''
    }
  });
}

const isOverflown = ({ clientWidth, scrollWidth }) => scrollWidth > clientWidth

const resizeText = ( parent ) => {
  let i = 25 // let's start with 12px
  let overflow = false
  const maxSize = 50 // very huge text size

  while (!overflow && i < maxSize) {
    parent.style.fontSize = `${i}px`
    overflow = isOverflown(parent)
    if (!overflow) i++
  }

  // revert to last state where no overflow happened:
  parent.style.fontSize = `${i - 1}px`
}

const init = async () => {
  const data = await window.LPTE.request({
    meta: {
      namespace: 'rcv-tournament-tree',
      type: 'request',
      version: 1
    }
  });

  displayData(data)
}

window.LPTE.onready(() => {
  init()
  window.LPTE.on('rcv-tournament-tree', 'update', displayData);
})