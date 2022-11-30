import { join } from 'path'
import { Logger } from 'winston'

import lpteService from '../eventbus/LPTEService'
import logger from '../logging'
import { LPTE, ModuleType, PackageJson, Asset, ToolkitConfig, ModuleInterface, PluginInterface, PluginStatus, PluginContextInterface } from '../../types'
import { MultiBar } from 'cli-progress'
import progress from '../logging/progress'
import { gt } from 'semver'

export default class Module implements ModuleInterface {
  packageJson: PackageJson
  plugin: undefined | PluginInterface
  folder: string
  asset?: Asset
  updateAvailable: boolean

  constructor(packageJson: any, folder: string, asset?: Asset) {
    this.packageJson = packageJson
    this.folder = folder
    this.asset = asset

    if (this.asset?.version !== undefined) {
      this.updateAvailable = gt(this.asset?.version, this.packageJson.version)
    } else {
      this.updateAvailable = false
    }
  }

  public getName(): string {
    return this.packageJson.name
  }

  public getVersion(): string {
    return this.packageJson.version
  }

  public getNewestVersion(): string {
    return this.asset?.version ?? ''
  }

  public getAuthor(): string {
    return this.packageJson.author
  }

  public getConfig(): ToolkitConfig {
    return this.packageJson.toolkit
  }

  public hasMode(mode: ModuleType): boolean {
    return this.getConfig().modes.includes(mode)
  }

  public hasPlugin(): boolean {
    return this.plugin !== undefined
  }

  public getPlugin(): PluginInterface | undefined {
    return this.plugin
  }

  public getFolder(): string {
    return this.folder
  }

  toJson(goDeep: boolean = true): any {
    return {
      name: this.getName(),
      version: this.getVersion(),
      newestVersion: this.getNewestVersion(),
      author: this.getAuthor(),
      folder: this.getFolder(),
      config: this.getConfig(),
      plugin: goDeep ? this.getPlugin()?.toJson(false) : null
    }
  }
}

export class PluginContext implements PluginContextInterface {
  log: Logger
  require: (file: string) => any
  LPTE: LPTE
  plugin: Plugin
  progress: MultiBar

  constructor(plugin: Plugin) {
    this.log = logger(plugin.getModule().getName())
    this.require = (file: string) =>
      require(join(plugin.getModule().getFolder(), file))
    this.LPTE = lpteService.forPlugin(plugin)
    this.plugin = plugin
    this.progress = progress(plugin.module.getName())
  }
}

export class Plugin implements PluginInterface {
  isLoaded = false
  status = PluginStatus.UNAVAILABLE
  module: Module
  context: undefined | PluginContextInterface

  constructor(module: ModuleInterface) {
    this.module = module
    this.isLoaded = true
  }

  getModule(): Module {
    return this.module
  }

  getPluginConfig(): any {
    return this.module.getConfig().plugin
  }

  getMain(): string {
    return this.getPluginConfig().main
  }

  toJson(goDeep: boolean = true): any {
    return {
      pluginConfig: this.getPluginConfig(),
      main: this.getMain(),
      module: goDeep ? this.getModule().toJson(false) : null,
      isLoaded: this.isLoaded,
      status: this.status
    }
  }

  initialize(): void {
    // Craft context
    this.context = new PluginContext(this)

    const handleError = (e: any): void => {
      ;(this.context as PluginContext).log.error(
        `Uncaught error in ${this.module.getName()}: `,
        e
      )
      console.error(e)

      // Set plugin status to degraded, maybe functionality will not work anymore
      this.status = PluginStatus.DEGRADED
    }

    const mainFile = this.getMain()

    let main
    try {
      // eslint-disable-next-line
      main = require(join(this.getModule().getFolder(), mainFile))
    } catch (e) {
      handleError(e)
      return
    }

    // Execute main (and wrap it in a try / catch, so there cannot be an exception bubbling up)
    try {
      const response = main(this.context)

      if (response !== undefined && typeof response.catch === 'function') {
        response.catch((e: any) => handleError(e))
      }
    } catch (e) {
      handleError(e)
    }
  }
}
