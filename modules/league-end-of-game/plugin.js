const namespace = 'league-end-of-game';

module.exports = (ctx) => {
  let state = "ITEMS";

  // Register new UI page
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'OP: league-end-of-game',
      frontend: 'frontend',
      id : 'op-league-end-of-game'
    }]
  });

  ctx.LPTE.on(namespace, 'end-of-game', async e => {
    state = e.state
  });

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request', e => {
    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply,
        namespace: 'reply',
        version: 1
      },
      state
    });
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
