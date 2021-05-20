import { Router } from 'express';
import path from 'path';
import send from 'send';
import fs from 'fs';
import util from 'util';

const readFile = util.promisify(fs.readFile);

import { GlobalContext } from '../globalContext';

export default (globalContext: GlobalContext) => {
  const router = Router();

  router.get('/:page*', async (req, res) => {
    const page = globalContext.module_pages.filter(p => p.id === req.params.page)[0];

    let relativePath = req.params[0] || '/';
    const absolutePath = path.join(page.sender.path, page.frontend, relativePath);

    if (relativePath === '/') {
      const fileContent = await readFile(path.join(absolutePath, 'index.html'), { encoding: 'utf8' });
      res.render('page_template', 
      {
        ...globalContext,
        fileContent,
        title: page.name,
        pageName: page.id
      });
    } else {
      send(req, absolutePath).pipe(res);
    }
  });

  return router;
}