import express from 'express'
import path from 'path'
import http from 'http'
import * as WebSocket from 'ws'
import cookieParser from 'cookie-parser'

import logging from '../logging'
import globalContext from './globalContext'
import getController from './controller'
import { handleClient } from './ws'
import { LPTEService } from '../eventbus/LPTEService'
import { runAuth } from './auth'
import fileUpload, { UploadedFile } from 'express-fileupload'
import bodyParser from 'body-parser'

/**
 * App Variables
 */
const log = logging('server')
const app = express()
const port = process.env.PORT === undefined ? '3003' : process.env.PORT

const server = http.createServer(app)

/**
 * App Configuration
 */
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use('/static', express.static('dist/frontend'))
app.use(
  '/vendor/bootstrap',
  express.static(path.join(__dirname, '../../../node_modules/bootstrap/dist'))
)
app.use(
  '/vendor/jquery',
  express.static(path.join(__dirname, '../../../node_modules/jquery/dist'))
)
app.use(
  '/vendor/jspath',
  express.static(path.join(__dirname, '../../../node_modules/jspath'))
)
app.use(
  '/vendor/toastr',
  express.static(path.join(__dirname, '../../../node_modules/toastr/build'))
)
app.use(
  '/vendor/jwt-decode',
  express.static(path.join(__dirname, '../../../node_modules/jwt-decode/build'))
)

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

/**
 * Websocket Server
*/
export const wss = new WebSocket.Server({
  server,
  path: '/eventbus'
})

export let wsClients: WebSocket[] = []

wss.on('connection', (socket: WebSocket, requests) => {
  wsClients.push(socket)
  log.debug('Websocket client connected')

  socket.on('close', () => {
    wsClients = wsClients.filter(client => client !== socket)
    log.debug('Websocket client disconnected')
  })

  handleClient(socket)
})

/**
 * Uploads
*/

app.use(fileUpload({
  createParentPath: true
}))

app.post('/upload', async (req, res) => {
  if (req.files === undefined) {
    return res
      .status(401)
      .send('no file found')
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const file = req.files.file as UploadedFile
  await file.mv(path.join(__dirname, '..', '..', '..', 'modules', req.body.path, file.name))

  res.send({
    status: true,
    message: 'File is uploaded',
    data: {
      name: file.name,
      mimetype: file.mimetype,
      size: file.size
    }
  });
})

/**
 * Run server
 */
export const runServer = (lpteService: LPTEService): void => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  runAuth(lpteService, app, wss)

  /**
   * Routes
   */
  for (const [key, value] of Object.entries(getController(globalContext))) {
    app.use(key, value)
    log.debug(`Registered route: ${key}`)
  }

  server.listen(port, () => {
    log.info(`Listening for requests on http://localhost:${port}`)
  })
}
