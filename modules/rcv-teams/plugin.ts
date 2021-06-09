import type { GfxState } from './types/GfxState'
import util from 'util';

const namespace = 'rcv-teams';

const initialState : GfxState = {
  state: "NO_TEAMS",
  teams: {},
  bestOf: 1
}

module.exports = async (ctx: any) => {
  let gfxState = initialState;

  // Register new UI page
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'OP: rcv-teams',
      frontend: 'frontend',
      id : 'op-rcv-teams'
    }]
  });

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request-current', (e: any) => {
    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply,
        namespace: 'reply',
        version: 1
      },
      state: gfxState.state,
      teams: gfxState.teams,
      bestOf: gfxState.bestOf,
    });
  });

  ctx.LPTE.on(namespace, 'set', async (e: any) => {
    if (util.isDeepStrictEqual(gfxState.teams, e.teams)) return

    if (gfxState.teams.blueTeam?.name == e.teams.redTeam.name && gfxState.teams.redTeam?.name == e.teams.blueTeam.name) {
      ctx.LPTE.request({
        meta: {
          type: 'updateOne',
          namespace: 'database',
          version: 1
        },
        collection: 'match',
        id: gfxState.id,
        data: {
          teams: {
            blueTeam: e.teams.redTeam,
            redTeam: e.teams.blueTeam
          },
          bestOf: e.bestOf
        }
      });
    } else if (gfxState.teams.blueTeam?.name == e.teams.blueTeam.name && gfxState.teams.redTeam?.name == e.teams.redTeam.name) {
      ctx.LPTE.request({
        meta: {
          type: 'updateOne',
          namespace: 'database',
          version: 1
        },
        collection: 'match',
        id: gfxState.id,
        data: {
          teams: {
            blueTeam: e.teams.blueTeam,
            redTeam: e.teams.redTeam
          },
          bestOf: e.bestOf
        }
      });
    } else {
      const response = await ctx.LPTE.request({
        meta: {
          type: 'insertOne',
          namespace: 'database',
          version: 1
        },
        collection: 'match',
        data: {
          teams: {
            blueTeam: e.teams.blueTeam,
            redTeam: e.teams.redTeam
          },
          bestOf: e.bestOf
        }
      });
      gfxState.id = response.id
    }

    gfxState.state = 'READY';
    gfxState.teams = e.teams
    gfxState.bestOf = e.bestOf
  });

  ctx.LPTE.on(namespace, 'swop', (e: any) => {
    if (gfxState.state !== 'READY') return
    if (!gfxState.teams.redTeam || !gfxState.teams.blueTeam) return

    gfxState.teams = {
      blueTeam: gfxState.teams.redTeam,
      redTeam: gfxState.teams.blueTeam
    }
  });

  ctx.LPTE.on(namespace, 'unset', (e: any) => {
    gfxState = {
      state: "NO_TEAMS",
      teams: {},
      bestOf: 1
    }
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
};
