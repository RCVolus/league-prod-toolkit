import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import type { GfxState } from './types/GfxState'

const namespace = 'rcv-caster';

const initialState : GfxState = {
  casterSets: {
    1: [],
    2: []
  }
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
      name: 'OP: rcv-caster',
      frontend: 'frontend',
      id : 'op-rcv-caster'
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
      casterSets: gfxState.casterSets
    });
  });

  ctx.LPTE.on(namespace, 'set', async (e: any) => {
    const set : 1 | 2 = e.set || 1

    const casterRes1 = await ctx.LPTE.request({
      meta: {
        type: 'request',
        namespace: 'database',
        version: 1
      },
      collection: 'caster',
      id: e.caster[0]
    })
    const casterRes2 = await ctx.LPTE.request({
      meta: {
        type: 'request',
        namespace: 'database',
        version: 1
      },
      collection: 'caster',
      id: e.caster[1]
    })

    if (casterRes1 === undefined || casterRes2 === undefined) {
      return ctx.log.warn('one or more of the selected casters could not be found')
    }

    gfxState.casterSets[set] = [casterRes1.data[0], casterRes2.data[0]]

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      casterSets: gfxState.casterSets
    });
  });

  ctx.LPTE.on(namespace, 'delete-caster', async (e: any) => {
    await ctx.LPTE.request({
      meta: {
        type: 'deleteOne',
        namespace: 'database',
        version: 1
      },
      collection: 'caster',
      id: e._id
    });

    const res = await ctx.LPTE.request({
      meta: {
        type: 'request',
        namespace: 'database',
        version: 1
      },
      collection: 'caster',
      limit: 30
    })

    if (res === undefined) {
      return ctx.log.warn('casters could not be loaded')
    }

    ctx.LPTE.emit({
      meta: {
        type: 'update-caster-set',
        namespace,
        version: 1
      },
      caster: res.data
    });
  });

  ctx.LPTE.on(namespace, 'add-caster', async (e: any) => {
    await ctx.LPTE.request({
      meta: {
        type: 'insertOne',
        namespace: 'database',
        version: 1
      },
      collection: 'caster',
      data: {
        name: e.name,
        platform: e.platform,
        handle: e.handle,
      }
    });

    const res = await ctx.LPTE.request({
      meta: {
        type: 'request',
        namespace: 'database',
        version: 1
      },
      collection: 'caster',
      limit: 30
    })

    if (res === undefined) {
      return ctx.log.warn('casters could not be loaded')
    }

    ctx.LPTE.emit({
      meta: {
        type: 'update-caster-set',
        namespace,
        version: 1
      },
      caster: res.data
    });
  });

  ctx.LPTE.on(namespace, 'request-caster', async (e: any) => {
    const res = await ctx.LPTE.request({
      meta: {
        type: 'request',
        namespace: 'database',
        version: 1
      },
      collection: 'caster',
      limit: 30
    })

    if (res === undefined) {
      return ctx.log.warn('casters could not be loaded')
    }

    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply,
        namespace: 'reply',
        version: 1
      },
      caster: res.data
    });
  });

  ctx.LPTE.on(namespace, 'swop', (e: any) => {
    const set : 1 | 2 = e.set || 1
    
    if (!gfxState.casterSets[set][0] || !gfxState.casterSets[set][1]) return

    const newCaster = [gfxState.casterSets[set][1], gfxState.casterSets[set][0]]
    gfxState.casterSets[set] = newCaster

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      casterSets: gfxState.casterSets
    });
  });

  ctx.LPTE.on(namespace, 'unset', (e: any) => {
    const set : 1 | 2 = e.set || 1
    gfxState.casterSets[set] = []

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      casterSets: gfxState.casterSets
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
    collection: 'caster'
  });
}
