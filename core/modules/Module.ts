import path from 'path'
import { Logger } from 'winston'

import ModuleType from './ModuleType'
import { ModuleService } from './ModuleService'
import lpteService from '../eventbus/LPTEService'
import logger from '../logging'
import { LPTE } from '../eventbus/LPTE'

export interface PackageJson {
  name: string
  version: string
  author: string
  toolkit: ToolkitConfig
}

export interface PluginConfig {
  main: string
}

export interface ToolkitConfig {
  modes: ModuleType[]
  plugin: undefined | PluginConfig
}

export default class Module {
  packageJson: PackageJson
  plugin: undefined | Plugin
  folder: string

  constructor (packageJson: any, folder: string) {
    this.packageJson = packageJson
    this.folder = folder
  }

  public getName (): string {
    return this.packageJson.name
  }

  public getVersion (): string {
    return this.packageJson.version
  }

  public getAuthor (): string {
    return this.packageJson.author
  }

  public getConfig (): ToolkitConfig {
    return this.packageJson.toolkit
  }

  public hasMode (mode: ModuleType): boolean {
    return this.getConfig().modes.includes(mode)
  }

  public hasPlugin (): boolean {
    return this.plugin !== undefined
  }

  public getPlugin (): Plugin | undefined {
    return this.plugin
  }

  public getFolder (): string {
    return this.folder
  }

  toJson (goDeep: boolean = true): any {
    return {
      name: this.getName(),
      version: this.getVersion(),
      author: this.getAuthor(),
      folder: this.getFolder(),
      config: this.getConfig(),
      plugin: goDeep ? this.getPlugin()?.toJson(false) : null
    }
  }
}

export enum PluginStatus {
  RUNNING = 'RUNNING',
  UNAVAILABLE = 'UNAVAILABLE'
}

export class PluginContext {
  log: Logger
  require: (file: string) => any
  LPTE: LPTE
  plugin: Plugin

  constructor (plugin: Plugin) {
    this.log = logger('plugin-' + plugin.getModule().getName())
    this.require = (file: string) => require(path.join(plugin.getModule().getFolder(), file))
    this.LPTE = lpteService.forPlugin(plugin)
    this.plugin = plugin
  }
}

export class Plugin {
  isLoaded = false
  status = PluginStatus.UNAVAILABLE
  module: Module
  context: undefined | PluginContext

  constructor (module: Module) {
    this.module = module
    this.isLoaded = true
  }

  getModule (): Module {
    return this.module
  }

  getPluginConfig (): any {
    return this.module.getConfig().plugin
  }

  getMain (): string {
    return this.getPluginConfig().main
  }

  toJson (goDeep: boolean = true): any {
    return {
      pluginConfig: this.getPluginConfig(),
      main: this.getMain(),
      module: goDeep ? this.getModule().toJson(false) : null,
      isLoaded: this.isLoaded,
      status: this.status
    }
  }

  initialize (svc: ModuleService): void {
    // Craft context
    this.context = new PluginContext(this)

    const mainFile = this.getMain()

    // eslint-disable-next-line
    const main = require(path.join(this.getModule().getFolder(), mainFile))

    // Execute main
    main(this.context)
  }
}
