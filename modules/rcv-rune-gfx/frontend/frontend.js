const updateUi = (state) => {
  $('#embed-copy').val(`${location.href}/gfx.html`);
  $('#state').text(JSON.stringify(state, null, 2))

  $('#text-state').text(state.state);
  $('#data-state').text(state.dataState);
}

const updateState = async () => {
  const response = await LPTE.request({
    meta: {
      namespace: 'rcv-rune-gfx',
      type: 'request',
      version: 1
    }
  });

  updateUi(response.state);
}

const nextStep = () => {
  LPTE.emit({
    meta: {
      namespace: 'rcv-rune-gfx',
      type: 'next-step',
      version: 1
    }
  })
}

const prevStep = () => {
  LPTE.emit({
    meta: {
      namespace: 'rcv-rune-gfx',
      type: 'previous-step',
      version: 1
    }
  })
}

updateState();
setInterval(updateState, 1000);