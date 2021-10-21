import { EventType, LPTE, LPTEvent, Registration } from '../core/eventbus/LPTE'

// Setup toasts
if ((window as any).toastr !== undefined) {
  (window as any).toastr.options = {
    timeOut: '0',
    extendedTimeOut: '0',
    showDuration: '0',
    hideDuration: '0',
    positionClass: 'toast-top-right'
  }
}

class FrontendRegistration extends Registration {
  isOnce: boolean = false

  getSubscribeEvent (): LPTEvent {
    return {
      meta: {
        namespace: 'lpte',
        type: this.isOnce ? 'subscribe-once' : 'subscribe',
        version: 1
      },
      to: {
        namespace: this.namespace,
        type: this.type
      }
    }
  }
}

function randomId (): string {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0]
  return uint32.toString(16)
}

/**
 * This is the frontend library that is compatible with the backend syntax. It connects via websocket.
 */
class LPTEService implements LPTE {
  backend: string
  websocket: WebSocket
  registrations: FrontendRegistration[] = []
  readyHandler?: () => void

  constructor (backend: string) {
    this.backend = backend
    this.websocket = new WebSocket(backend)

    this._log = this._log.bind(this)
    this._onSocketOpen = this._onSocketOpen.bind(this)
    this._onSocketClose = this._onSocketClose.bind(this)
    this._onSocketError = this._onSocketError.bind(this)
    this._onSocketMessage = this._onSocketMessage.bind(this)
    this._reconnect = this._reconnect.bind(this)
    this._connect = this._connect.bind(this)

    this._connect()
  }

  _log (msg: string): void {
    console.log(`[LPTE] ${msg}`)
  }

  _onSocketOpen (): void {
    this._log('Websocket connected')

    // redo any registrations, in case this is a reconnect
    this.registrations.forEach(reg => this.websocket.send(JSON.stringify(reg.getSubscribeEvent())))

    if (this.readyHandler !== undefined) {
      this.readyHandler()
    }
  }

  _onSocketClose (): void {
    this._log('Websocket closed, attempting reconnect in 500ms')
    setTimeout(this._reconnect, 500)
  }

  _onSocketError (e: Event): void {
    this._log(`Websocket error: ${JSON.stringify(e)}`)
  }

  _onSocketMessage (e: any): void {
    const event: LPTEvent = JSON.parse(e.data)

    this.registrations.filter(reg => reg.namespace === event.meta.namespace && reg.type === event.meta.type).forEach(reg => {
      reg.handle(event)
    })
  }

  _reconnect (): void {
    this.websocket = new WebSocket(this.backend)
    this._connect()
  }

  _connect (): void {
    this.websocket.onopen = this._onSocketOpen
    this.websocket.onclose = this._onSocketClose
    this.websocket.onerror = this._onSocketError
    this.websocket.onmessage = this._onSocketMessage
  }

  onready (handler: () => void): void {
    if (this.websocket.readyState === this.websocket.OPEN) {
      handler()
    } else {
      this.readyHandler = handler
    }
  }

  unregisterHandler (handler: (event: LPTEvent) => void): void {
    setTimeout(() => {
      this.registrations = this.registrations.filter(registration => registration.handle !== handler)
    }, 1000)
  }

  on (namespace: string, type: string, handler: (event: LPTEvent) => void, isOnce = false): void {
    const registration = new FrontendRegistration(namespace, type, handler)
    registration.isOnce = isOnce

    this.registrations.push(registration)

    this.websocket.send(JSON.stringify(registration.getSubscribeEvent()))
  }

  unregister (namespace: string, type: string): void {
    this._log('Unregister is currently not supported')
  }

  emit (event: LPTEvent): void {
    this.websocket.send(JSON.stringify(event))
  }

  async request (event: LPTEvent, timeout: number = 5000): Promise<LPTEvent> {
    const reply = `${event.meta.type}-${randomId()}`
    event.meta.reply = reply
    event.meta.channelType = EventType.REQUEST

    setTimeout(() => {
      this.emit(event)
    }, 0)

    try {
      return await this.await('reply', reply, timeout)
    } catch {
      throw new Error('request timed out')
    }
  }

  async await (namespace: string, type: string, timeout: number = 5000): Promise<LPTEvent> {
    return await new Promise((resolve, reject) => {
      let wasHandled = false

      const handler = (e: LPTEvent): void => {
        if (wasHandled) {
          return
        }
        wasHandled = true
        this.unregisterHandler(handler)

        resolve(e)
      }
      // Register handler
      this.on(namespace, type, handler, true)

      setTimeout(() => {
        if (wasHandled) {
          return
        }
        wasHandled = true
        this.unregisterHandler(handler)
        reject(new Error('request timed out'))
      }, timeout)
    })
  }
}

(window as any).LPTE = new LPTEService(`ws${location.origin.startsWith('https://') ? 's' : ''}://${location.host}/eventbus`)

/* const postJson = (url, request) => {
  var headers = new Headers()
  headers.append('Content-Type', 'application/json')

  var body = JSON.stringify(request)

  var requestOptions = {
    method: 'POST',
    headers,
    body,
    redirect: 'follow'
  }

  return fetch(url, requestOptions)
    .then(response => response.json())
}

window.LPTE.request = async request => {
  return await postJson('/api/events/request', request)
}

window.LPTE.emit = async request => {
  return await postJson('/api/events/ingest', request)
}

const connect = () => {
  window.LPTE.websocket = new WebSocket()

  window.LPTE.websocket.onopen = () => {
    console.log('Websocket opened')
  }
  window.LPTE.websocket.onclose = () => {
    console.log('Websocket closed')
    setTimeout(connect, 500)
    console.log('Attemting reconnect in 500ms')
  }
  window.LPTE.websocket.onerror = (error) => {
    console.log('Websocket error: ' + JSON.stringify(error))
  }

  window.LPTE.websocket.onmessage = msg => {
    const data = JSON.parse(msg.data)

    console.log(msg.data)

    if (data.meta.namespace === 'log') {
      if (data.log.level.includes('error')) {
        toastr.error(data.log.message, 'Error')
      }
    }
  }
}
connect()

const oneWayBinding = (container, data) => {
  const containerDom = $(`#${container}`)

  containerDom.find('*').each((index, child) => {
    const childDom = $(child)
    const dataName = childDom.attr('data-jspath')
    if (dataName) {
      let value = JSPath.apply(dataName, data)
      if (value.length > 0) {
        value = value[0]
      } else {
        value = ''
      }

      if (childDom.attr('data-isdate') !== undefined) {
        value = new Date(value).toString()
      }

      if (childDom.attr('data-isteam') !== undefined) {
        value = value === 100 ? 'blue' : 'red'
      }

      childDom.text(value)
    }
  })
} */
