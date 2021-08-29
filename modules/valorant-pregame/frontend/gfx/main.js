const namespace = 'valorant-pregame';

function initGfx (data, static) {
  if (!data.matchInfo._available || !data.preGame._available) return

  
}

function displayData (preGame, static) {
  if (!preGame._available) return


}

LPTE.onready(() => {
  const static = await LPTE.request({
    meta: {
      namespace: 'static-valorant',
      type: 'request',
      version: 1
    }
  });

  const data = await LPTE.request({
    meta: {
      namespace,
      type: 'request',
      version: 1
    }
  });

  initGfx(data, static)
  displayData(data.preGame, static)

  LPTE.on(namespace, 'update', (data) => {
    displayData(data.preGame, static)
  });
})