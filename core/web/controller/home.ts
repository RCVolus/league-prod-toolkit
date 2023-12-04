import { Router } from 'express'
import { readJSON } from 'fs-extra/esm'

const { version } = await readJSON('../../../package.json')

export default (globalContext: any): Router => {
  const router = Router()

  router.get('/', (req, res) => {
    res.render('index', {
      ...globalContext,
      title: 'Home',
      version
    })
  })

  return router
}
