import { EventType } from '../eventbus/LPTE'
import lpte from '../eventbus/LPTEService'

export type PageDefintion = {
  name: string,
  id: string,
  frontend: string,
  sender: any
}

export type GlobalContext = {
  module_pages: Array<PageDefintion>
}

const context: GlobalContext = {
  module_pages: []
}

lpte.on('ui', 'add-pages', e => {
  const newPages = e.pages as Array<PageDefintion>;

  newPages.forEach(page => {
    context.module_pages = context.module_pages.filter(p => p.id !== page.id);
    context.module_pages.push({
      ...page,
      sender: e.meta.sender
    });
  });
});

export default context;