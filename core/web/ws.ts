import * as WebSocket from 'ws';

import LPTEService from '../eventbus/LPTEService'

export const handleClient = (socket: WebSocket): void => {
  socket.on('message', e => {
    const parsedRequest = JSON.parse(e as string);
    console.log(parsedRequest);

    LPTEService.emit(parsedRequest);
  })
}