import { Router } from 'express'

export default (globalContext: any) => {
  const router = Router()

  router.get('/', (req, res) => {
    res.render('index', {
      ...globalContext,
      title: 'Home',
      version: '0.0.1'
    })
  })

  return router
}
