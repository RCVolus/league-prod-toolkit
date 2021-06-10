import type { GfxState } from './types/GfxState'

const namespace = 'rcv-tournament-tree';

const initialState : GfxState = {
  state: "NO_MATCHES",
  matches: []
}

module.exports = async (ctx: any) => {
  let gfxState = initialState;

  // Register new UI page
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'OP: rcv-tournament-tree',
      frontend: 'frontend',
      id : 'op-rcv-tournament-tree'
    }]
  });

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request', async (e: any) => {
    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply,
        namespace: 'reply',
        version: 1
      },
      state: gfxState.state,
      matches: gfxState.matches
    });
  });

  ctx.LPTE.on(namespace, 'set', async (e: any) => {
    gfxState.state = 'READY';

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      data: gfxState
    });
  });

  ctx.LPTE.on(namespace, 'unset', (e: any) => {
    gfxState.state = 'NO_MATCHES';
    gfxState.matches = []

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      data: gfxState
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
