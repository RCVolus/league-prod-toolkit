import { Router } from 'express'

import modules from './modules'
import home from './home'
import plugins from './plugins'
import events from './events'
import api from './api'
import pages from './pages'

export default (globalContext: any): {
  [name: string]: Router
} => ({
  '/': home(globalContext),
  '/modules': modules(globalContext),
  '/plugins': plugins(globalContext),
  '/events': events(globalContext),
  '/pages': pages(globalContext),
  '/api': api
})
