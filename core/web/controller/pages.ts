import { Router } from 'express'
import { join } from 'path'
import send from 'send'
import { readFile } from 'fs/promises'

import { GlobalContext } from '../globalContext'

export default (globalContext: GlobalContext): Router => {
  const router = Router()

  router.get('/:page*', async (req, res) => {
    const anyParams = req.params as any
    const page = globalContext.module_pages.filter(
      (p) => p.id === anyParams.page
    )[0]

    if (page === undefined) {
      return res
        .status(404)
        .send(`No page found with name ${anyParams.page as string}`)
    }

    const relativePath = anyParams[0] !== '' ? anyParams[0] : '/'
    const absolutePath = join(page.sender.path, page.frontend, relativePath)

    if (relativePath === '/') {
      let fileContent
      try {
        fileContent = await readFile(join(absolutePath, 'index.html'), {
          encoding: 'utf8'
        })
      } catch (e) {
        res.status(500).send(e)
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
      send(req, absolutePath).pipe(res)
    }
  })

  return router
}
