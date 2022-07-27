import type { PluginContext } from '@rcv-prod-toolkit/types'

module.exports = async (ctx: PluginContext) => {
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [
      {
        frontend: 'frontend',
        id: 'rcv-gfx',
        name: 'rcv-gfx'
      }
    ]
  })

  ctx.LPTE.emit({
    meta: {
      type: 'plugin-status-change',
      namespace: 'lpt',
      version: 1
    },
    status: 'RUNNING'
  })
}
