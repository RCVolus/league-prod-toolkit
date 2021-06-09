$('#embed-copy-talk').val(`${location.href}/talk-gfx.html`);
$('#embed-copy-in-game').val(`${location.href}/in-game-gfx.html`);
$('#embed-copy-pause').val(`${location.href}/pause-gfx.html`);

$('#team-form').on('submit', (e) => {
  e.preventDefault()

  const blueTeam = {
    name: $('#blue-team-name').val(),
    tag: $('#blue-team-tag').val(),
    score: $('#blue-team-score').val()
  }
  const redTeam = {
    name: $('#red-team-name').val(),
    tag: $('#red-team-tag').val(),
    score: $('#red-team-score').val()
  }

  LPTE.emit({
    meta: {
      namespace: 'rcv-teams',
      type: 'set',
      version: 1
    },
    teams: {
      blueTeam,
      redTeam
    },
    bestOf: $('#best-of').val()
  });
})

function swop() {
  LPTE.emit({
    meta: {
      namespace: 'rcv-teams',
      type: 'swop',
      version: 1
    },
  });
}

function clearMatches() {
  LPTE.emit({
    meta: {
      namespace: 'database',
      type: 'delete',
      version: 1
    },
    collection: 'match',
    filter: {}
  });
}

function unset() {
  LPTE.emit({
    meta: {
      namespace: 'rcv-teams',
      type: 'unset',
      version: 1
    },
  });

  $('#blue-team-name').val(""),
  $('#blue-team-tag').val(""),
  $('#blue-team-score').val(0)
  $('#red-team-name').val(""),
  $('#red-team-tag').val(""),
  $('#red-team-score').val(0)
  $('#best-of').val(1)
}

async function initUi () {
  const data = await this.LPTE.request({
    meta: {
      namespace: 'rcv-teams',
      type: 'request-current',
      version: 1
    }
  });

  if (data.state !== "READY") return

  $('#blue-team-name').val(data.teams.blueTeam.name)
  $('#blue-team-tag').val(data.teams.blueTeam.tag)
  $('#blue-team-score').val(data.teams.blueTeam.score)

  $('#red-team-name').val(data.teams.redTeam.name)
  $('#red-team-tag').val(data.teams.redTeam.tag)
  $('#red-team-score').val(data.teams.redTeam.score)

  $('#best-of').val(data.bestOf)
}
setTimeout(initUi, 1000)