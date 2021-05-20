const updateUi = (state) => {
  $('#embed-copy').val(`${location.href}/gfx.html`);
  $('#state').text(JSON.stringify(state, null, 2))

  $('#data-state').text(JSON.stringify(state.state) !== '{}' ? 'OK' : 'NO_DATA');
}

const updateState = async () => {
  const response = await LPTE.request({
    meta: {
      namespace: 'rcv-pickban',
      type: 'request',
      version: 1
    }
  });

  updateUi(response.state);
}

updateState();
setInterval(updateState, 1000);