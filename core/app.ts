import minimist from 'minimist'

import logger, { eventbusTransport } from './logging'
import { runServer } from './web/server'
import moduleService from './modules/ModuleService'
import lpteService from './eventbus/LPTEService'

const argv = minimist(process.argv.slice(2))

const log = logger('main')

log.info(' _          _       _____           _ _    _ _   ')
log.info('| |    ___ | |     |_   _|__   ___ | | | _(_) |_ ')
log.info('| |   / _ \\| |       | |/ _ \\ / _ \\| | |/ / | __|')
log.info('| |__| (_) | |___    | | (_) | (_) | |   <| | |_ ')
log.info('|_____\\___/|_____|   |_|\\___/ \\___/|_|_|\\_\\_|\\__|')
log.info('')

const main = async () => {
  await lpteService.initialize()
  eventbusTransport.lpte = lpteService

  await moduleService.initialize()

  runServer()
}

main()
