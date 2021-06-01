const extendLiveGameWithStatic = require('./extendLiveGameWithStatic');
const convertChampselect = require('./champselect')

const namespace = 'state-league';

module.exports = (ctx) => {
  const gameState = {
    state: 'UNSET',
    webLive: {},
    webMatch: {},
    timeline: {},
    lcu: {
      lobby: {},
      isLobbyAvailable: false,
      champselect: {},
      isChampselectAvailable: false,
      eog: {},
      isEogAvailable: false
    },
    ingameSpectator: {}
  };

  // Register new UI page
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'LoL Game: Operator',
      frontend: 'frontend',
      id: 'op-lol-game'
    }]
  });

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request', e => {
    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply,
        namespace: 'reply',
        version: 1
      },
      state: gameState
    });
  });

  // Set game
  ctx.LPTE.on(namespace, 'set-game', async e => {
    const replyMeta = {
      namespace: 'reply',
      type: e.meta.reply,
      version: 1
    };

    if (e.by === 'summonerName') {
      // Load game using provider-webapi
      ctx.log.debug(`Loading livegame for summoner=${e.summonerName}`);
      const gameResponse = await ctx.LPTE.request({
        meta: {
          namespace: 'provider-webapi',
          type: 'fetch-livegame',
          version: 1
        },
        summonerName: e.summonerName
      });

      if (!gameResponse || gameResponse.failed) {
        ctx.log.info(`Loading livegame failed for summoner=${e.summonerName}`);
        ctx.LPTE.emit({
          meta: replyMeta
        });
        return;
      }

      const staticData = await ctx.LPTE.request({
        meta: {
          namespace: 'static-league',
          type: 'request-constants',
          version: 1
        }
      });

      gameState.webLive = extendLiveGameWithStatic(gameResponse.game, staticData.constants);
      gameState.state = 'SET';

      ctx.LPTE.emit({
        meta: {
          namespace,
          type: 'game-loaded',
          version: 1
        },
        webLive: gameState.webLive
      });

      ctx.LPTE.emit({
        meta: replyMeta,
        webLive: gameState.webLive
      });
    } else if (e.by === 'gameId') {
      if (!e.gameId) {
        e.gameId = gameState.webLive.gameId;
      }

      // Load game using provider-webapi
      ctx.log.debug(`Loading match for gameId=${e.gameId}`);
      const gameResponse = await ctx.LPTE.request({
        meta: {
          namespace: 'provider-webapi',
          type: 'fetch-match',
          version: 1
        },
        matchId: e.gameId
      });

      if (!gameResponse || gameResponse.failed) {
        ctx.log.info(`Loading livegame failed for gameId=${e.gameId}`);
        ctx.LPTE.emit({
          meta: replyMeta
        });
        return;
      }

      gameState.webMatch = gameResponse.match;
      gameState.timeline = gameResponse.timeline;
      gameState.state = 'SET';

      // Overwrite participants from names
      gameState.webLive.participants?.forEach((participant, index) => {
        gameState.webMatch.participants[index].summonerName = participant.summonerName;
      })

      ctx.LPTE.emit({
        meta: replyMeta,
        webMatch: gameState.webMatch
      })
    }
  });

  ctx.LPTE.on(namespace, 'unset-game', e => {
    gameState.state = 'UNSET';

    ctx.LPTE.emit({
      meta: {
        namespace: 'reply',
        type: e.meta.reply,
        version: 1
      }
    });
  });

  // Listen to external events
  // LCU
  ctx.LPTE.on('lcu', 'lcu-lobby-create', () => {
    gameState.lcu.isLobbyAvailable = true;
    gameState.lcu.lobby = e.data;
  });
  ctx.LPTE.on('lcu', 'lcu-lobby-update', e => {
    gameState.lcu.isLobbyAvailable = true;
    gameState.lcu.lobby = e.data;
  });
  ctx.LPTE.on('lcu', 'lcu-lobby-delete', () => {
    gameState.lcu.isLobbyAvailable = false;
  });
  ctx.LPTE.on('lcu', 'lcu-champ-select-create', () => {
    gameState.lcu.isChampselectAvailable = true;
  });
  ctx.LPTE.on('lcu', 'lcu-champ-select-update', e => {
    gameState.lcu.isChampselectAvailable = true;
    gameState.lcu.champselect = convertChampselect(gameState, e.data);

    ctx.LPTE.emit({
      meta: {
        namespace,
        type: 'champselect-update'
      },
      data: gameState.lcu.champselect,
      isActive: gameState.lcu.isChampselectAvailable
    });
  });
  ctx.LPTE.on('lcu', 'lcu-champ-select-delete', () => {
    gameState.lcu.isChampselectAvailable = false;
    
    ctx.LPTE.emit({
      meta: {
        namespace,
        type: 'champselect-update'
      },
      data: gameState.lcu.champselect,
      isActive: gameState.lcu.isChampselectAvailable
    });
  });
  ctx.LPTE.on('lcu', 'lcu-end-of-game-create', e => {
    gameState.lcu.isEogAvailable = true;
    gameState.lcu.eog = e.data;
  });
  ctx.LPTE.on('lcu', 'lcu-end-of-game-update', e => {
    gameState.lcu.isEogAvailable = true;
    gameState.lcu.eog = e.data;
  });
  ctx.LPTE.on('lcu', 'lcu-end-of-game-delete', () => {
    gameState.lcu.isEogAvailable = false;
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
