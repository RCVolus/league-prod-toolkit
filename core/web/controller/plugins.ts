import { Router } from 'express'

import moduleService from '../../modules/ModuleService'

export default (globalContext: any): Router => {
  const router = Router()

  router.get('/', (req, res) => {
    res.render('plugins',
      {
        ...globalContext,
        title: 'Plugins',
        plugins: moduleService.activePlugins
      })
  })
  router.get('/api', (req, res) => {
    res.json(moduleService.activePlugins.map((plugin) => plugin.toJson()))
  })

  return router
}
