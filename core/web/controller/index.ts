import { type Router } from 'express'

import modules from './modules'
import home from './home'
import plugins from './plugins'
import events from './events'
import api from './api'
import pages from './pages'
import serve from './serve'
import keys from './keys'

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
