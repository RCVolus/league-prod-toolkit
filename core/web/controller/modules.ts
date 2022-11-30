import { Router } from 'express'

import moduleService from '../../modules/ModuleService'

export default (globalContext: any): Router => {
  const router = Router()

  router.get('/', async (req, res) => {
    res.render('modules', {
      ...globalContext,
      title: 'Modules',
      moduleCount: moduleService.modules.length,
      installedModules: {
        Plugins: moduleService.modules.filter((m) =>
          m.getName().startsWith('plugin')
        ),
        'League Modules': moduleService.modules.filter((m) =>
          m.getName().includes('league')
        ),
        'Valo Modules': moduleService.modules.filter((m) =>
          m.getName().includes('valo')
        ),
        Other: moduleService.modules.filter(
          (m) =>
            !m.getName().startsWith('theme') &&
            !m.getName().includes('valo') &&
            !m.getName().includes('league') &&
            !m.getName().startsWith('plugin')
        )
      },
      availableModuleCount: moduleService.assets.length,
      availableModules: {
        Plugins: moduleService.assets.filter((m) =>
          m.name.startsWith('plugin')
        ),
        'League Modules': moduleService.assets.filter((m) =>
          m.name.includes('league')
        ),
        'Valo Modules': moduleService.assets.filter((m) =>
          m.name.includes('valo')
        ),
        Other: moduleService.assets.filter(
          (m) =>
            !m.name.startsWith('theme') &&
            !m.name.includes('valo') &&
            !m.name.includes('league') &&
            !m.name.startsWith('plugin')
        )
      }
    })
  })
  router.get('/api', (req, res) => {
    res.json(moduleService.modules.map((module) => module.toJson(true)))
  })

  return router
}
