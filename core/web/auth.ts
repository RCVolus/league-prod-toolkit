import { LPTEService } from '../eventbus/LPTEService'
import { IncomingMessage } from 'http'
import WebSocket from 'ws'
import uuidAPIKey from 'uuid-apikey'
import logging from '../logging'
import { OutgoingHttpHeaders } from 'http2'
import { Express, NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import config from '../../modules/plugin-config/config.json'

const log = logging('auth')

const allowedKeys: string[] = []

export function runAuth (lpte: LPTEService, server: Express, wss: WebSocket.Server): void {
  const authActive = true

  if (!authActive) return

  log.info('=========================')
  log.info('Authentication is enabled')

  const adminApiKey = uuidAPIKey.create()
  allowedKeys.push(adminApiKey.apiKey)

  log.info(`Admin API key: ${adminApiKey.apiKey}`)
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
}

function verifyWSClient (
  info: { origin: string, secure: boolean, req: IncomingMessage },
  done: (res: boolean, code?: number, message?: string, headers?: OutgoingHttpHeaders) => void
): void {
  if (!verify(info.req.url)) {
    return done(false, 403, 'authentication failed')
  }

  return done(true)
}

function verifyEPClient (req: Request, res: Response, next: NextFunction) {
  if (req.path.startsWith('/login')) return next()

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

    if (query.has('apikey') && allowedKeys.includes(query.get('apikey') as string)) {
      return true
    }
  }

  if (cookies?.access_token !== undefined) {
    try {
      jwt.verify(cookies.access_token, config.auth.secreteKey)
      return true
    } catch (e) {
      log.warn(e)
      return false
    }
  }

  return false
}

function login (req: Request, res: Response): void {
  const { apiKey } = uuidAPIKey.create()
  allowedKeys.push(apiKey)
  const user = {
    username: 'rcv',
    apiKey
  }

  const token = jwt.sign(user, config.auth.secreteKey)
  res
    .cookie('access_token', token)
    .status(200)
    .redirect('/')
}

function logout (req: Request, res: Response): void {
  const decoded = jwt.decode(req.cookies.access_token)

  if (decoded !== null && typeof decoded !== 'string') {
    allowedKeys.filter(k => k !== decoded.apiKey)
  }

  res
    .clearCookie('access_token')
    .status(200)
    .redirect('/login')
}
