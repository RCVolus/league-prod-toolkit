import { Router } from 'express'
import { join } from 'path'
import send from 'send'

import { GlobalContext } from '../globalContext'

export default (globalContext: GlobalContext): Router => {
  const router = Router()

  router.get('/:serve*', async (req, res) => {
    const anyParams = req.params as any
    const serve = globalContext.module_serves.filter(
      (p) => p.id === anyParams.serve
    )[0]

    if (serve === undefined) {
      return res
        .status(404)
        .send(`No serve found with name ${anyParams.serve as string}`)
    }

    const relativePath = anyParams[0] !== '' ? anyParams[0] : '/'
    const absolutePath = join(serve.sender.path, serve.frontend, relativePath)

    send(req, absolutePath).pipe(res)
  })

  return router
}
