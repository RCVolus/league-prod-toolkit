import { type LPTE, type LPTEvent, EventType, Registration } from './LPTE.js'
import logger from '../logging/index.js'
import { type Plugin } from '../modules/Module.js'
import ModuleType from '../modules/ModuleType.js'
import { wsClients } from '../web/server.js'
import uniqid from 'uniqid'

const log = logger('lpte-svc')

export const isValidEvent = (event: LPTEvent): boolean => {
  if (
    event.meta?.namespace === undefined ||
    event.meta.type === undefined
  ) {
    return false
  }

  return true
}

export class LPTEService implements LPTE {
  registrations: Registration[] = []
  eventHistory: LPTEvent[] = []

  constructor () {
    this.await = this.await.bind(this)
  }

  initialize (): void {
    log.info('Initialized event bus.')
  }

  on (namespace: string, type: string, handler: (e: LPTEvent) => void): void {
    const registration = new Registration(namespace, type, handler)
    this.registrations.push(registration)

    log.debug(
      `New event handler registered: namespace=${namespace}, type=${type}`
    )
  }

  once (namespace: string, type: string, handler: (e: LPTEvent) => void): void {
    const wrappedHandler = (e: LPTEvent): void => {
      log.debug(`Wrapped handler called for ${namespace}/${type}`)
      this.unregisterHandler(wrappedHandler)
      handler(e)
    }
    this.on(namespace, type, wrappedHandler)
  }

  async request (
    event: LPTEvent,
    timeout = 5000
  ): Promise<LPTEvent | undefined> {
    const reply = event.meta.reply ?? `${event.meta.type}-${uniqid()}`
    event.meta.reply = reply
    event.meta.channelType = EventType.REQUEST

    event.replay = (data) => {
      this.emit({
        meta: {
          type: reply,
          namespace: 'reply',
          version: 1
        },
        ...data
      })
    }

    this.emit(event)

    try {
      return await this.await('reply', reply, timeout)
    } catch {
      log.error(
        `Request timed out after ${timeout}ms. Request meta=${JSON.stringify(
          event.meta
        )}`
      )
      return undefined
    }
  }

  async await (
    namespace: string,
    type: string,
    timeout = 5000
  ): Promise<LPTEvent> {
    return await new Promise((resolve, reject) => {
      let wasHandled = false
      timeout = timeout > 60000 ? 60000 : timeout < 1000 ? 1000 : timeout

      const handler = (e: LPTEvent): void => {
        if (wasHandled) {
          return
        }
        wasHandled = true
        this.unregisterHandler(handler)

        resolve(e)
      }
      // Register handler
      this.on(namespace, type, handler)

      setTimeout(() => {
        if (wasHandled) {
          return
        }
        wasHandled = true
        this.unregisterHandler(handler)

        log.warn(
          `Awaiting event timed out. namespace=${namespace}, type=${type}, timeout=${timeout}`
        )
        reject(new Error('request timed out'))
      }, timeout)
    })
  }

  unregister (namespace: string, type: string): void {
    this.registrations = this.registrations.filter(
      (registration) =>
        registration.namespace !== namespace && registration.type !== type
    )
  }

  unregisterHandler (handler: (event: LPTEvent) => void): void {
    setTimeout(() => {
      this.registrations = this.registrations.filter(
        (registration) => registration.handle !== handler
      )
    }, 1000)
  }

  emit (event: LPTEvent): void {
    if (!isValidEvent(event)) {
      return
    }

    setTimeout(() => {
      // Find matching handlers
      const handlers = this.registrations.filter(
        (registration) =>
          registration.namespace === event.meta.namespace &&
          registration.type === event.meta.type
      )
      log.debug(
        `Found ${handlers.length} matching handlers for ${event.meta.namespace}/${event.meta.type}`
      )
      handlers.forEach((handler) => {
        try {
          handler.handle(event)
        } catch (e) {
          log.error('Uncaught error in handler: ', e)
          console.error(e)
        }
      })

      if (
        handlers.length === 0 &&
        event.meta.channelType === EventType.REQUEST
      ) {
        log.warn(
          `Request was sent, but no handler was executed. This will result in a timeout. Meta=${JSON.stringify(
            event.meta
          )}`
        )
      }

      // Push to websockets (currently only for logs)
      if (event.meta.namespace === 'log') {
        wsClients.forEach((socket) => {
          socket.send(JSON.stringify(event))
        })
      }

      // Push to history
      // this.eventHistory.push(event)
    }, 0)
  }

  forPlugin (plugin: Plugin): LPTE {
    const enrichEvent = (event: LPTEvent): LPTEvent => {
      return {
        ...event,
        meta: {
          channelType: EventType.BROADCAST,
          ...event.meta,
          sender: {
            name: plugin.getModule().getName(),
            version: plugin.getModule().getVersion(),
            mode: ModuleType.PLUGIN,
            path: plugin.getModule().getFolder()
          }
        }
      }
    }

    return {
      ...this,
      emit: (event: LPTEvent): void => {
        // Enrich with sender information
        this.emit(enrichEvent(event))
      },
      // eslint-disable-next-line @typescript-eslint/unbound-method
      on: this.on,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      unregister: this.unregister,
      request: async (
        event: LPTEvent,
        timeout?: number
      ): Promise<LPTEvent | undefined> => {
        // Enrich with sender information
        return await this.request(enrichEvent(event), timeout)
      },
      // eslint-disable-next-line @typescript-eslint/unbound-method
      await: this.await
    }
  }
}

const svc = new LPTEService()
export default svc
