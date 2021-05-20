import { Router } from 'express';

import moduleService from '../../modules/ModuleService';

export default (globalContext: any) => {
  const router = Router();

  router.get('/', (req, res) => {
    res.render('modules', 
    {
      ...globalContext,
      title: 'Modules',
      modules: moduleService.modules
    });
  });
  router.get('/api', (req, res) => {
    res.json(moduleService.modules.map((module) => module.toJson()));
  });

  return router;
}
