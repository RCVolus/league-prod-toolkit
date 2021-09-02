import { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { ValoState } from './controller/ValoState';

//import preGameData from './data/Valo-Champselect-data.json'

const namespace = 'valorant-state';

module.exports = async (ctx: PluginContext) => {
  // Register new UI page
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'OP Valorant Game State',
      frontend: 'frontend',
      id: 'op-valorant-game'
    }]
  });

  const state = new ValoState(ctx)

  /**
   * TODO
   * Add a possibility to update ths loopState via the obs tool outside of pregame
  */

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request', e => {
    ctx.LPTE.emit({
      meta: {
        namespace: 'reply',
        type: e.meta.reply as string,
        version: 1
      },
      state: state.getState()
    })
  });

  ctx.LPTE.on('valo', 'valo-pregame-create', e => {
    state.sessionLoopState = e.state
    state.matchInfo.init(e.data)
    state.preGame.init(e.data)
    ctx.LPTE.emit({
      meta: {
        type: 'create',
        namespace: 'valorant-state-pregame',
        version: 1
      },
      state: state.getState()
    })
  });
  ctx.LPTE.on('valo', 'valo-pregame-update', e => {
    state.preGame.update(e.data)
    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace: 'valorant-state-pregame',
        version: 1
      },
      state: state.getState()
    })
  });
  ctx.LPTE.on('valo', 'valo-pregame-delete', e => {
    state.preGame.delete()
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

  /* state.matchInfo.init(preGameData[0] as any)
  state.preGame.init(preGameData[0] as any)
  for (let i = 1; i < preGameData.length; i++) {
    setTimeout(() => {
      state.preGame.update(preGameData[i] as any)
    }, i * 1000)
  } */
};
