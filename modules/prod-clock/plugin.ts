const namespace = 'prod-clock';

module.exports = async (ctx: any) => {
  // Register new UI page
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'Production Clock',
      frontend: 'frontend',
      id : 'prod-clock'
    }]
  });

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request-sync', async (e: any) => {
    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply,
        namespace: 'reply',
        version: 1
      },
      time: new Date().getTime()
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
}
