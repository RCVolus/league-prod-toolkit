import axios from 'axios'
import { createWriteStream, existsSync } from 'fs'
import { promisify } from 'util'
import { join } from 'path'
import { exec } from 'child_process'
import { extract } from 'zip-lib'
import { readJSON, remove } from 'fs-extra'
import { createSpinner } from 'nanospinner'
import type { Asset } from '../types'
import { satisfies } from 'semver'
import { version } from '../package.json'

const execPromise = promisify(exec)

if (process.argv.includes('-plugins')) {
  ;void (async () => {
    await installPlugins()
    await run()
  })()
} else if (process.argv.includes('-install')) {
  void run()
}

/**
 * get all available plugins modules and themes for the prod tool
 */
export async function getAll (): Promise<Asset[]> {
  let assets: Asset[] = []
  try {
    const url = 'https://modules.prod-toolkit.com/'
    const req = await axios.get(url)

    if (req.status !== 200) return []

    assets = req.data.filter((a: any[]) => a !== null)
  } catch (e: any) {
    console.log(e.data?.message)
  }

  return assets
}

/**
 * downloads a single module plugin or theme
 * @param asset to download
 */
export async function download (asset: Asset): Promise<void> {
  console.log(`Downloading ${asset.name}`)
  const spinner = createSpinner(`downloading ${asset.name}`)
  spinner.start()

  const url = asset.download_url
  const dl = await axios.get(url, {
    responseType: 'stream'
  })

  if (dl.status !== 200) {
    spinner.error({ text: dl.statusText })
    console.log(`Downloading ${asset.name} failed: ${dl.statusText} - ${dl.data as string}`)
    return
  }
  let cwd = join(__dirname, '..', '..', 'modules')

  if (asset.name.startsWith('theme')) {
    cwd = join(cwd, 'plugin-theming', 'themes')
  }

  const savePath = join(cwd, `${asset.name}.zip`)
  const folderPath = join(cwd, asset.name)
  const tmpPath = join(cwd, asset.name + '-tmp')
  const packagePath = join(tmpPath, 'package.json')

  await new Promise<void>((resolve, reject) => {
    dl.data.pipe(createWriteStream(savePath))
    dl.data.on('end', async () => {
      spinner.update({
        text: `unpacking ${asset.name}`
      })
      await extract(savePath, tmpPath)

      let requiredVersion

      if (existsSync(packagePath)) {
        requiredVersion = (await readJSON(packagePath))?.toolkit?.toolkitVersion
      }

      if (
        requiredVersion !== undefined &&
        !satisfies(version, requiredVersion)
      ) {
        spinner.error({
          text: `${asset.name} could not be installed`
        })
        await remove(savePath)
        await remove(tmpPath)
        reject(
          new Error(
            `The prod-tool (v${version}) has not the required version ${
              requiredVersion as string
            }`
          )
        )
      } else {
        await extract(savePath, folderPath, { overwrite: true })

        if (!asset.name.startsWith('theme')) {
          spinner.update({ text: `installing dependency for ${asset.name}` })
          await execPromise('npm i --production', { cwd: folderPath })
        }

        await remove(tmpPath)
        await remove(savePath)

        spinner.success({
          text: `${asset.name} installed`
        })
        resolve(undefined)
      }
    })
  })
}

async function run (): Promise<void> {
  const available = await getAll()

  const install = available.filter((a) => {
    return process.argv.includes(a.name)
  })

  for (const asset of install) {
    await download(asset)
  }
}

async function installPlugins (): Promise<void> {
  const available = await getAll()

  for (const asset of available) {
    if (!asset.name.startsWith('plugin')) continue

    await download(asset)
  }
}
