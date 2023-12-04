import { Router } from 'express'

import lpteService from '../../eventbus/LPTEService.js'

export default (globalContext: any): Router => {
  const router = Router()

  router.get('/', (req, res) => {
    res.render('events', {
      ...globalContext,
      title: 'Events',
      events: lpteService.eventHistory
    })
  })
  router.get('/api', (req, res) => {
    res.json(lpteService.eventHistory.map((evt) => JSON.stringify(evt)))
  })

  return router
}
