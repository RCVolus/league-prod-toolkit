import ModuleType from '../modules/ModuleType'

export enum EventType {
  BROADCAST = 'BROADCAST',
  REQUEST = 'REQUEST',
  REPLY = 'REPLY'
}

export interface LPTEventMeta {
  type: string
  namespace: string
  version: number

  sender?: {
    name: string
    version: string
    mode: ModuleType
    path?: string
  }
  channelType?: EventType
  reply?: string

  [name: string]: any
}

export interface LPTEvent {
  meta: LPTEventMeta

  [name: string]: any
  replay?: (data: {[name: string]: any}) => void
}

export interface LPTE {
  /**
   * Subscribe for events and register a callback handler
   * @param namespace
   * @param type the event type. You may use * to listen to all events in the namespace
   * @param handler the event handler method
   */
  on: (namespace: string, type: string, handler: (e: LPTEvent) => void) => void

  /**
   * Clears out all event handler registrations for the symbolized namespace and type. Please note that if you pass * as type, it does not unregister all
   * types, but simply the listener that listens to all events.
   * @param namespace
   * @param type the event type
   */
  unregister: (namespace: string, type: string) => void

  /**
   * Emits an event to the event handler
   * @param event the event to emit
   */
  emit: (event: LPTEvent) => void

  /**
   * Emits a request event, and waits for a response (or until timeout)
   * @param event the request event to send
   * @param timeout the amount of ms to wait until rejecting the promise because of timeout
   */
  request: (event: LPTEvent, timeout?: number) => Promise<LPTEvent | undefined>

  /**
   * Awaits until an event is emitted to the given namespace and type, or until timeout
   */
  await: (namespace: string, type: string, timeout?: number) => Promise<LPTEvent>
}

export class Registration {
  type: string
  namespace: string
  handle: (event: LPTEvent) => void

  constructor (namespace: string, type: string, handler: (event: LPTEvent) => void) {
    this.namespace = namespace
    this.type = type
    this.handle = handler
  }
}
