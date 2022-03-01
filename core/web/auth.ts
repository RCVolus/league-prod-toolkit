import { LPTEService } from '../eventbus/LPTEService'
import http, { IncomingHttpHeaders, IncomingMessage } from 'http'
import WebSocket from 'ws'
import uuidAPIKey from 'uuid-apikey'
import logging from '../logging'
import { OutgoingHttpHeaders } from 'http2'

const log = logging('auth')

const allowedKeys: string[] = []

export function runAuth (lpte: LPTEService, server: http.Server, wss: WebSocket.Server): void {
  const authActive = true

  if (!authActive) return

  log.info('=========================')
  log.info('Authentication is enabled')

  const adminApiKey = uuidAPIKey.create()
  allowedKeys.push(adminApiKey.apiKey)

  log.info(`Admin API key: ${adminApiKey.apiKey}`)
  log.info('=========================')

  wss.options.verifyClient = verifyClient
}

function verifyClient (
  info: { origin: string; secure: boolean; req: IncomingMessage },
  done: (res: boolean, code?: number, message?: string, headers?: OutgoingHttpHeaders) => void
): void {
  if (!verify(info.req.headers, info.req.url)) {
    return done(false, 403, 'authentication failed')
  }

  done(true)
}

function verify (headers: IncomingHttpHeaders, url?: string): boolean {
  const queryString = url?.split('?')[1]

  if (queryString !== undefined) {
    const query = new URLSearchParams(queryString)

    if (query.has('apiKey') && allowedKeys.includes(query.get('apiKey') as string)) {
      return true
    }
  }

  if (headers['x-rcv-prod-tool-token'] !== undefined) {
    // TODO auth with header
  }

  return false
}