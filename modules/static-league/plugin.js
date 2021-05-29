const path = require('path')
const express = require('express')
const app = express()
const getGameVersion = require("./functions/gameVersion")
const getDDragon = require("./functions/ddragon")

const namespace = 'static-league';

module.exports = async (ctx) => {
  const response = await ctx.LPTE.request({
    meta: {
      type: 'request',
      namespace: 'config',
      version: 1
    }
  });
  const config = response.config;

  let gameVersion
  if (!config.gameVersion) {
    gameVersion = await getGameVersion(ctx)
  } else {
    gameVersion = config.gameVersion
  }

  getDDragon(gameVersion, ctx, finishUp)

  function finishUp () {
    const champs = path.join(__dirname, `data/img/champion`)
    app.use('/img/champions', express.static(champs));
    const champSquare = path.join(__dirname, `data/${gameVersion}/img/champion`)
    app.use('/img/champions/square', express.static(champSquare));
  
    const perks = path.join(__dirname, `data/img/perk-images/Styles`)
    app.use('/img/perks', express.static(perks));
  
    const summonerSpells = path.join(__dirname, `img/summonerSpells`)
    app.use('/img/summonerSpells', express.static(summonerSpells));
  
    const port = config.port || 5656
    app.listen(port, () => {
      ctx.log.info(`static files get served at http://localhost:${port}`)
    })
  
    const gameStatic = {
      constants: {
        seasons: require(`./constants/seasons.json`),
        queues: require(`./constants/queues.json`),
        maps: require(`./data/${gameVersion}/data/de_DE/map.json`),
        gameModes: require(`./constants/gameModes.json`),
        gameTypes: require(`./constants/gameTypes.json`),
        perksFlat: require(`./data/${gameVersion}/data/de_DE/runesReforged.json`),
        champions: Object.values(require(`./data/${gameVersion}/data/de_DE/champion.json`).data),
        version: gameVersion,
        staticURL: `http://localhost:${port}`
      }
    };
  
    // Answer requests to get state
    ctx.LPTE.on(namespace, 'request-constants', e => {
      ctx.LPTE.emit({
        meta: {
          type: e.meta.reply,
          namespace: 'reply',
          version: 1
        },
        constants: gameStatic.constants
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
  }
};
