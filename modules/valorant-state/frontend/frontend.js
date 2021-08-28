const namespace = 'valorant-state';

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
  console.log(state)

  $('#loopState').html(state.loopState)

  // Flow
  setStatus('valo-match-info', state.matchInfo)
  setStatus('valo-pregame', state.preGaem)
  /* setStatus('valo-end-of-game', state.endGame)
  setStatus('valo-in-game', state.inGame) */
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
})
