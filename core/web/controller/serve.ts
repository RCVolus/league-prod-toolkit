import { Router } from 'express'
import { join, relative, isAbsolute } from 'path'
import { pathExists } from 'fs-extra'
import svc from '../../modules/ModuleService'
import send from 'send'
import { GlobalContext } from '../globalContext'
import { check } from 'express-validator'

export default (globalContext: GlobalContext): Router => {
  const router = Router()

  router.get('/:serve*', check('serve'), async (req, res) => {
    const anyParams = req.params
    const serve = globalContext.module_serves.filter(
      (p) => p.id === anyParams?.serve
    )[0]

    if (serve === undefined) {
      return res
        .status(404)
        .send(`No serve found with name ${anyParams?.serve as string}`)
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
