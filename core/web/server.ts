import express from 'express'
import { join, relative, isAbsolute } from 'path'
import { createServer } from 'http'
import * as WebSocket from 'ws'
import cookieParser from 'cookie-parser'
import logging from '../logging'
import globalContext from './globalContext'
import getController from './controller'
import { handleClient } from './ws'
import svc from '../modules/ModuleService'
import { runAuth } from './auth'
import fileUpload, { type UploadedFile } from 'express-fileupload'
import { urlencoded } from 'body-parser'
import rateLimit from 'express-rate-limit'

/**
 * App Variables
 */
const log = logging('server')
const app = express()
const port = process.env.PORT ?? '3003'
const server = createServer(app)

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

/**
 * App Configuration
 */
app.set('views', join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use('/static', express.static('dist/frontend'))
app.use(
  '/vendor/bootstrap',
  express.static(join(__dirname, '../../../node_modules/bootstrap/dist'))
)
app.use(
  '/vendor/jquery',
  express.static(join(__dirname, '../../../node_modules/jquery/dist'))
)
app.use(
  '/vendor/jspath',
  express.static(join(__dirname, '../../../node_modules/jspath'))
)
app.use(
  '/vendor/toastr',
  express.static(join(__dirname, '../../../node_modules/toastr/build'))
)
app.use(
  '/vendor/jwt-decode',
  express.static(join(__dirname, '../../../node_modules/jwt-decode/build'))
)

app.use(express.json())
app.use(urlencoded({ extended: true }))
app.use(cookieParser())

/**
 * Websocket Server
 */
export const wss = new WebSocket.Server({
  server,
  path: '/eventbus'
})

export let wsClients: WebSocket[] = []

wss.on('connection', (socket: WebSocket, _requests) => {
  wsClients.push(socket)
  log.debug('Websocket client connected')

  socket.on('close', () => {
    wsClients = wsClients.filter((client) => client !== socket)
    log.debug('Websocket client disconnected')
  })

  handleClient(socket)
})

/**
 * Uploads
 */

app.use(
  fileUpload({
    createParentPath: true
  })
)

app.post('/upload', async (req, res) => {
  if (req.files === undefined) {
    return res.status(401).send('no file found')
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const file = req.files?.file as UploadedFile | undefined
  if (file === undefined) {
    return res.status(400).send()
  }
  if (!file.mimetype.startsWith('image')) {
    return res.status(400).send()
  }

  const filename = file.name
  const uploadPath = join(__dirname, '..', '..', '..', 'modules', req.body.path, filename)
  const relativePath = relative(svc.getModulePath(), uploadPath)

  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    return res.status(403).send()
  }

  await file.mv(
    uploadPath
  )

  res.send({
    status: true,
    message: 'File is uploaded',
    data: {
      name: file.name,
      mimetype: file.mimetype,
      size: file.size
    }
  })
})

/**
 * Run server
 */
export const runServer = async (): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  await runAuth(app, wss)

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
