import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { InGameState } from './controller/InGameState';
import { AllGameData } from './types/AllGameData';
import type { Config } from './types/Config'

const namespace = 'league-in-game';

module.exports = async (ctx: PluginContext) => {
  const configRes = await ctx.LPTE.request({
    meta: {
      type: 'request',
      namespace: 'config',
      version: 1
    }
  });
  if (configRes === undefined) {
    return ctx.log.warn('config could not be loaded')
  }
  let config = configRes.config as Config;

  ctx.LPTE.on(namespace, 'set-settings', (e) => {
    config.items = e.items
    config.level = e.level

    ctx.LPTE.emit({
      meta: {
        type: 'set',
        namespace: 'config',
        version: 1
      },
      config: {
        items: e.items,
        level: e.level
      }
    });
  });

  ctx.LPTE.on(namespace, 'get-settings', (e) => {
    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply!,
        namespace: 'reply',
        version: 1
      },
      items: config.items,
      level: config.level
    });
  });

  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'OP: league-in-game',
      frontend: 'frontend',
      id : 'op-league-in-game'
    }]
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

  await ctx.LPTE.await('lpt', 'ready', 150000);

  const staticsRes = await ctx.LPTE.request({
    meta: {
      type: 'request-constants',
      namespace: 'static-league',
      version: 1
    }
  })
  if (staticsRes === undefined) {
    return ctx.log.warn(`statics could not be loaded`)
  }
  const statics = staticsRes.constants;

  let inGameState : InGameState

  ctx.LPTE.on('state-league', 'live-game-loaded', () => {
    inGameState = new InGameState(namespace, ctx, config, statics)
  })

  ctx.LPTE.on(namespace, 'allgamedata', (e) => {
    if (inGameState === undefined) {
      inGameState = new InGameState(namespace, ctx, config, statics)
    }

    const data = e.data as AllGameData
    inGameState.handelData(data)
  });

  ctx.LPTE.on(namespace, 'request', (e) => {
    if (inGameState === undefined) {
      inGameState = new InGameState(namespace, ctx, config, statics)
    }

    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply as string,
        namespace: 'reply',
        version: 1
      },
      state: inGameState.gameState
    });
  });

  ctx.LPTE.on(namespace, 'show-inhibs', (e) => {
    if (inGameState === undefined) return

    inGameState.gameState.showInhibitors = e.side
  })

  ctx.LPTE.on(namespace, 'hide-inhibs', (e) => {
    if (inGameState === undefined) return

    inGameState.gameState.showInhibitors = null
  })
};