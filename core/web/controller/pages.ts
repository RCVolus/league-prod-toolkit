import { Router } from 'express'
import { join, relative, isAbsolute } from 'path'
import send from 'send'
import svc from '../../modules/ModuleService'
import { readFile } from 'fs/promises'
import { pathExists } from 'fs-extra'
import { GlobalContext } from '../globalContext'
import escape from 'validator/lib/escape'

export default (globalContext: GlobalContext): Router => {
  const router = Router()

  router.get('/:page*', async (req, res) => {
    const anyParams = req.params as any
    const page = globalContext.module_pages.filter(
      (p) => p.id === anyParams?.page
    )[0]

    if (page === undefined) {
      return res
        .status(404)
        .send(`No page found with name ${escape(anyParams?.page)}`)
    }

    const relativePath = anyParams?.[0] !== '' ? anyParams?.[0] : '/'
    const absolutePath = join(page.sender.path, page.frontend, relativePath)

    if (relativePath === '/') {
      let fileContent
      try {
        fileContent = await readFile(join(absolutePath, 'index.html'), {
          encoding: 'utf8'
        })
      } catch (e: any) {
        res.status(500).send(e.message)
        console.error(e)
        return
      }
      res.render('page_template', {
        ...globalContext,
        fileContent,
        title: page.name,
        pageName: page.id
      })
    } else {
      const relativeCheck = relative(svc.getModulePath(), absolutePath)

      if (relativeCheck.startsWith('..') || isAbsolute(relativeCheck)) {
        return res.status(400).send()
      }

      if (!(await pathExists(absolutePath))) {
        return res.status(404).send()
      }

      send(req, absolutePath).pipe(res)
    }
  })

  return router
}
