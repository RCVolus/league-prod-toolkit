import minimist from 'minimist'
import { gt } from 'semver'
import { version } from '../package.json'

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
import axios from 'axios'
/* eslint-enable */

const log = logger('main')

log.info(' _          _       _____           _ _    _ _   ')
log.info('| |    ___ | |     |_   _|__   ___ | | | _(_) |_ ')
log.info('| |   / _ \\| |       | |/ _ \\ / _ \\| | |/ / | __|')
log.info('| |__| (_) | |___    | | (_) | (_) | |   <| | |_ ')
log.info('|_____\\___/|_____|   |_|\\___/ \\___/|_|_|\\_\\_|\\__|')
log.info('')

const checkVersion = async (): Promise<any> => {
  const res = await axios.get('https://prod-toolkit-latest.himyu.workers.dev/')

  if (res.status !== 200) {
    return log.warn('The current version could not be checked')
  }

  if (gt(version, res.data.tag_name)) {
    log.info('='.repeat(50))
    log.info(`There is a new version available: ${res.data.tag_name as string}`)
    log.info('='.repeat(50))
    log.info('')
  }
}

const main = async (): Promise<void> => {
  await checkVersion()

  lpteService.initialize()
  eventbusTransport.lpte = lpteService

  await moduleService.initialize()

  lpteService.once('lpt', 'ready', async () => {
    await runServer()
  })
}

main()
  .then(() => log.info('LoL Toolkit started up successfully.'))
  .catch((e) => {
    log.error('Startup failed, critical error: ', e)

    process.exit(1)
  })
