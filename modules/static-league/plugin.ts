import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import StaticData from './StaticData'

const namespace = 'static-league';

module.exports = async (ctx: PluginContext) => {
  const configRes = await ctx.LPTE.request({
    meta: {
      type: 'request',
      namespace: 'config',
      version: 1
    }
  });
  if (configRes === undefined) {
    return ctx.log.warn(`${namespace} config could not be loaded`)
  }
  const config = configRes.config;

  const staticData = new StaticData(ctx, config)

  ctx.LPTE.emit({
    meta: {
      type: 'add-serves',
      namespace: 'ui',
      version: 1
    },
    serves: [{
      frontend: 'frontend',
      id: 'static-league'
    }]
  });

  staticData.onReady(() => {
    ctx.LPTE.emit({
      meta: {
        type: 'plugin-status-change',
        namespace: 'lpt',
        version: 1
      },
      status: 'RUNNING'
    });

    const gameStatic = {
      seasons: require(`../frontend/data/constants/seasons.json`),
      queues: require(`../frontend/data/constants/queues.json`),
      maps: require(`../frontend/data/de_DE/map.json`),
      gameModes: require(`../frontend/data/constants/gameModes.json`),
      gameTypes: require(`../frontend/data/constants/gameTypes.json`),
      perks: require(`../frontend/data/de_DE/runesReforged.json`),
      champions: Object.values(require(`../frontend/data/de_DE/champion.json`).data),
      items: Object.values(require(`../frontend/data/de_DE/item.json`).data),
      itemBin: Object.values(require(`../frontend/data/item.bin.json`)),
      version: staticData.version
    };
  
    ctx.LPTE.on(namespace, 'request-constants', (e: any) => {
      ctx.LPTE.emit({
        meta: {
          type: e.meta.reply,
          namespace: 'reply',
          version: 1,
          reply: e.meta.reply
        },
        constants: gameStatic
      });
    });
  })
};
