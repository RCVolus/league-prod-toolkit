const updateUi = (state) => {
  $('#gold-embed').val(`${location.href}/gfx/gold.html`);
  $('#damage-embed').val(`${location.href}/gfx/end-of-game.html?damage`);
  $('#items-embed').val(`${location.href}/gfx/end-of-game.html`);
  $('#pickban-embed').val(`${location.href}/gfx/pick-ban-order.html`);
}

const updateState = async () => {
  updateUi();
}

const showItems = () => {
  LPTE.emit({
    meta: {
      namespace: 'rcv-tent',
      type: 'end-of-game',
      version: 1
    },
    state: "ITEMS"
  })
}

const showDmg = () => {
  LPTE.emit({
    meta: {
      namespace: 'rcv-tent',
      type: 'end-of-game',
      version: 1
    },
    state: "DAMAGE"
  })
}

updateState();
setInterval(updateState, 1000);