import { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { ValoState } from './controller/ValoState';
import preGameTestData from './data/Valo-Champselect-data.json'
import matchTestData from './data/Post-Game-data.json'

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

  ctx.LPTE.on(namespace, 'set-mvp', e => {
    const currentState = state.getState()

    if (!currentState.postGame._available) return

    const player = currentState.postGame.players?.find(p => p.subject === e.subject)
    state.mvp = player

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace: 'valorant-state-mvp',
        version: 1
      },
      mvp: player
    })
  });

  ctx.LPTE.on(namespace, 'set-round', e => {
    state.gameSets[e.round] = state.getState()

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace: 'valorant-state-rounds',
        version: 1
      },
      rounds: state.gameSets
    })
  });

  ctx.LPTE.on(namespace, 'clear-round', e => {
    state.gameSets = {}

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace: 'valorant-state-rounds',
        version: 1
      },
      rounds: state.gameSets
    })
  });

  ctx.LPTE.on(namespace, 'get-rounds', e => {
    ctx.LPTE.emit({
      meta: {
        namespace: 'reply',
        type: e.meta.reply as string,
        version: 1
      },
      rounds: state.gameSets
    })
  });

  ctx.LPTE.on('valo', 'valo-pre-game-create', e => {
    state.sessionLoopState = e.state
    state.matchInfo.init(e.data)
    state.preGame.init(e.data)
    state.postGame.delete()
    state.mvp = undefined

    ctx.LPTE.emit({
      meta: {
        type: 'create',
        namespace: 'valorant-state-pre-game',
        version: 1
      },
      state: state.getState()
    })
  });
  ctx.LPTE.on('valo', 'valo-pre-game-update', e => {
    state.preGame.update(e.data)
    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace: 'valorant-state-pre-game',
        version: 1
      },
      state: state.getState()
    })
  });
  ctx.LPTE.on('valo', 'valo-pre-game-delete', e => {
    state.preGame.delete(e.data)
    state.matchInfo.updateTeam(e.data.Teams)
    ctx.LPTE.emit({
      meta: {
        type: 'delete',
        namespace: 'valorant-state-pre-game',
        version: 1
      },
      state: state.getState()
    })
  });

  ctx.LPTE.on('valo', 'valo-game-create', e => {
    state.sessionLoopState = e.state

    ctx.LPTE.emit({
      meta: {
        type: 'create',
        namespace: 'valorant-state-game',
        version: 1
      },
      state: state.getState()
    })
  });

  ctx.LPTE.on('valo', 'valo-post-game-create', e => {
    state.sessionLoopState = e.state
    state.postGame.init(e.data)
    ctx.LPTE.emit({
      meta: {
        type: 'create',
        namespace: 'valorant-state-post-game',
        version: 1
      },
      state: state.getState()
    })
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

  ctx.LPTE.on(namespace, 'run-test', e => {
    state.matchInfo.init(preGameTestData[0] as any)
    state.preGame.init(preGameTestData[0] as any)
    
    for (let i = 1; i < preGameTestData.length; i++) {
      setTimeout(() => {
        ctx.LPTE.emit({
          meta: {
            namespace: 'valo',
            type: 'valo-pre-game-update',
            version: 1
          },
          data: preGameTestData[i]
        })
      }, i * 1000)
    }

    ctx.LPTE.emit({
      meta: {
        namespace: 'valo',
        type: 'valo-post-game-create',
        version: 1
      },
      data: matchTestData
    })
  });
};
