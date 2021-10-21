import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import type { GfxState } from './types/GfxState'

const namespace = 'rcv-tournament-tree';

const initialState : GfxState = {
  state: "NO_MATCHES",
  matches: [],
  rounds: {}
}

const gameMatrix : [number, number | null][] = [
  [4, null],
  [4, null],
  [5, null],
  [5, null],
  [6, 7],
  [6, 7],
]

module.exports = async (ctx: PluginContext) => {
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
      matches: gfxState.matches,
      rounds: gfxState.rounds
    });
  });

  ctx.LPTE.on(namespace, 'set', async (e: any) => {
    gfxState.state = 'READY';
    gfxState.matches = [...e.matches]
    gfxState.rounds = e.rounds

    for (const match of Object.values(gfxState.matches)) {
      if (match.current_match) {
        ctx.LPTE.emit({
          meta: {
            type: 'set',
            namespace: 'rcv-teams',
            version: 1
          },
          teams: match.teams,
          bestOf: match.bestOf
        });
      }

      if (match.matchId > 5) continue

      const [winGame, loseGame] = gameMatrix[match.matchId]
      if (match.teams.blueTeam.score > match.bestOf / 2) {
        if (match.matchId % 2 == 0) {
          gfxState.matches[winGame].teams.blueTeam = {
            name: match.teams.blueTeam.name,
            tag: match.teams.blueTeam.tag,
            score: gfxState.matches[winGame].teams.blueTeam.score
          }
        } else {
          gfxState.matches[winGame].teams.redTeam = {
            name: match.teams.blueTeam.name,
            tag: match.teams.blueTeam.tag,
            score: gfxState.matches[winGame].teams.redTeam.score
          }
        }

        if (!loseGame) continue

        if (match.matchId % 2 == 0) {
          gfxState.matches[loseGame].teams.blueTeam = {
            name: match.teams.redTeam.name,
            tag: match.teams.redTeam.tag,
            score: gfxState.matches[loseGame].teams.blueTeam.score
          }
        } else {
          gfxState.matches[loseGame].teams.redTeam = {
            name: match.teams.redTeam.name,
            tag: match.teams.redTeam.tag,
            score: gfxState.matches[loseGame].teams.redTeam.score
          }
        }
      } else if (match.teams.redTeam.score > match.bestOf / 2) {
        if (match.matchId % 2 == 0) {
          gfxState.matches[winGame].teams.blueTeam = {
            name: match.teams.redTeam.name,
            tag: match.teams.redTeam.tag,
            score: gfxState.matches[winGame].teams.blueTeam.score
          }
        } else {
          gfxState.matches[winGame].teams.redTeam = {
            name: match.teams.redTeam.name,
            tag: match.teams.redTeam.tag,
            score: gfxState.matches[winGame].teams.redTeam.score
          }
        }

        if (!loseGame) continue

        if (match.matchId % 2 == 0) {
          gfxState.matches[loseGame].teams.blueTeam = {
            name: match.teams.blueTeam.name,
            tag: match.teams.blueTeam.tag,
            score: gfxState.matches[loseGame].teams.blueTeam.score
          }
        } else {
          gfxState.matches[loseGame].teams.redTeam = {
            name: match.teams.blueTeam.name,
            tag: match.teams.blueTeam.tag,
            score: gfxState.matches[loseGame].teams.redTeam.score
          }
        }
      }
    }

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      state: gfxState.state,
      matches: gfxState.matches,
      rounds: gfxState.rounds
    });
  });

  ctx.LPTE.on(namespace, 'unset', (e: any) => {
    gfxState.state = 'NO_MATCHES';
    gfxState.matches = []
    gfxState.rounds = {}

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      state: gfxState.state,
      matches: gfxState.matches,
      rounds: gfxState.rounds
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
