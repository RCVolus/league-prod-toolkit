import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { EndOfGameData } from './handleData';
import { EndOfGame } from './types/EndOfGame';
const namespace = 'league-end-of-game';

module.exports = async (ctx: PluginContext) => {
  let state : {
    status: "NO_GAME" | "GAME_LOADED"
    displayState: "ITEMS" | "DAMAGE"
    teams: {
      [id: number]: EndOfGame.Team
    }
    participants: {
      [id: number]: EndOfGame.Participant
    }
    goldFrames: {
      [timestamp: number]: number
    }
  } = {
    status: "NO_GAME",
    displayState: "ITEMS",
    teams: {},
    participants: {},
    goldFrames: {}
  }

  // Register new UI page
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'OP: league-end-of-game',
      frontend: 'frontend',
      id : 'op-league-end-of-game'
    }]
  });

  ctx.LPTE.on(namespace, 'end-of-game', async e => {
    state.displayState = e.state
  });

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request', e => {
    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply!,
        namespace: 'reply',
        version: 1
      },
      state
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

  await ctx.LPTE.await('lpt', 'ready', 120000);

  ctx.LPTE.on('state-league', 'match-game-loaded', e => {
    const matchData = e.web.match
    const timelineData = e.web.timeline

    const emdOfGameData = new EndOfGameData(matchData, timelineData)

    emdOfGameData.onReady(() => {
      state.status = "GAME_LOADED"
      state.teams = emdOfGameData.teams
      state.participants = emdOfGameData.participants
      state.goldFrames = emdOfGameData.goldFrames

      ctx.LPTE.emit({
        meta: {
          namespace,
          type: 'update',
          version: 1
        }, 
        state
      })
    })
  })
};
