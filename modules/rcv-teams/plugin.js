const namespace = 'rcv-teams';

const initialState = {
  state: "NO_TEAMS",
  teams: [],
  bestOf: 1
}

module.exports = (ctx) => {
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
  ctx.LPTE.on(namespace, 'request', e => {
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

  ctx.LPTE.on(namespace, 'set', e => {
    gfxState.state = 'READY';
    gfxState.teams = e.teams
    gfxState.bestOf = e.bestOf
  });

  ctx.LPTE.on(namespace, 'swop', e => {
    if (gfxState.state !== 'READY') return

    gfxState.teams = {
      blueTeam: gfxState.teams.redTeam,
      redTeam: gfxState.teams.blueTeam
    }
  });

  ctx.LPTE.on(namespace, 'unset', e => {
    gfxState.state = 'NO_TEAMS';
    gfxState.teams = []
    gfxState.bestOf = 1
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
