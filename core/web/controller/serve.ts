import { Router } from 'express'
import { join, relative, isAbsolute } from 'path'
import { pathExists } from 'fs-extra/esm'
import svc from '../../modules/ModuleService.js'
import send from 'send'
import { type GlobalContext } from '../globalContext.js'
import validator from 'validator'

export default (globalContext: GlobalContext): Router => {
  const router = Router()

  router.get('/:serve*', async (req, res) => {
    const anyParams = req.params as any
    const serve = globalContext.module_serves.filter(
      (p) => p.id === anyParams?.serve
    )[0]

    if (serve === undefined) {
      return res
        .status(404)
        .send(`No serve found with name ${validator.default.escape(anyParams?.serve)}`)
    }

    const relativePath = anyParams?.[0] !== '' ? anyParams?.[0] : '/'
    const absolutePath = join(serve.sender.path, serve.frontend, relativePath)

    const relativeCheck = relative(svc.getModulePath(), absolutePath)

    if (relativeCheck.startsWith('..') || isAbsolute(relativeCheck)) {
      return res.status(400).send()
    }

    if (!(await pathExists(absolutePath))) {
      return res.status(404).send()
    }

    send(req, absolutePath).pipe(res)
  })

  return router
}
