import { Router } from 'express'
import { readJSON } from 'fs-extra/esm'
import { fileURLToPath } from 'url';
import { join } from 'path'
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const { version } = await readJSON(join(__dirname, '../../../package.json'))

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
