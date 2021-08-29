import { PluginContext } from 'league-prod-toolkit/core/modules/Module'

const namespace = 'valorant-pregame';

module.exports = async (ctx: PluginContext) => {
  // Register new UI page
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'OP Valorant PreGame',
      frontend: 'frontend',
      id: 'op-valorant-pregame'
    }]
  });

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request', e => {
    
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
