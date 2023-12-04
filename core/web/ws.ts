import type { WebSocket } from 'ws'
import { EventType, type LPTEvent } from '../eventbus/LPTE.js'
import LPTEService, { isValidEvent } from '../eventbus/LPTEService.js'
import log from '../logging/logger.js'

const logger = log('ws')

export const handleClient = (socket: WebSocket): void => {
  socket.on('message', async (e: string) => {
    const event = JSON.parse(e) as LPTEvent

    if (!isValidEvent(event)) {
      logger.debug('received invalid event: ' + JSON.stringify(event))
      return
    }

    // Check if it's a subscribe event
    if (event.meta.namespace === 'lpte' && event.meta.type === 'subscribe') {
      if (event.to.type !== undefined && event.to.namespace !== undefined) {
        LPTEService.on(event.to.namespace, event.to.type, (listenedEvent) => {
          logger.debug(
            `Proxy response to WS for ${event.to.namespace as string} / ${
              event.to.type as string
            }`
          )
          socket.send(JSON.stringify(listenedEvent))
        })
        return
      }
    }
    if (
      event.meta.namespace === 'lpte' &&
      event.meta.type === 'subscribe-once'
    ) {
      if (event.to.type !== undefined && event.to.namespace !== undefined) {
        LPTEService.once(event.to.namespace, event.to.type, (listenedEvent) => {
          logger.debug(
            `Proxy response to WS for ${event.to.namespace as string}/${
              event.to.type as string
            }`
          )
          socket.send(JSON.stringify(listenedEvent))
        })
        return
      }
    }
    if (event.meta.channelType === EventType.REQUEST) {
      return await LPTEService.request(event)
    }

    LPTEService.emit(event)
  })
}
