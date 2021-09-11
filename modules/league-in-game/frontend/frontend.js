$('#ingame-embed').val(`${location.href}/gfx/ingmae.html`);

const namespace = 'league-in-game';

$('#settings').on('submit', (e) => {
  e.preventDefault()

  LPTE.emit({
    meta: {
      namespace,
      type: 'set-settings',
      version: 1
    },
    items: $('#items').val(),
    level: $('#level').val()
  })
})

function showInhibs (side) {
  LPTE.emit({
    meta: {
      namespace,
      type: 'show-inhibs',
      version: 1
    },
    side
  })
}

function hideInhibs () {
  LPTE.emit({
    meta: {
      namespace,
      type: 'hide-inhibs',
      version: 1
    }
  })
}

function initSettings (settings) {
  $('#items').val(settings.items)
  $('#level').val(settings.level)
}

LPTE.onready(async () => {
  const settings = await LPTE.request({
    meta: {
      namespace,
      type: 'get-settings',
      version: 1
    }
  })
  initSettings(settings)

  LPTE.on(namespace, 'set-settings', initSettings)
})