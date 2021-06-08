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
    if (event.meta.namespace === 'lpte' && event.meta.type === 'subscribe-once') {
      if (event.to.type !== undefined && event.to.namespace !== undefined) {
        LPTEService.once(event.to.namespace, event.to.type, listenedEvent => {
          socket.send(JSON.stringify(listenedEvent))
        })
        return
      }
    }

    /* / Check if it's a request event
    if (event.meta.channelType === EventType.REQUEST) {
      // if it is, make sure the reply will be forwarded
      LPTEService.once('reply', event.meta.reply as string, (listenedEvent: LPTEvent) => {
        console.log(listenedEvent)
        socket.send(JSON.stringify(listenedEvent))
      })
    } */

    LPTEService.emit(event)
  })
}
