import { Router } from 'express'
import { version } from '../../../package.json'

export default (globalContext: any): Router => {
  const router = Router()

  router.get('/', (req, res) => {
    res.render('index', {
      ...globalContext,
      title: 'Home',
      version: version
    })
  })

  return router
}
