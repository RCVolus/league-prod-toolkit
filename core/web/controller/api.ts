import { Router } from 'express'

import lpte from '../../eventbus/LPTEService.js'

const router = Router()

router.post('/events/ingest', (req, res) => {
  lpte.emit(req.body)
  res.status(200).send({})
})

router.get('/events/shortcut/ingest/:namespace/:type', (req, res) => {
  lpte.emit({
    meta: {
      namespace: req.params.namespace,
      type: req.params.type,
      version: 1
    },
    ...req.query
  })
  res.status(200).send({})
})

router.post('/events/shortcut/ingest/:namespace/:type', (req, res) => {
  lpte.emit({
    meta: {
      namespace: req.params.namespace,
      type: req.params.type,
      version: 1
    },
    ...req.body
  })
  res.status(200).send({})
})

router.post('/events/request', async (req, res) => {
  const response = await lpte.request(req.body)

  if (response != null) {
    return res.status(200).send(response)
  }
  return res.status(500).send({
    error: 'request timed out'
  })
})

router.get('/events/shortcut/request/:namespace/:type', async (req, res) => {
  const response = await lpte.request(
    {
      meta: {
        namespace: req.params.namespace,
        type: req.params.type,
        version: 1
      }
    },
    isNaN(parseInt(req.query.timeout as string))
      ? 1000
      : parseInt(req.query.timeout as string)
  )

  if (response != null) {
    return res.status(200).send(response)
  }
  return res.status(500).send({
    error: 'request timed out'
  })
})

export default router
