import { Stats } from 'fs'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import LPTEService from '../eventbus/LPTEService.js'
import logging from '../logging/index.js'
import Module, { Plugin, PluginStatus, Asset, PackageJson } from './Module.js'
import ModuleType from './ModuleType.js'
import { EventType } from '../eventbus/LPTE.js'
import { download, getAll } from '../../scripts/install.js'
import { fileURLToPath } from 'url';
import { readJSON } from 'fs-extra/esm'

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const readdirPromise = readdir
const statPromise = stat
const log = logging('module-svc')

export class ModuleService {
  modules: Module[] = []
  assets: Asset[] = []
  activePlugins: Plugin[] = []

  public async initialize(): Promise<void> {
    log.info('Initializing module service.')

    // Register event handlers
    LPTEService.on('lpt', 'plugin-status-change', (event: any) => {
      // Get the plugin
      const plugin = this.activePlugins.filter(
        (plugin) => plugin.getModule().getName() === event.meta.sender.name
      )[0]

      // Check if we need to adapt the status here
      if (plugin.status !== event.status) {
        log.info(
          `Plugin status changed: plugin=${plugin.getModule().getName()}, old=${
            plugin.status
          }, new=${event.status as string}`
        )
        plugin.status = event.status
      }

      // Check if all plugins are ready now
      if (
        this.activePlugins.filter(
          (plugin) => plugin.status === PluginStatus.UNAVAILABLE
        ).length === 0
      ) {
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

    LPTEService.on('lpt', 'update-plugin', async (e) => {
      const activeIndex = this.activePlugins.findIndex(
        (a) => a.module.getName() === e.name
      )
      const moduleIndex = this.modules.findIndex(
        (a) => a.getName() === e.name
      )
      const active = this.activePlugins[activeIndex]

      if (active.module.asset !== undefined) {
        this.activePlugins.splice(activeIndex, 1)
        this.modules.splice(moduleIndex, 1)
        
        await this.install(active.module.asset)

        log.info(`plugin ${e.name as string} was updated`)

        return LPTEService.emit({
          meta: {
            namespace: 'lpt',
            type: 'plugin-updated',
            version: 1
          },
          name: e.name
        })
      }

      return LPTEService.emit({
        meta: {
          namespace: 'lpt',
          type: 'plugin updated failed',
          version: 1
        },
        error: 'no plugin could be found with that name'
      })
    })

    LPTEService.on('lpt', 'install-plugin', async (e) => {
      const asset = this.assets.find((a) => a.name === e.name)

      if (asset !== undefined) {
        try {
          await this.install(asset)

          return LPTEService.emit({
            meta: {
              namespace: 'lpt',
              type: 'plugin-installed',
              version: 1
            },
            name: e.name
          })
        } catch (_e) {}
      }

      return LPTEService.emit({
        meta: {
          namespace: 'lpt',
          type: 'plugin install failed',
          version: 1
        },
        error: 'no asset could be found with that name'
      })
    })

    const modulePath = this.getModulePath()
    log.debug(`Modules path: ${modulePath}`)

    this.assets = await this.getAssets()

    // load dir and make sure plugins start loading first
    const data = (await readdirPromise(modulePath)).sort((a, b) => {
      if (a < b) return 1
      else if (a > b) return -1
      return 0
    })

    const allModules = await Promise.all(
      data.map(
        async (folderName) =>
          await this.handleFolder(join(modulePath, folderName))
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
    this.activePlugins.forEach(async (plugin) => {
      await plugin.initialize()
    })
  }

  public async getAssets(): Promise<Asset[]> {
    return await getAll()
  }

  public getModulePath(): string {
    return join(__dirname, '../../../modules')
  }

  private async loadPlugins(): Promise<Plugin[]> {
    const possibleModules = this.modules.filter((module) =>
      module.hasMode(ModuleType.PLUGIN)
    )

    return await Promise.all(
      possibleModules.map(async (module) => await this.loadPlugin(module))
    )
  }

  private async loadPlugin(module: Module): Promise<Plugin> {
    const plugin = new Plugin(module)

    module.plugin = plugin

    return plugin
  }

  private async handleFolder(folder: string): Promise<Module | null> {
    const statData = await statPromise(folder)

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!statData.isDirectory()) {
      log.debug(
        `Expected ${folder} to be a directory, but it wasn't. Skipping.`
      )
      return null
    }

    return await this.handleModule(folder)
  }

  private async handleModule(folder: string): Promise<Module | null> {
    const packageJsonPath = join(folder, 'package.json')

    let packageJsonStat: Stats
    try {
      packageJsonStat = await statPromise(packageJsonPath)
    } catch {
      log.debug(
        `Expected ${packageJsonPath} to exist, but it didn't. Skipping.`
      )
      return null
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!packageJsonStat.isFile()) {
      log.debug(
        `Expected ${packageJsonPath} to be a file, but it wasn't. Skipping.`
      )
      return null
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJson = await readJSON(packageJsonPath) as PackageJson

    const index = this.assets.findIndex((a) => a.name === packageJson.name)
    let asset
    if (index !== -1) {
      asset = this.assets[index]
      this.assets.splice(index, 1)
    }

    return new Module(packageJson, folder, asset)
  }

  private async install(asset: Asset): Promise<void> {
    try {
      await download(asset)
      const module = await this.handleFolder(
        join(this.getModulePath(), asset.name)
      )

      if (module === null) throw Error('Module could not be loaded')

      const dependencies = module.getConfig().dependencies

      if (dependencies !== undefined && dependencies.length > 0) {
        for await (const dependency of dependencies) {
          const activeModule = this.modules.find(
            (m) => m.getName() === dependency
          )

          if (activeModule === undefined) {
            const asset = this.assets.find((a) => a.name === dependency)
            log.info(
              `Dependency ${dependency} is not installed, therefore will be installed now`
            )

            if (asset === undefined) {
              log.error(`Dependency ${dependency} could not be installed`)
            } else {
              await this.install(asset)
            }
          }
        }
      }

      const plugin = await this.loadPlugin(module)
      this.activePlugins.push(plugin)
      plugin.initialize()

      this.assets.slice(
        this.assets.findIndex((a) => a.name === asset.name),
        1
      )
      module.asset = asset
      this.modules.push(module)

      log.info(`${asset.name} was successfully installed`)
    } catch (error: any) {
      log.error(
        `Module ${asset.name} could not be installed: ${
          error.message as string
        }`
      )
    }
  }
}

const svc = new ModuleService()
export default svc
