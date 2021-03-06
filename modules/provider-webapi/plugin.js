const LeagueJS = require('leaguejs');

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = async (ctx) => {
  let config = {};
  let riotApi;

  /* const lolRequest = async (realm, api, path) => {
    return new Promise((resolve, reject) => {
      riotApi.request(realm, api, path, (err, data) => {
        if (err) {
          return reject(err);
        }
  
        return resolve(data);
      });
    });
  } */

  ctx.LPTE.on('provider-webapi', 'fetch-livegame', async e => {
    ctx.log.info(`Fetching livegame data for summoner=${e.summonerName}`);

    let retries = 0
    const desiredRetries = e.retries !== undefined ? e.retries : 3

    const replyMeta = {
      type: e.meta.reply,
      namespace: 'reply',
      version: 1
    };

    let summonerInfo;
    try {
      summonerInfo = await riotApi.Summoner.gettingByName(e.summonerName);
    } catch (error) {
      ctx.log.error(`Failed to get information for summoner=${e.summonerName}. Maybe this summoner does not exist? error=${error}`);
      ctx.LPTE.emit({
        meta: replyMeta,
        failed: true
      });
      return;
    }

    let gameInfo;

    while (retries <= desiredRetries) {
      retries++
      try {
        gameInfo = await riotApi.Spectator.gettingActiveGame(summonerInfo.id)
      } catch (error) {
        ctx.log.warn(`Failed to get spectator game information for summoner=${e.summonerName}, encryptedId=${summonerInfo.id}. Maybe this summoner is not ingame currently? Retrying. error=${error}`)
        await sleep(2000)
      }
    }

    if (gameInfo === undefined) {
      ctx.log.error(`Failed to get spectator game information for summoner=${e.summonerName}, encryptedId=${summonerInfo.id}, after retries.`)
      ctx.LPTE.emit({
        meta: replyMeta,
        failed: true
      })
      return
    }

    ctx.log.info(`Fetched livegame for summoner=${e.summonerName}, gameId=${gameInfo.gameId}`)
    ctx.LPTE.emit({
      meta: replyMeta,
      game: gameInfo,
      failed: false
    })
  })

  ctx.LPTE.on('provider-webapi', 'fetch-match', async e => {
    ctx.log.info(`Fetching match data for matchid=${e.matchId}`);

    const replyMeta = {
      type: e.meta.reply,
      namespace: 'reply',
      version: 1
    };

    let gameData;
    try {
      gameData = await riotApi.Match.gettingById(e.matchId);
    } catch (error) {
      ctx.log.error(`Failed to get match information for matchId=${e.matchId}. Maybe the match is not over yet? error=${error}`);
      ctx.LPTE.emit({
        meta: replyMeta,
        failed: true
      });
      return;
    }

    let timelineData;
    try {
      timelineData = await riotApi.Match.gettingTimelineById(e.matchId);
    } catch (error) {
      ctx.log.warn(`Failed to get match timeline for matchId=${e.matchId}. Maybe the match is not over yet? Since this is optional, it will be skipped. error=${error}`);
      return;
    }

    ctx.log.info(`Fetched match for matchId=${e.matchId}, gameId=${gameData.gameId}`);
    ctx.LPTE.emit({
      meta: replyMeta,
      match: gameData,
      timeline: timelineData,
      failed: false
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

  // Wait for all plugins to load
  await ctx.LPTE.await('lpt', 'ready', 120000);

  const response = await ctx.LPTE.request({
    meta: {
      type: 'request',
      namespace: 'config',
      version: 1
    }
  });
  config = response.config;

  riotApi = new LeagueJS(config.apiKey, {
    PLATFORM_ID: 'euw1'
  });
};
