import { Router } from 'express'
import { join, relative, isAbsolute } from 'path'
import { pathExists } from 'fs-extra'
import svc from '../../modules/ModuleService'
import send from 'send'
import { type GlobalContext } from '../globalContext'
import escape from 'validator/lib/escape'

export default (globalContext: GlobalContext): Router => {
  const router = Router()

  router.get(['/:serve{/*ext}'], async (req, res) => {
    const anyParams = req.params
    const serve = globalContext.module_serves.filter(
      (p) => p.id === anyParams?.serve
    )[0]

    if (serve === undefined) {
      return res
        .status(404)
        .send(`No serve found with name ${escape(anyParams?.serve)}`)
    }

    const ext = anyParams.ext;
    const relativePath = Array.isArray(ext)
      ? ext.join("/")
      : typeof ext === "string"
        ? ext
        : "";

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
