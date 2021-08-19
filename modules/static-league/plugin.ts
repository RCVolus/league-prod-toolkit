import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import path from 'path'
import express from 'express'
const app = express()
import getGameVersion from "./functions/gameVersion"
import getDDragon from "./functions/ddragon"
import centeredImg from "./functions/centeredImg"
import additionalFiles from "./functions/additionalFiles"

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

  let gameVersion: string
  if (!config.gameVersion) {
    gameVersion = await getGameVersion()
  } else {
    gameVersion = config.gameVersion
  }

  getDDragon(gameVersion, ctx, function () {
    additionalFiles(ctx, gameVersion)
    centeredImg(ctx, gameVersion, finishUp)
  }, finishUp)

  function finishUp () {
    const champs = path.join(__dirname, `../data/img/champion`)
    app.use('/img/champion', express.static(champs));

    const champSquare = path.join(__dirname, `../data/${gameVersion}/img/champion`)
    app.use('/img/champion/square', express.static(champSquare));
  
    const perks = path.join(__dirname, `../data/img/perk-images/Styles`)
    app.use('/img/perk', express.static(perks));

    const items = path.join(__dirname, `../data/${gameVersion}/img/item`)
    app.use('/img/item', express.static(items));
  
    const summonerSpells = path.join(__dirname, `../data/img/summoner-spell`)
    app.use('/img/summoner-spell', express.static(summonerSpells));

    const drakes = path.join(__dirname, `../data/img/drakes`)
    app.use('/img/drakes', express.static(drakes));

    const profileIcons = path.join(__dirname, `../data/${gameVersion}/img/item`)
    app.use('/img/profileicon', express.static(profileIcons));
  
    const port = config.port || 5656
    app.listen(port, () => {
      ctx.log.info(`static files get served at http://localhost:${port}`)
    })
  
    const gameStatic = {
      seasons: require(`../constants/seasons.json`),
      queues: require(`../constants/queues.json`),
      maps: require(`../data/${gameVersion}/data/de_DE/map.json`),
      gameModes: require(`../constants/gameModes.json`),
      gameTypes: require(`../constants/gameTypes.json`),
      perks: require(`../data/${gameVersion}/data/de_DE/runesReforged.json`),
      champions: Object.values(require(`../data/${gameVersion}/data/de_DE/champion.json`).data),
      items: Object.values(require(`../data/${gameVersion}/data/de_DE/item.json`).data),
      itemBin: Object.values(require(`../data/${gameVersion}/data/de_DE/item.bin.json`)),
      version: gameVersion,
      staticURL: `http://localhost:${port}`
    };
  
    // Answer requests to get state
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

    // Add static serve
    ctx.LPTE.emit({
      meta: {
        type: 'add-serves',
        namespace: 'ui',
        version: 1
      },
      serves: [{
        
        frontend: 'data',
        id: 'static-league'
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
  }
};
