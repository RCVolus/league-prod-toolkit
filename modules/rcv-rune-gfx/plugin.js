const namespace = 'rcv-rune-gfx';

const initialState = {
  state: 'HIDDEN',
  dataState: 'NO_GAME',
  participants: []
}

module.exports = (ctx) => {
  const gfxState = initialState;

  const emitUpdate = () => {
    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      state: gfxState
    });
  }

  // Register new UI page
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'OP: rcv-rune-gfx',
      frontend: 'frontend',
      id: 'op-rcv-rune-gfx'
    }]
  });

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request', e => {
    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply,
        namespace: 'reply',
        version: 1
      },
      state: gfxState
    });
  });

  ctx.LPTE.on('state-league', 'live-game-loaded', e => {
    gfxState.participants = e.state.web.live.participants;
    // console.log(e)
    gfxState.dataState = 'READY'
    emitUpdate()
  }); 

  // Move a step forward in animation
  ctx.LPTE.on(namespace, 'next-step', async e => {
    if (gfxState.dataState !== 'READY') {
      return;
    }

    if (gfxState.state === 'HIDDEN') {
      // Show
      gfxState.state = '1';
    } else if (gfxState.state === '5') {
      // End
      gfxState.state = 'HIDDEN';
    } else {
      let number = parseInt(gfxState.state);
      number++;
      gfxState.state = number.toString();
    }
    emitUpdate()
  });

  // Move a step backward in animation
  ctx.LPTE.on(namespace, 'previous-step', async e => {
    if (gfxState.dataState !== 'READY') {
      return;
    }

    if (gfxState.state === 'HIDDEN') {
      // Show
      gfxState.state = '5';
    } else if (gfxState.state === '1') {
      // End
      gfxState.state = 'HIDDEN';
    } else {
      let number = parseInt(gfxState.state);
      number--;
      gfxState.state = number.toString();
    }
    emitUpdate()
  });

  ctx.LPTE.on(namespace, 'reset', e => {
    gameState.state = 'UNSET';

    ctx.LPTE.emit({
      meta: {
        namespace: 'reply',
        type: e.meta.reply,
        version: 1
      }
    });
    emitUpdate()
  });

  // Emit event that we're ready to operate
  ctx.LPTE.emit({
    meta: {
      type: 'plugin-status-change',
      namespace: 'lpt',
      version: 1
    },
    status: 'RUNNING'
  });
};
