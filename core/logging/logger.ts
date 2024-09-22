import winston, { type Logger } from 'winston'
import Transport from 'winston-transport'

import { type LPTE } from '../eventbus/LPTE'

const customFormat = winston.format.printf(
  ({ level, message, label, timestamp }) =>
    `${timestamp as string} [${level.padEnd(15)}] ${`\u001b[95m${label as string
      }\u001b[39m`.padEnd(22)}: ${message as string}`
)

export class EventbusTransport extends Transport {
  lpte?: LPTE

  constructor (opts: any = {}) {
    super(opts)

    this.log = this.log.bind(this)
  }

  log (info: any, callback: () => void): void {
    if ((info.level.includes('error') as boolean) && this.lpte != null) {
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
    level: process.env.LOGLEVEL ?? 'info',
    defaultMeta: { label },
    transports: [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        zippedArchive: true,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(info => `${info.timestamp as string} [${info.level}] ${info.label as string}: ${info.message as string}`
          )
        )
      }),
      new winston.transports.File({
        filename: 'logs/logs.log',
        zippedArchive: true,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(info => `${info.timestamp as string} [${info.level}] ${info.label as string}: ${info.message as string}`
          )
        )
      }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          customFormat
        )
      }),
      eventbusTransport
    ]
  })

export default (label: string): Logger => createLogger(label)
