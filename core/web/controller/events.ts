import { Router } from 'express';

import lpteService from '../../eventbus/LPTEService';

export default (globalContext: any) => {
  const router = Router();

  router.get('/', (req, res) => {
    res.render('events',
    {
      ...globalContext,
      title: 'Events',
      events: lpteService.eventHistory 
    });
  });
  router.get('/api', (req, res) => {
    res.json(lpteService.eventHistory.map(evt => JSON.stringify(evt)));
  });

  return router;
}
