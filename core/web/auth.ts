import LPTEService from '../eventbus/LPTEService'
import { IncomingMessage } from 'http'
import WebSocket from 'ws'
import uuidAPIKey from 'uuid-apikey'
import logging from '../logging'
import { OutgoingHttpHeaders } from 'http2'
import { Express, NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import ModuleType from '../modules/ModuleType'

const log = logging('auth')

const allowedKeys: Set<string> = new Set()

let config: any

export async function runAuth (server: Express, wss: WebSocket.Server): Promise<void> {
  const configReq = await LPTEService.request({
    meta: {
      type: 'request',
      namespace: 'config',
      version: 1,
      sender: {
        name: 'auth',
        version: '1.0.0',
        mode: ModuleType.STANDALONE
      }
    }
  })

  config = configReq?.config
  const authActive = config.enabled as boolean

  if (!authActive) {
    server.all('*', (req, res, next) => {
      res.cookie('auth_disabled', true)
      next()
    })
    return
  }

  log.info('=========================')
  log.info('Authentication is enabled')

  allowedKeys.add(config['super-api-key'])

  log.info(`Admin API key: ${config['super-api-key'] as string}`)
  log.info('=========================')

  wss.options.verifyClient = verifyWSClient
  server.all('*', verifyEPClient)

  server.get('/login', (req, res) => {
    res.render('login', {
      title: 'Login',
      version: '0.0.1'
    })
  })
  server.post('/login', login)
  server.get('/logout', logout)

  await getKeys()
}

async function getKeys (): Promise<void> {
  const keys = await LPTEService.request({
    meta: {
      type: 'request',
      namespace: 'database',
      version: 1
    },
    collection: 'key'
  })

  if (keys === undefined || keys.data?.length <= 0) return
  const cDate = new Date().getTime()

  for (const key of keys.data) {
    if (key.expiring !== -1 && key.expiring < cDate) continue

    allowedKeys.add(key.apiKey)
  }
}

LPTEService.on('auth', 'add-key', (e) => {
  const { apiKey } = uuidAPIKey.create()

  LPTEService.emit({
    meta: {
      namespace: 'database',
      type: 'insertOne',
      version: 1
    },
    collection: 'key',
    data: {
      apiKey: 'RCVPT-' + apiKey,
      description: e.description,
      expiring: e.neverExpires as boolean ? -1 : new Date(e.expiring).getTime()
    }
  })

  allowedKeys.add('RCVPT-' + apiKey)
})

LPTEService.on('auth', 'remove-key', (e) => {
  LPTEService.emit({
    meta: {
      namespace: 'database',
      type: 'deleteOne',
      version: 1
    },
    collection: 'key',
    id: e._id
  })

  allowedKeys.delete(e.apiKey)
})

function verifyWSClient (
  info: { origin: string, secure: boolean, req: IncomingMessage },
  done: (res: boolean, code?: number, message?: string, headers?: OutgoingHttpHeaders) => void
): void {
  if (!verify(info.req.url)) {
    return done(false, 403, 'authentication failed')
  }

  return done(true)
}

function verifyEPClient (req: Request, res: Response, next: NextFunction): void {
  if (req.path.startsWith('/login')) return next()
  if (req.path.endsWith('.js') || req.path.endsWith('.css') || req.path.endsWith('.png') || req.path.endsWith('.jpg') || req.path.endsWith('.svg')) return next()
  if (!verify(req.url, req.cookies)) {
    return res
      .status(403)
      .redirect('/login')
  }

  return next()
}

function verify (url?: string, cookies?: any): boolean {
  const queryString = url?.split('?')[1]

  if (queryString !== undefined) {
    const query = new URLSearchParams(queryString)

    if (query.has('apikey') && allowedKeys.has(query.get('apikey') as string)) {
      return true
    }
  }

  if (cookies?.access_token !== undefined) {
    try {
      const key = jwt.verify(cookies.access_token, config.secreteKey) as jwt.JwtPayload

      if (key.apiKey !== undefined && allowedKeys.has(key.apiKey as string)) {
        return true
      }

      return false
    } catch (e) {
      log.warn(e)
      return false
    }
  }

  return false
}

async function login (req: Request, res: Response): Promise<void> {
  const { apiKey } = req.body

  if (apiKey === undefined) {
    res.send('key is missing in request').status(400)
    return
  }

  const key = await LPTEService.request({
    meta: {
      type: 'request',
      namespace: 'database',
      version: 1
    },
    collection: 'key',
    filter: { apiKey }
  })

  if ((key?.data === undefined || key.data.length <= 0) && config['super-api-key'] !== apiKey) {
    res.send('key does not exists').status(403)
    return
  }

  const cKey = key?.data[0] ?? {
    apiKey,
    description: 'Super-Key',
    expiring: -1
  }
  const cTime = new Date().getTime()

  if (cKey.expiring < cTime && cKey.expiring !== -1) {
    res.send('key is expired').status(403)
    return
  }

  if (!allowedKeys.has(cKey.apiKey)) {
    res.send('key is not allowed').status(403)
    return
  }

  const token = jwt.sign(cKey, config.secreteKey, {
    expiresIn: cKey.expiring !== -1 ? cKey.expiring - cTime : '1d'
  })
  
  return res
    .clearCookie('auth_disabled')
    .cookie('access_token', token)
    .status(200)
    .redirect('/')
}

function logout (req: Request, res: Response): void {
  const decoded = jwt.decode(req.cookies.access_token)

  if (decoded !== null && typeof decoded !== 'string') {
    allowedKeys.delete(decoded.apiKey)
  }

  res
    .clearCookie('access_token')
    .status(200)
    .redirect('/login')
}
