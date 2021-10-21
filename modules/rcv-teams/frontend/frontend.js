$('#embed-copy-talk').val(`${location.href}/talk-gfx.html`);
$('#embed-copy-in-game').val(`${location.href}/in-game-gfx.html`);
$('#embed-copy-pause').val(`${location.href}/pause-gfx.html`);

$('#team-form').on('submit', (e) => {
  e.preventDefault()

  const blueTeam = {
    name: $('#blue-team-name').val(),
    tag: $('#blue-team-tag').val(),
    score: parseInt($('#blue-team-score').val())
  }
  const redTeam = {
    name: $('#red-team-name').val(),
    tag: $('#red-team-tag').val(),
    score: parseInt($('#red-team-score').val())
  }

  window.LPTE.emit({
    meta: {
      namespace: 'rcv-teams',
      type: 'set',
      version: 1
    },
    teams: {
      blueTeam,
      redTeam
    },
    bestOf: parseInt($('#best-of').val()),
    roundOf: parseInt($('#round-of').val())
  })
})

function swop() {
  window.LPTE.emit({
    meta: {
      namespace: 'rcv-teams',
      type: 'swop',
      version: 1
    }
  })
}

function clearMatches() {
  window.LPTE.emit({
    meta: {
      namespace: 'rcv-teams',
      type: 'clear-matches',
      version: 1
    }
  })
}

function unset() {
  window.LPTE.emit({
    meta: {
      namespace: 'rcv-teams',
      type: 'unset',
      version: 1
    },
  })

  $('#blue-team-name').val('')
  $('#blue-team-tag').val('')
  $('#blue-team-score').val(0)
  $('#red-team-name').val('')
  $('#red-team-tag').val('')
  $('#red-team-score').val(0)
  $('#best-of').val(1)
  $('#round-of').val(2)
}

async function initUi () {
  const data = await window.LPTE.request({
    meta: {
      namespace: 'rcv-teams',
      type: 'request-current',
      version: 1
    }
  })

  displayData(data)
}

async function displayData (data) {
  $('#blue-team-name').val(data.teams.blueTeam?.name || '')
  $('#blue-team-tag').val(data.teams.blueTeam?.tag || '')
  $('#blue-team-score').val(data.teams.blueTeam?.score || 0)

  $('#red-team-name').val(data.teams.redTeam?.name || '')
  $('#red-team-tag').val(data.teams.redTeam?.tag || '')
  $('#red-team-score').val(data.teams.redTeam?.score || 0)

  $('#best-of').val(data.bestOf)
  $('#round-of').val(data.roundOf)
}

window.LPTE.onready(() => {
  initUi()
  window.LPTE.on('rcv-teams', 'update', displayData);
})