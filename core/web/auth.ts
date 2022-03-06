import { LPTEService } from '../eventbus/LPTEService'
import { IncomingHttpHeaders, IncomingMessage } from 'http'
import WebSocket from 'ws'
import uuidAPIKey from 'uuid-apikey'
import logging from '../logging'
import { OutgoingHttpHeaders } from 'http2'
import { Express, NextFunction, Request, Response } from 'express'

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
}

function verifyWSClient (
  info: { origin: string, secure: boolean, req: IncomingMessage },
  done: (res: boolean, code?: number, message?: string, headers?: OutgoingHttpHeaders) => void
): void {
  if (!verify(info.req.headers, info.req.url)) {
    return done(false, 403, 'authentication failed')
  }

  return done(true)
}

function verifyEPClient (req: Request, res: Response, next: NextFunction) {
  if (req.path.startsWith('/auth')) return next()

  if (!verify(req.headers, req.url)) {
    return res
      .send({ success: false, message: 'authentication failed' })
      .status(403)
  }

  return next()
}

function verify (headers: IncomingHttpHeaders, url?: string): boolean {
  const queryString = url?.split('?')[1]

  if (queryString !== undefined) {
    const query = new URLSearchParams(queryString)

    if (query.has('apikey') && allowedKeys.includes(query.get('apikey') as string)) {
      return true
    }
  }

  if (headers['x-rcv-prod-tool-token'] !== undefined) {
    // TODO auth with header
  }

  return false
}