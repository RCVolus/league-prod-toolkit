import axios from 'axios'
import fs from 'fs'
import { promisify } from 'util'
import path from 'path'
import { exec } from 'child_process'
import unzipper from 'unzipper'
import { createSpinner } from 'nanospinner'
import { Asset } from '../core/modules/Module'

const execPromise = promisify(exec)

if (process.argv.includes('-plugins')) {
  (async () => {
    await installPlugins()
    await run()
  })()
} else if (process.argv.includes('-install')) {
  run()
}

/**
 * get all available plugins modules and themes for the prod tool
 */
export async function getAll(): Promise<Asset[]> {
  let assets: Asset[] = []
  try {
    const url = `https://sweet-pond-bc97.tatrix42.workers.dev/`
    const req = await axios.get(url)

    if (req.status !== 200) return []

    assets = req.data.filter((a: any[]) => a !== null)
  } catch (e) {
    console.log(e.data?.message)
  }

  return assets
}

/**
 * downloads a single module plugin or theme
 * @param asset to download
 */
export async function download(asset: Asset): Promise<void> {
  const spinner = createSpinner(`downloading ${asset.name}`)
  spinner.start()

  const url = asset.download_url
  const dl = await axios.get(url, {
    responseType: 'stream'
  })

  if (dl.status !== 200) {
    spinner.error({ text: dl.statusText })
    return
  }
  let cwd = path.join(__dirname, '..', '..', 'modules')

  if (asset.name.startsWith('theme')) {
    cwd = path.join(cwd, 'plugin-theming', 'themes')
  }

  const savePath = path.join(cwd, `${asset.name}.zip`)
  const folderPath = path.join(cwd, asset.name)

  return await new Promise((resolve) => {
    dl.data.pipe(fs.createWriteStream(savePath))
    dl.data.on('end', async () => {
      spinner.update({
        text: `unpacking ${asset.name}`
      })
      await unpack(savePath, folderPath)

      if (!asset.name.startsWith('theme')) {
        spinner.update({ text: `installing dependency for ${asset.name}` })
        await execPromise('npm i --production', { cwd: folderPath })
      }

      spinner.success({
        text: `${asset.name} installed`
      })
      resolve()
    })
  })

  async function unpack(filepath: string, path: string): Promise<void> {
    return await new Promise((resolve) => {
      fs.createReadStream(filepath)
        .pipe(unzipper.Extract({ path, forceStream: true }))
        .on('finish', async () => {
          await fs.promises.unlink(filepath)
          resolve()
        })
    })
  }
}

async function run(): Promise<void> {
  const available = await getAll()

  const install = available.filter((a) => {
    return process.argv.includes(a.name)
  })

  for (const asset of install) {
    await download(asset)
  }
}

async function installPlugins(): Promise<void> {
  const available = await getAll()

  for (const asset of available) {
    if (!asset.name.startsWith('plugin')) continue

    await download(asset)
  }
}
