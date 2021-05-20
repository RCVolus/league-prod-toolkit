import express from 'express';
import path from 'path';
import http from 'http';
import * as WebSocket from 'ws';

import logging from '../logging';
import globalContext from './globalContext';
import getController from './controller';
import { handleClient } from './ws';

/**
 * App Variables
 */
const log = logging('server');
const app = express();
const port = process.env.PORT || '3003';

const server = http.createServer(app);

/**
 * App Configuration
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(
  '/vendor/bootstrap',
  express.static(path.join(__dirname, '../../../node_modules/bootstrap/dist'))
);
app.use(
  '/vendor/jquery',
  express.static(path.join(__dirname, '../../../node_modules/jquery/dist'))
);
app.use(
  '/vendor/jspath',
  express.static(path.join(__dirname, '../../../node_modules/jspath'))
);
app.use(
  '/vendor/toastr',
  express.static(path.join(__dirname, '../../../node_modules/toastr/build'))
);
app.use(express.json());

/**
 * Websocket Server
 */
export const wss = new WebSocket.Server({ server, path: '/eventbus' });

export let wsClients: Array<WebSocket> = [];
wss.on('connection', (socket: WebSocket) => {
  wsClients.push(socket);
  log.debug('Websocket client connected');

  socket.on('close', () => {
    wsClients = wsClients.filter(client => client !== socket);
    log.debug('Websocket client disconnected');
  });

  handleClient(socket)
});

/**
 * Routes
 */
for (let [key, value] of Object.entries(getController(globalContext))) {
  app.use(key, value);
  log.debug(`Registered route: ${key}`);
}

/**
 * Run server
 */
export const runServer = () => {
  server.listen(port, () => {
    log.info(`Listening for requests on http://localhost:${port}`);
  });
};
