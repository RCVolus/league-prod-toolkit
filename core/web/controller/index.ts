import { type Router } from 'express'

import modules from './modules.js'
import home from './home.js'
import plugins from './plugins.js'
import events from './events.js'
import api from './api.js'
import pages from './pages.js'
import serve from './serve.js'
import keys from './keys.js'

export default (
  globalContext: any
): Record<string, Router> => ({
  '/': home(globalContext),
  '/modules': modules(globalContext),
  '/plugins': plugins(globalContext),
  '/events': events(globalContext),
  '/keys': keys(globalContext),
  '/pages': pages(globalContext),
  '/api': api,
  '/serve': serve(globalContext)
})
