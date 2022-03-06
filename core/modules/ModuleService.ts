import fs, { Stats } from 'fs'
import path from 'path'

import LPTEService from '../eventbus/LPTEService'
import logging from '../logging'
import Module, { Plugin, PluginStatus } from './Module'
import ModuleType from './ModuleType'
import { EventType } from '../eventbus/LPTE'

const readdirPromise = fs.promises.readdir
const statPromise = fs.promises.stat
const log = logging('module-svc')

export class ModuleService {
  modules: Module[] = []
  activePlugins: Plugin[] = []

  public async initialize (): Promise<void> {
    log.info('Initializing module service.')

    // Register event handlers
    LPTEService.on('lpt', 'plugin-status-change', (event: any) => {
      // Get the plugin
      const plugin = this.activePlugins.filter(plugin => plugin.getModule().getName() === event.meta.sender.name)[0]

      // Check if we need to adapt the status here
      if (plugin.status !== event.status) {
        log.info(`Plugin status changed: plugin=${plugin.getModule().getName()}, old=${plugin.status}, new=${event.status as string}`)
        plugin.status = event.status
      }

      // Check if all plugins are ready now
      if (this.activePlugins.filter(plugin => plugin.status === PluginStatus.UNAVAILABLE).length === 0) {
        // Loading complete
        LPTEService.emit({
          meta: {
            namespace: 'lpt',
            type: 'ready',
            version: 1,
            channelType: EventType.BROADCAST
          }
        })
        log.debug('All plugins ready.')
      }
    })

    const modulePath = this.getModulePath()
    log.debug(`Modules path: ${modulePath}`)
    const data = await readdirPromise(modulePath)
    const allModules = await Promise.all(
      data.map(async (folderName) =>
        await this.handleFolder(path.join(modulePath, folderName))
      )
    )

    this.modules = allModules.filter((module) => module) as Module[]
    log.info(
      `Initialized ${this.modules.length} module(s). Now loading plugins.`
    )
    log.debug(
      `Modules initialized: ${this.modules
        .map(
          (module) =>
            `${module.getName()}/${module.getVersion()} [${module
              .getConfig()
              .modes.join(', ')}]`
        )
        .join(', ')}`
    )

    this.activePlugins = await this.loadPlugins()
    log.info(`Loaded ${this.activePlugins.length} plugin(s).`)
    log.debug(
      `Plugins loaded: ${this.activePlugins
        .map((plugin) => plugin.getModule().getName())
        .join(', ')}`
    )

    // Launch plugins
    this.activePlugins.forEach((plugin) => {
      plugin.initialize(this)
    })
  }

  public getModulePath (): string {
    return path.join(__dirname, '../../../modules')
  }

  private async loadPlugins (): Promise<Plugin[]> {
    const possibleModules = this.modules.filter((module) =>
      module.hasMode(ModuleType.PLUGIN)
    )

    return await Promise.all(
      possibleModules.map(async (module) => await this.loadPlugin(module))
    )
  }

  private async loadPlugin (module: Module): Promise<Plugin> {
    const plugin = new Plugin(module)

    module.plugin = plugin

    return plugin
  }

  private async handleFolder (folder: string): Promise<Module | null> {
    const statData = await statPromise(folder)

    if (!statData.isDirectory()) {
      log.debug(
        `Expected ${folder} to be a directory, but it wasn't. Skipping.`
      )
      return null
    }

    return await this.handleModule(folder)
  }

  private async handleModule (folder: string): Promise<Module | null> {
    const packageJsonPath = path.join(folder, 'package.json')

    let packageJsonStat: Stats
    try {
      packageJsonStat = await statPromise(packageJsonPath)
    } catch {
      log.debug(
        `Expected ${packageJsonPath} to exist, but it didn't. Skipping.`
      )
      return null
    }

    if (!packageJsonStat.isFile()) {
      log.debug(
        `Expected ${packageJsonPath} to be a file, but it wasn't. Skipping.`
      )
      return null
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJson = require(packageJsonPath)

    return new Module(packageJson, folder)
  }
}

const svc = new ModuleService()
export default svc
