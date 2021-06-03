import * as WebSocket from 'ws'
import { LPTEvent } from '../eventbus/LPTE'

import LPTEService, { isValidEvent } from '../eventbus/LPTEService'
import log from '../logging'
const logger = log('ws')

export const handleClient = (socket: WebSocket): void => {
  socket.on('message', e => {
    const event = JSON.parse(e as string) as LPTEvent

    if (!isValidEvent(event)) {
      logger.debug('received invalid event: ' + JSON.stringify(event))
      return
    }

    // Check if it's a subscribe event
    if (event.meta.namespace === 'lpte' && event.meta.type === 'subscribe') {
      if (event.to.type !== undefined && event.to.namespace !== undefined) {
        LPTEService.on(event.to.namespace, event.to.type, listenedEvent => {
          socket.send(JSON.stringify(listenedEvent))
        })
        return
      }
    }

    LPTEService.emit(event)
  })
}
