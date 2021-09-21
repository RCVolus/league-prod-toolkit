const namespace = 'valorant-state';

function runTest () {
  LPTE.emit({
    meta: {
      namespace,
      type: 'run-test',
      version: 1
    }
  });
}

function setRound (round) {
  LPTE.emit({
    meta: {
      namespace,
      type: 'set-round',
      version: 1
    },
    round
  });
}

function clearGames () {
  LPTE.emit({
    meta: {
      namespace,
      type: 'clear-round',
      version: 1
    }
  });
}

function setMvp () {
  LPTE.emit({
    meta: {
      namespace,
      type: 'set-mvp',
      version: 1
    },
    subject: $('#mvp').val()
  })
}

const setStatus = (componentName, component) => {
  // Status
  if (component._available) {
    $(`#${componentName}-status`).html('<span class="green">Live</span>')
    $(`#${componentName}-available`).text(new Date(component._created).toLocaleString())
    $(`#${componentName}-update`).text(new Date(component._updated).toLocaleString())
  } else {
    $(`#${componentName}-status`).html('<span class="orange">Not Live</span>')
    if (component._deleted) {
      $(`#${componentName}-unavailable`).text(new Date(component._deleted).toLocaleString())
    }
  }
}

const updateUi = (state) => {
  $('#loopState').html(state.loopState)

  // Flow
  setStatus('valo-match-info', state.matchInfo)
  setStatus('valo-pre-game', state.preGame)
  /* setStatus('valo-in-game', state.inGame) */
  setStatus('valo-post-game', state.postGame)

  $('#mvp').val(state.mvp?.subject)
}

const updateMvpList = (state) => {
  if (state.postGame._available) {
    var save = $('#mvp option:selected').detach();
    $('#mvp').empty()
    $('#mvp').append(save)
    for (const player of state.postGame.players) {
      if (player.teamId !== "Neutral") {
        $('#mvp').append(new Option(player.gameName, player.subject))
      }
    }
  }

  $('#mvp').val(state.mvp?.subject)
}

const updateRounds = (rounds) => {
  console.log(rounds)

  for (i = 0; i < 5; i++) {
    const currentBtn = $(`#r${i+1}`)
    const roundsLength = Object.keys(rounds).length

    if (i+1 <= roundsLength) {
      currentBtn.addClass('btn-primary')
      currentBtn.removeClass('btn-secondary')
    } else if (i+1 === roundsLength+1) {
      currentBtn.prop('disabled', false);
      currentBtn.removeClass('btn-primary')
      currentBtn.addClass('btn-secondary')
    } else {
      currentBtn.prop('disabled', true);
      currentBtn.removeClass('btn-primary')
      currentBtn.addClass('btn-secondary')
    }
  }
}

LPTE.onready(async () => {
  const response = await LPTE.request({
    meta: {
      namespace,
      type: 'request',
      version: 1
    }
  });

  updateUi(response.state);
  updateMvpList(response.state);

  const roundsResponse = await LPTE.request({
    meta: {
      namespace,
      type: 'get-rounds',
      version: 1
    }
  });
  updateRounds(roundsResponse.rounds)

  LPTE.on('valorant-state-pre-game', 'create', (e) => {
    updateUi(e.state)
  });

  LPTE.on('valorant-state-pre-game', 'update', (e) => {
    updateUi(e.state)
  });

  LPTE.on('valorant-state-game', 'create', (e) => {
    updateUi(e.state)
  });

  LPTE.on('valorant-state-post-game', 'create', (e) => {
    updateUi(e.state)
    updateMvpList(e.state)
  });

  LPTE.on('valorant-state-rounds', 'update', (e) => {
    updateRounds(e.rounds)
  });

  LPTE.on('valorant-state-mvp', 'update', (e) => {
    $('#mvp').val(e.mvp?.subject)
  });
})
