import WebSocket from 'ws'
const namespace = 'league-replay';

module.exports = async (ctx: any) => {
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'OP: league-replay',
      frontend: 'frontend',
      id : 'op-league-replay'
    }]
  });

  ctx.LPTE.on(namespace, 'set-render', async (e: any) => {
    // TODO handle data and show on map
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