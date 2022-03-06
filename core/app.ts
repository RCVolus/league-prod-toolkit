import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))

if (argv.loglevel !== undefined) {
  process.env.LOGLEVEL = argv.loglevel
}

// This is needed so the logger can be set up in correct loglevel from the very beginning
/* eslint-disable */
import logger, { eventbusTransport } from './logging'
import { runServer } from './web/server'
import moduleService from './modules/ModuleService'
import lpteService from './eventbus/LPTEService'
/* eslint-enable */

const log = logger('main')

log.info(' _          _       _____           _ _    _ _   ')
log.info('| |    ___ | |     |_   _|__   ___ | | | _(_) |_ ')
log.info('| |   / _ \\| |       | |/ _ \\ / _ \\| | |/ / | __|')
log.info('| |__| (_) | |___    | | (_) | (_) | |   <| | |_ ')
log.info('|_____\\___/|_____|   |_|\\___/ \\___/|_|_|\\_\\_|\\__|')
log.info('')

const main = async (): Promise<void> => {
  await lpteService.initialize()
  eventbusTransport.lpte = lpteService

  await moduleService.initialize()

  lpteService.on('lpt', 'ready', () => {
    runServer(lpteService)
  })
}

main()
  .then(() => log.info('LoL Toolkit started up successfully.'))
  .catch(e => {
    log.error('Startup failed, critical error: ', e)

    process.exit(1)
  })
