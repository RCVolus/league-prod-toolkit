function addCss(fileName) {

  var head = document.head;
  var link = document.createElement('link');

  link.type = 'text/css'
  link.rel = 'stylesheet'
  link.href = fileName

  head.appendChild(link)
}

addCss('/pages/op-rcv-tournament-tree/style/tournament_tree_op.css');
addCss('https://use.typekit.net/anc5qxp.css');

$('#embed-copy').val(`${location.href}/tournament_tree-gfx.html`);

const dataDiv = document.querySelectorAll('[data-matchId]');
const roundsSelect = document.querySelectorAll('[data-round]');

function save () {
  const matches = []
  const rounds = []

  roundsSelect.forEach(element => {
    const round = {}
    round.bestOf = parseInt(element.value)
    rounds.push(round)
  })

  dataDiv.forEach(element => {
    const match = {}
    const blueTeam = element.querySelector('.tt_team.blue')
    const redTeam = element.querySelector('.tt_team.red')

    match.matchId = parseInt(element.dataset.matchid)

    let bestOf = 1
    if (match.matchId < 4) bestOf = rounds[0].bestOf
    else if (match.matchId > 3 && match.matchId < 6) bestOf = rounds[1].bestOf
    else if (match.matchId > 5) bestOf = rounds[2].bestOf

    match.bestOf = bestOf

    match.teams = {}

    match.teams.blueTeam = {}
    match.teams.blueTeam.tag = blueTeam.querySelector('.tt_tag').value
    match.teams.blueTeam.name = blueTeam.querySelector('.tt_name').value
    match.teams.blueTeam.score = parseInt(blueTeam.querySelector('.tt_score').value)

    match.teams.redTeam = {}
    match.teams.redTeam.tag = redTeam.querySelector('.tt_tag').value
    match.teams.redTeam.name = redTeam.querySelector('.tt_name').value
    match.teams.redTeam.score = parseInt(redTeam.querySelector('.tt_score').value)

    match.current_match = element.querySelector('.tt_current_match').checked

    matches.push(match)
  });

  window.LPTE.emit({
    meta: {
      namespace: 'rcv-tournament-tree',
      type: 'set',
      version: 1
    },
    matches,
    rounds
  })
}

function unset() {
  window.LPTE.emit({
    meta: {
      namespace: 'rcv-tournament-tree',
      type: 'unset',
      version: 1
    }
  })
}

async function init () {
  const data = await window.LPTE.request({
    meta: {
      namespace: 'rcv-tournament-tree',
      type: 'request',
      version: 1
    }
  });

  displayData(data)
}

function displayData (data) {
  roundsSelect.forEach(element => {
    const round = parseInt(element.dataset.round)
    const bestOf = data.rounds[round]?.bestOf ?? 1
    element.value = bestOf.toString()
  })

  dataDiv.forEach(element => {
    const matchId = parseInt(element.dataset.matchid)
    const match = data.matches[matchId]

    const blueTeam = element.querySelector('.tt_team.blue')
    const redTeam = element.querySelector('.tt_team.red')
    blueTeam.querySelector('.tt_tag').value = match?.teams.blueTeam.tag || ''
    blueTeam.querySelector('.tt_name').value = match?.teams.blueTeam.name || ''
    blueTeam.querySelector('.tt_score').value = match?.teams.blueTeam.score || 0

    redTeam.querySelector('.tt_tag').value = match?.teams.redTeam.tag || ''
    redTeam.querySelector('.tt_name').value = match?.teams.redTeam.name || ''
    redTeam.querySelector('.tt_score').value = match?.teams.redTeam.score || 0

    element.querySelector('.tt_current_match').checked = match?.current_match
  })
}

window.LPTE.onready(() => {
  init()
  window.LPTE.on('rcv-tournament-tree', 'update', displayData);
})