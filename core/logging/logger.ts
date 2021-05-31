import winston, { Logger } from 'winston'
import Transport from 'winston-transport'

import { LPTE } from '../eventbus/LPTE'

const customFormat = winston.format.printf(
  ({ level, message, label, timestamp }) =>
    `${timestamp as string} [${level.padEnd(15)}] ${`\u001b[95m${label as string}\u001b[39m`.padEnd(
      22
    )}: ${message}`
)

export class EventbusTransport extends Transport {
  lpte?: LPTE

  constructor (opts: any = {}) {
    super(opts)

    this.log = this.log.bind(this)
  }

  log (info: any, callback: () => void): void {
    if (info.level.includes('error') as boolean && (this.lpte != null)) {
      this.lpte.emit({
        meta: {
          namespace: 'log',
          type: 'message',
          version: 1
        },
        log: info
      })
    }

    callback()
  }
}

export const eventbusTransport = new EventbusTransport()
eventbusTransport.setMaxListeners(100)

const createLogger = (label: string): Logger =>
  winston.createLogger({
    level: process.env.LOGLEVEL !== null ? process.env.LOGLEVEL : 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      customFormat
    ),
    defaultMeta: { label },
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log`
      // - Write all logs error (and below) to `error.log`.
      //
      // new winston.transports.File({ filename: 'error.log', level: 'error' }),
      // new winston.transports.File({ filename: 'combined.log' })
      new winston.transports.Console(),
      eventbusTransport
    ]
  })

export default (label: string): Logger => createLogger(label)
