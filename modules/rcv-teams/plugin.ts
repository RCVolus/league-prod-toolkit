import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import type { GfxState } from './types/GfxState'
import util from 'util';
import endOfDay from 'date-fns/endOfDay'
import startOfDay from 'date-fns/startOfDay'

const namespace = 'rcv-teams';

const initialState : GfxState = {
  state: "NO_MATCH",
  teams: {},
  bestOf: 1,
  roundOf: 2
}

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
      name: 'OP: rcv-teams',
      frontend: 'frontend',
      id : 'op-rcv-teams'
    }]
  });

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request-current', async (e: any) => {
    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply,
        namespace: 'reply',
        version: 1
      },
      state: gfxState.state,
      teams: gfxState.teams,
      bestOf: gfxState.bestOf,
      roundOf: gfxState.roundOf
    });
  });

  ctx.LPTE.on(namespace, 'request-matches-of-the-day', async (e: any) => {
    const res = await ctx.LPTE.request({
      meta: {
        type: 'request',
        namespace: 'database',
        version: 1
      },
      collection: 'match',
      filter: {
        "date": {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date())
        }
      },
      sort: {"date": 1},
    })

    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply,
        namespace: 'reply',
        version: 1
      },
      matches: res
    });
  });

  ctx.LPTE.on(namespace, 'set', async (e: any) => {
    if (util.isDeepStrictEqual(gfxState.teams, e.teams) && gfxState.bestOf == e.bestOf && gfxState.roundOf == e.roundOf) return

    if (gfxState.teams.blueTeam?.name == e.teams.redTeam.name && gfxState.teams.redTeam?.name == e.teams.blueTeam.name) {
      ctx.LPTE.emit({
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
          bestOf: e.bestOf,
          roundOf: e.roundOf
        }
      });
    } else if (gfxState.teams.blueTeam?.name == e.teams.blueTeam.name && gfxState.teams.redTeam?.name == e.teams.redTeam.name) {
      ctx.LPTE.emit({
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
          bestOf: e.bestOf,
          roundOf: e.roundOf
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
          bestOf: e.bestOf,
          roundOf: e.roundOf,
          date: new Date()
        }
      });

      if (response === undefined) {
        return ctx.log.warn('match could not be inserted')
      }
      gfxState.id = response.id
    }

    gfxState.state = 'READY';
    gfxState.teams = e.teams
    gfxState.bestOf = e.bestOf
    gfxState.roundOf = e.roundOf

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      state: gfxState.state,
      teams: gfxState.teams,
      bestOf: gfxState.bestOf,
      roundOf: gfxState.roundOf
    });
  });

  ctx.LPTE.on(namespace, 'swop', (e: any) => {
    if (gfxState.state !== 'READY') return
    if (!gfxState.teams.redTeam || !gfxState.teams.blueTeam) return

    gfxState.teams = {
      blueTeam: gfxState.teams.redTeam,
      redTeam: gfxState.teams.blueTeam
    }

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      state: gfxState.state,
      teams: gfxState.teams,
      bestOf: gfxState.bestOf,
      roundOf: gfxState.roundOf
    });
  });

  ctx.LPTE.on(namespace, 'unset', (e: any) => {
    gfxState = {
      state: "NO_MATCH",
      teams: {},
      bestOf: 1,
      roundOf: 2
    }

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      state: gfxState.state,
      teams: gfxState.teams,
      bestOf: gfxState.bestOf,
      roundOf: gfxState.roundOf
    });
  });

  ctx.LPTE.on(namespace, 'clear-matches', (e: any) => {
    ctx.LPTE.emit({
      meta: {
        namespace: 'database',
        type: 'delete',
        version: 1
      },
      collection: 'match',
      filter: {}
    });

    gfxState = {
      state: "NO_MATCH",
      teams: {},
      bestOf: 1,
      roundOf: 2
    }

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      state: gfxState.state,
      teams: gfxState.teams,
      bestOf: gfxState.bestOf,
      roundOf: gfxState.roundOf
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

  await ctx.LPTE.await('lpt', 'ready', 150000);

  ctx.LPTE.emit({
    meta: {
      type: 'createCollection',
      namespace: 'database',
      version: 1
    },
    collection: 'match'
  });

  if (gfxState.state == "NO_MATCH") {
    const res = await ctx.LPTE.request({
      meta: {
        type: 'request',
        namespace: 'database',
        version: 1
      },
      collection: 'match',
      filter: {
        "date": {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date())
        }
      },
      sort: {"date":1},
      limit: 1
    })

    if (res === undefined) {
      return ctx.log.warn('matches could not be loaded')
    }

    if (res.data[0]) {
      gfxState.state = "READY"
      gfxState.teams = res.data[0].teams
      gfxState.bestOf = res.data[0].bestOf
      gfxState.id = res.data[0]._id
      gfxState.roundOf = res.data[0].roundOf
    } 
  }
};
