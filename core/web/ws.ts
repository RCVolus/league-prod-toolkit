import * as WebSocket from 'ws'
import { LPTEvent } from '../eventbus/LPTE'

import LPTEService, { isValidEvent } from '../eventbus/LPTEService'

export const handleClient = (socket: WebSocket): void => {
  socket.on('message', e => {
    const event = JSON.parse(e as string)

    if (!isValidEvent(event)) {
      return
    }

    // Check if it's a subscribe event
    if (event.meta.namespace === 'lpte' && event.meta.type === 'subscribe') {
      if (event.to.type && event.to.namespace) {
        LPTEService.on(event.to.namespace, event.to.type, listenedEvent => {
          console.log('hehe')
          socket.send(JSON.stringify(listenedEvent))
        })
        return
      }
    }

    LPTEService.emit(event)
  })
}
