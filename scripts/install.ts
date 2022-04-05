import axios from 'axios'
import fs from 'fs'
import { promisify } from 'util'
import path from 'path'
import { exec } from 'child_process'
import unzipper from 'unzipper'
import { createSpinner } from 'nanospinner'
import { Asset } from '../core/modules/Module'

const execPromise = promisify(exec)

const orga = 'rcv-prod-toolkit'

if (process.argv.includes('-plugins')) {
  installPlugins()
}

/**
 * get all available plugins modules and themes for the prod tool
 */
export async function getAll (): Promise<Asset[]> {
  let repos = []
  try {
    const url = `https://api.github.com/orgs/${orga}/repos`
    const req = await axios.get(url, {
      auth: {
        username: 'himyu',
        password: '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'
      }
    })

    if (req.status !== 200) return []

    repos = req.data.filter((r: any) => r.name.startsWith('plugin') as boolean || r.name.startsWith('module') || r.name.startsWith('theme')) as any[]
  } catch (e) {
    console.log(e.data?.message)
  }

  const assets: Asset[] = []

  for await (const repo of repos) {
    const latest = await getLatest(repo.name)

    if (latest === undefined || latest.assets === undefined) continue

    const asset: Asset = {
      name: repo.name,
      version: latest.tag_name,
      type: repo.name.split('-')[0],
      download_url: latest.assets[0].browser_download_url
    }
    assets.push(asset)
  }

  return assets
}

async function getLatest (name: string): Promise<any> {
  try {
    const url = `https://api.github.com/repos/${orga}/${name}/releases/latest`
    const req = await axios.get(url, {
      auth: {
        username: 'himyu',
        password: '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'
      }
    })

    if (req.status !== 200) return undefined
    return req.data
  } catch (e) {
    console.log(e.data?.message, name)
  }
}

/**
 * downloads a single module plugin or theme
 * @param asset to download
 */
export async function download (asset: Asset): Promise<void> {
  const url = asset.download_url
  const dl = await axios.get(url, {
    responseType: 'stream'
  })

  const spinner = createSpinner(`downloading ${asset.name}`)
  spinner.start()

  if (dl.status !== 200) return
  let cwd = path.join(__dirname, '..', 'modules', 'test')

  if (asset.name.startsWith('theme')) {
    cwd = path.join(cwd, 'plugin-themeing', 'themes')
  }

  const savePath = path.join(cwd, `${asset.name}.zip`)
  const folderPath = path.join(cwd, asset.name)
  dl.data.pipe(fs.createWriteStream(savePath))
  dl.data.on('end', async () => {
    spinner.update({
      text: `unpacking ${asset.name}`
    })
    await unpack(savePath, folderPath)
    spinner.update({ text: `installing dependency for ${asset.name}` })
    await execPromise('npm i --production', { cwd: folderPath })
    spinner.success()
  })

  async function unpack (filepath: string, path: string): Promise<void> {
    return await new Promise((resolve) => {
      fs.createReadStream(filepath)
        .pipe(unzipper.Extract({ path, forceStream: true }))
        .on('finish', async () => {
          await execPromise(`rm ${filepath}`)
          resolve()
        })
    })
  }
}

async function run (): Promise<void> {
  const available = await getAll()

  const install = available.filter(a => {
    return process.argv.includes(a.name)
  })

  for (const asset of install) {
    await download(asset)
  }
}

async function installPlugins(): Promise<void> {
  const available = (await getAll())

  for (const asset of available) {
    if (!asset.name.startsWith('plugin')) continue

    await download(asset)
  }
}