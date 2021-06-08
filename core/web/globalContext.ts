import lpte from '../eventbus/LPTEService'

export interface PageDefintion {
  name: string
  id: string
  frontend: string
  sender: any
}

export interface ServeDefinition {
  id: string
  frontend: string
  sender: any
}

export interface GlobalContext {
  module_pages: PageDefintion[]
  module_serves: ServeDefinition[]
}

const context: GlobalContext = {
  module_pages: [],
  module_serves: []
}

lpte.on('ui', 'add-pages', e => {
  const newPages = e.pages as PageDefintion[]

  newPages.forEach(page => {
    context.module_pages = context.module_pages.filter(p => p.id !== page.id)
    context.module_pages.push({
      ...page,
      sender: e.meta.sender
    })
  })
})

lpte.on('ui', 'add-serves', e => {
  const newServes = e.serves as ServeDefinition[]

  newServes.forEach(serve => {
    context.module_serves = context.module_serves.filter(s => s.id !== serve.id)
    context.module_serves.push({
      ...serve,
      sender: e.meta.sender
    })
  })
})

export default context
