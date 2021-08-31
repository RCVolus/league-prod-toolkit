import type { PluginContext } from 'league-prod-toolkit/core/modules/Module'

module.exports = async (ctx: PluginContext) => {
  ctx.LPTE.emit({
    meta: {
      type: 'add-serves',
      namespace: 'ui',
      version: 1
    },
    serves: [{
      frontend: 'frontend',
      id: 'rcv-gfx'
    }]
  });

  ctx.LPTE.emit({
    meta: {
      type: 'plugin-status-change',
      namespace: 'lpt',
      version: 1
    },
    status: 'RUNNING'
  });
};
