import { Router } from 'express'

import lpteService from '../../eventbus/LPTEService'

export default (globalContext: any): Router => {
  const router = Router()

  const getKeys = async (): Promise<any[]> => {
    const res = await lpteService.request({
      meta: {
        type: 'request',
        namespace: 'database',
        version: 1
      },
      collection: 'key',
      limit: 30
    })

    if (res === undefined) return []

    return res.data
  }

  router.get('/', async (req, res) => {
    res.render('keys',
      {
        ...globalContext,
        title: 'Api Keys',
        keys: await getKeys()
      })
  })
  router.get('/api', (req, res) => {
    res.json(async () => await getKeys())
  })

  return router
}
