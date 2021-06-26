import { couldStartTrivia } from 'typescript';
import type { GfxState } from './types/GfxState'

const namespace = 'rcv-caster';

const initialState : GfxState = {
  state: "NO_CASTER",
  caster: []
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
      state: gfxState.state,
      caster: gfxState.caster
    });
  });

  ctx.LPTE.on(namespace, 'set', async (e: any) => {
    const casterRes = await ctx.LPTE.request({
      meta: {
        type: 'request',
        namespace: 'database',
        version: 1
      },
      collection: 'caster',
      id: e.caster
    })

    gfxState.state = 'READY';
    gfxState.caster = casterRes.data

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      state: gfxState.state,
      caster: gfxState.caster
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
      collection: 'caster'
    })

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
      collection: 'caster'
    })

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
      collection: 'caster'
    })

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
    if (gfxState.state !== 'READY') return
    if (!gfxState.caster[0] || !gfxState.caster[1]) return

    const newCaster = [gfxState.caster[1], gfxState.caster[0]]
    gfxState.caster = newCaster

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      state: gfxState.state,
      caster: gfxState.caster
    });
  });

  ctx.LPTE.on(namespace, 'unset', (e: any) => {
    gfxState = {
      state: "NO_CASTER",
      caster: []
    }

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      state: gfxState.state,
      caster: gfxState.caster
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

  ctx.LPTE.emit({
    meta: {
      type: 'createCollection',
      namespace: 'database',
      version: 1
    },
    collection: 'caster'
  });
}
